# Car Dealership Inventory System — Project Study Guide

**Subject:** Full-Stack Web Development with TDD  
**Technologies:** Node.js / TypeScript / Express / SQLite / JWT / React / Tailwind CSS  
**Methodology:** Test-Driven Development (Red-Green-Refactor)

---

## Part 1: System Architecture

### Overall Architecture

This is a **monorepo** containing two separate applications:
- `backend/` — RESTful API server (Express + TypeScript + SQLite)
- `frontend/` — Single-Page Application (React + Vite + Tailwind)

They communicate over HTTP: the React frontend sends authenticated fetch requests to the Express API.

### Request Flow

```
Browser → React SPA
  → fetch('/api/...') with JWT Bearer token
    → Vite Dev Server (proxy to :5000)
  → Express Router
    → JWT Middleware (authenticate)
    → [Optional] Admin Guard (requireAdmin)
    → Zod Validation Middleware
    → Controller Function
    → SQLite Model (async query)
    → JSON Response
```

### Database Design Decisions

**Why SQLite?**
- Assignment requires local database, no server setup needed
- SQLite with WAL mode is surprisingly fast for read-heavy workloads
- The `sqlite` npm package provides a clean Promise-based wrapper around `sqlite3`

**Why not `better-sqlite3`?**
- `better-sqlite3` requires native C++ compilation (node-gyp + Visual Studio)
- This fails on Windows without explicit build tools installed
- `sqlite3` + `sqlite` wrapper uses precompiled binaries — zero native compilation

**Why singleton pattern for the database?**
```typescript
let db: DB | null = null;

export const connectDB = async (customPath?: string): Promise<DB> => {
  if (db && customPath) { await db.close(); db = null; } // re-init for tests
  if (db) return db;
  // ... open database ...
  db = database;
  return db;
};
```
- The singleton ensures only one connection exists per process
- `customPath` allows each test file to use an isolated SQLite file
- `closeDB()` resets the singleton so the next test file starts fresh

---

## Part 2: Authentication System

### JWT Flow

```
POST /api/auth/register or /api/auth/login
  → Validate credentials (Zod)
  → Hash password (bcrypt, 10 rounds) or verify hash
  → Create user in DB / find existing user
  → Sign JWT { id, email, role } with 24-hour default expiry
  → Return { user, token }

Client stores token in localStorage.

GET /api/auth/me (or any protected route)
  → Extract "Authorization: Bearer <token>" header
  → jwt.verify(token, JWT_SECRET)
  → Attach decoded payload to req.user
  → Call next()
```

### JWT Middleware Implementation

```typescript
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};
```

**Key decisions:**
- Returns **401** when no token is present (not authenticated)
- Returns **403** when token is present but invalid/expired (forbidden)
- The distinction matters for proper HTTP semantics

### Admin Role System

```typescript
// In register controller:
const ADMIN_CODE = process.env.ADMIN_REGISTRATION_CODE;
if (role === 'admin' && (!ADMIN_CODE || adminCode !== ADMIN_CODE)) {
  return res.status(403).json({ message: 'A valid admin registration code is required' });
}
const finalRole = role === 'admin' ? 'admin' : 'user';
```

Admin code is read **inside the function** (not at module load time) so test environment variables take effect. The API has no built-in registration code; configure one privately in `backend/.env`. The vehicle routes also enforce the admin role server-side for create, update, delete, and restock actions.

---

## Part 3: Test-Driven Development

### TDD Cycle Applied

**1. RED Phase** — Write a failing test:
```typescript
it('should register a new user and return 201 with user data and token', async () => {
  const res = await request(app).post('/api/auth/register').send(validUser);
  expect(res.status).toBe(201);           // FAILS: no route exists yet
  expect(res.body.data).toHaveProperty('token'); // FAILS
});
```

**2. GREEN Phase** — Minimum implementation:
```typescript
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ username, email, password: hashed, role: 'user' });
  const token = signToken({ id: user.id, username, email, role: 'user' });
  res.status(201).json({ success: true, data: { user, token } });
};
```

**3. REFACTOR Phase** — Clean up, add edge case handling:
- Add duplicate email/username detection (409)
- Add admin code logic
- Add Zod validation middleware

### Test Isolation Strategy

Each test file uses its own SQLite database file:
```typescript
const TEST_DB_PATH = path.resolve(__dirname, '../data/auth_test.sqlite');

beforeAll(async () => {
  await connectDB(TEST_DB_PATH);  // opens fresh database
});

afterAll(async () => {
  await closeDB();                // closes connection
  fs.unlinkSync(TEST_DB_PATH);   // deletes test database file
});
```

Tests run in band (`--runInBand`) to prevent concurrent SQLite access issues.

### Test Coverage Summary

The verified backend coverage run on 2026-10-25 reports 85.19% statements, 65.04% branches, 92.85% functions, and 84.83% lines. The current test report records the exact commands and scope. The frontend has a small component suite for inventory stock and admin controls; it is not an end-to-end browser suite.

---

## Part 4: API Design

### RESTful Resource Design

```
/api/auth/register    POST  - Create user resource
/api/auth/login       POST  - Create session (returns token)
/api/auth/me          GET   - Read current user resource

/api/vehicles         GET   - List vehicle collection (paginated)
/api/vehicles         POST  - Create vehicle resource
/api/vehicles/search  GET   - Filtered subset of collection
/api/vehicles/:id     GET   - Read single vehicle resource
/api/vehicles/:id     PUT   - Update vehicle resource
/api/vehicles/:id     DELETE - Destroy vehicle resource

/api/vehicles/:id/purchase  POST - Sub-resource action (stock decrement)
/api/vehicles/:id/restock   POST - Sub-resource action (stock increment)
```

### Input Validation with Zod

```typescript
export const vehicleSchema = z.object({
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  category: z.enum(['Sedan', 'SUV', 'Truck', 'Coupe', 'Van', 'Electric', 'Hybrid']),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  description: z.string().max(1000).optional().default(''),
  image_url: z.string().url().optional().or(z.literal('')).default(''),
});
```

Validation happens via middleware **before** the controller, keeping controllers clean.

### Pagination Implementation

```typescript
// VehicleModel.findAll
const offset = (page - 1) * limit;
const vehicles = await db.all('SELECT * FROM vehicles ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
const countRow = await db.get('SELECT COUNT(*) as count FROM vehicles');
const total = countRow?.count || 0;
return { data: vehicles, total, page, limit, totalPages: Math.ceil(total / limit) };
```

---

## Part 5: Frontend Architecture

### Component Hierarchy

```
App
└── AuthProvider (React Context)
    └── AppInner
        ├── AuthPage (if not authenticated)
        │   ├── LoginForm
        │   └── RegisterForm
        └── Dashboard (if authenticated)
            ├── Navbar (logout, admin badge)
            ├── SearchFilterBar
            ├── Stats panels (total, in stock, out of stock)
            ├── Vehicle grid
            │   └── VehicleCard × N
            ├── Pagination
            └── Modals (Add, Edit, Delete, Purchase, Restock)
```

### State Management (No Redux)

State is managed at three levels:
1. **Auth state** — React Context (`AuthContext`) — user, token, isLoading
2. **Vehicle data** — Custom hook (`useVehicles`) — vehicles array, pagination, loading/error
3. **UI state** — Local component state in Dashboard — open modals, filter values, toast

This avoids Redux/Zustand complexity while keeping separation of concerns.

### API Client Design

```typescript
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;  // allows callers to catch and display meaningful messages
  }
  return data;
}
```

---

## Part 6: Likely Interview Questions

### Q1: Why use SQLite instead of PostgreSQL/MySQL?

**A:** For this assignment, SQLite is appropriate because:
- No external database server required (zero infrastructure)
- Single-file database simplifies deployment and testing
- Sufficient performance for a dealership scale (thousands of vehicles)
- WAL mode enables concurrent reads

In a production multi-server deployment, I'd migrate to PostgreSQL for concurrent write support, connection pooling, and better backup tooling.

### Q2: Explain how JWT authentication works in this project.

**A:** After login, the server signs a JWT containing `{id, email, role}` using the configured secret. The client stores this token in localStorage and sends it as `Authorization: Bearer <token>` on every subsequent request. The middleware calls `jwt.verify()` to validate the token without a database lookup, then attaches the decoded payload to `req.user`.

Trade-offs: JWTs can't be revoked before expiry. For production, I'd add a token blacklist or use short-lived access tokens + refresh tokens.

### Q3: How does the test isolation work across test files?

**A:** Each test file calls `connectDB(uniquePath)` in `beforeAll`, which closes any existing connection and opens a fresh SQLite file. Tests within each file use `afterEach` to `DELETE` all rows (resetting state without closing). `afterAll` closes the connection and deletes the file. Running Jest `--runInBand` ensures files run sequentially, avoiding SQLite concurrent access issues.

### Q4: What is the difference between 401 and 403?

**A:**
- **401 Unauthorized** — The client is not authenticated (no token, or malformed Authorization header). "Who are you?"
- **403 Forbidden** — The client is authenticated but doesn't have permission (invalid/expired token, or user lacks admin role). "I know who you are, but you can't do this."

### Q5: Why write tests before implementation (TDD)?

**A:** TDD forces you to think about the API contract before implementation details. By writing `expect(res.status).toBe(201)` first, you define what "success" means. This leads to cleaner interfaces and catches regressions early. The Red-Green-Refactor cycle ensures every test was once failing (proving it actually tests something real).

### Q6: How does the `useVehicles` custom hook work?

**A:** It encapsulates all vehicle-related async operations (fetch, search, create, update, delete, purchase, restock) and their loading/error states. The Dashboard component calls `fetchVehicles()` on mount and uses the returned `vehicles` array to render cards. When a mutation occurs (e.g., purchase), the hook updates the local `vehicles` state immediately using `setVehicles(prev => prev.map(...))` — this is optimistic UI without a full refetch.

### Q7: Explain pagination design.

**A:** Pagination is server-side. The client sends `?page=1&limit=12`. The SQL uses `LIMIT limit OFFSET (page-1)*limit`. The response includes `{ data, total, page, limit, totalPages }` so the client knows how many pages exist. The frontend `Pagination` component renders page buttons with ellipsis for large ranges.

### Q8: How would you scale this to production?

**A:**
1. Replace SQLite with PostgreSQL + connection pooling (pg + Knex or Prisma)
2. Add Redis for JWT blacklisting and caching
3. Containerize with Docker (separate containers for API, DB)
4. Add rate limiting (express-rate-limit) to prevent abuse
5. Use environment-specific configs (not .env files in production — use secrets management)
6. Add request logging (Morgan + Winston)
7. Add CI/CD pipeline (GitHub Actions) running tests on every PR

---

## Appendix: Git Commit History

The repository contains incremental setup, test, implementation, and documentation commits. Inspect its actual state with `git log --oneline`; commit count and co-author metadata should be described from the repository rather than assumed.

```
chore:  — setup, configuration, dependencies
feat:   — new features
test:   — test additions/changes
refactor: — code improvements without behavior change
fix:    — bug fixes
docs:   — documentation
```

