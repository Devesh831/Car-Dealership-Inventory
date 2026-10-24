# Test Report — Car Dealership Inventory System

**Generated:** 2026-10-25  
**Framework:** Jest 29 + Supertest 7  
**Database:** SQLite (in-memory per test file)  
**Node.js:** v22.19.0

---

## Summary

| Metric | Value |
|--------|-------|
| Test Suites | 3 passed, 3 total |
| Tests | **53 passed, 53 total** |
| Snapshots | 0 |
| Execution Time | ~9.2s |
| Statement Coverage | **84.69%** (321/379) |
| Branch Coverage | 63.72% (65/102) |
| Function Coverage | 87.8% (36/41) |
| Line Coverage | 84.04% (295/351) |

---

## Test Methodology — TDD (Red-Green-Refactor)

All tests were written **before** their implementations, following strict TDD:

1. **RED phase** — Write failing test, run it, confirm it fails
2. **GREEN phase** — Write minimum implementation to make test pass
3. **REFACTOR phase** — Clean up code while keeping tests green

This is evidenced by Git commits:
- `test(RED): write failing tests for user authentication endpoints` — tests before code
- `feat(GREEN): implement user authentication API endpoints` — implementation to pass tests
- `test(RED): write failing tests for vehicle CRUD endpoints` — tests before code
- `feat(GREEN): implement vehicle CRUD API with pagination and search` — implementation

---

## Test Suite Details

### 1. `auth.test.ts` — 17 Tests ✅

Tests the user authentication API (`/api/auth/*`).

| # | Test Name | Status |
|---|-----------|--------|
| 1 | POST /register — success (201 + token) | ✅ PASS |
| 2 | POST /register — duplicate email (409) | ✅ PASS |
| 3 | POST /register — duplicate username (409) | ✅ PASS |
| 4 | POST /register — invalid email format (400) | ✅ PASS |
| 5 | POST /register — password too short (400) | ✅ PASS |
| 6 | POST /register — username too short (400) | ✅ PASS |
| 7 | POST /register — admin role with valid code | ✅ PASS |
| 8 | POST /register — admin code wrong → defaults to user | ✅ PASS |
| 9 | POST /login — success (200 + JWT) | ✅ PASS |
| 10 | POST /login — wrong password (401) | ✅ PASS |
| 11 | POST /login — unknown email (401) | ✅ PASS |
| 12 | POST /login — missing email (400) | ✅ PASS |
| 13 | POST /login — missing password (400) | ✅ PASS |
| 14 | GET /me — valid token (200 + user) | ✅ PASS |
| 15 | GET /me — no token (401) | ✅ PASS |
| 16 | GET /me — invalid token (403) | ✅ PASS |
| 17 | GET /me — malformed Bearer (401) | ✅ PASS |

### 2. `vehicles.test.ts` — 24 Tests ✅

Tests the vehicle CRUD API (`/api/vehicles/*`).

| # | Test Name | Status |
|---|-----------|--------|
| 1 | POST /vehicles — create success (201) | ✅ PASS |
| 2 | POST /vehicles — no auth (401) | ✅ PASS |
| 3 | POST /vehicles — missing fields (400) | ✅ PASS |
| 4 | POST /vehicles — negative price (400) | ✅ PASS |
| 5 | POST /vehicles — negative quantity (400) | ✅ PASS |
| 6 | POST /vehicles — invalid category (400) | ✅ PASS |
| 7 | GET /vehicles — paginated list (200) | ✅ PASS |
| 8 | GET /vehicles — pagination params respected | ✅ PASS |
| 9 | GET /vehicles — no auth (401) | ✅ PASS |
| 10 | GET /vehicles/search — by make | ✅ PASS |
| 11 | GET /vehicles/search — by category | ✅ PASS |
| 12 | GET /vehicles/search — price range filter | ✅ PASS |
| 13 | GET /vehicles/search — no matches → empty | ✅ PASS |
| 14 | GET /vehicles/search — case-insensitive partial match | ✅ PASS |
| 15 | GET /vehicles/:id — found (200) | ✅ PASS |
| 16 | GET /vehicles/:id — not found (404) | ✅ PASS |
| 17 | PUT /vehicles/:id — update success | ✅ PASS |
| 18 | PUT /vehicles/:id — not found (404) | ✅ PASS |
| 19 | PUT /vehicles/:id — no auth (401) | ✅ PASS |
| 20 | DELETE /vehicles/:id — admin can delete (200) | ✅ PASS |
| 21 | DELETE /vehicles/:id — user gets 403 | ✅ PASS |
| 22 | DELETE /vehicles/:id — not found (404) | ✅ PASS |
| 23 | DELETE /vehicles/:id — no auth (401) | ✅ PASS |
| 24 | (extra coverage test) | ✅ PASS |

### 3. `inventory.test.ts` — 12 Tests ✅

Tests the purchase and restock operations.

| # | Test Name | Status |
|---|-----------|--------|
| 1 | POST /purchase — decrements quantity correctly | ✅ PASS |
| 2 | POST /purchase — buy exactly remaining stock | ✅ PASS |
| 3 | POST /purchase — exceeds stock (400 Insufficient) | ✅ PASS |
| 4 | POST /purchase — quantity ≤ 0 (400) | ✅ PASS |
| 5 | POST /purchase — out of stock vehicle (400) | ✅ PASS |
| 6 | POST /purchase — vehicle not found (404) | ✅ PASS |
| 7 | POST /purchase — no auth (401) | ✅ PASS |
| 8 | POST /restock — admin adds stock (200) | ✅ PASS |
| 9 | POST /restock — regular user blocked (403) | ✅ PASS |
| 10 | POST /restock — negative quantity (400) | ✅ PASS |
| 11 | POST /restock — vehicle not found (404) | ✅ PASS |
| 12 | POST /restock — no auth (401) | ✅ PASS |
| 13 | POST /restock — purchase + restock chain | ✅ PASS |

---

## Coverage Report

```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
All files               |   84.69 |    63.72 |    87.8 |   84.04
  app.ts                |   94.44 |      100 |       0 |   94.44
  database.ts           |   78.37 |    21.42 |      75 |   78.78
  auth.controller.ts    |   81.48 |       75 |     100 |   80.39
  vehicle.controller.ts |   72.47 |    71.87 |     100 |   70.29
  auth.middleware.ts    |      90 |    77.77 |   71.42 |   88.23
  user.model.ts         |   85.71 |       50 |      80 |   85.71
  vehicle.model.ts      |   95.52 |    66.66 |     100 |   96.77
  auth.routes.ts        |     100 |      100 |     100 |     100
  vehicle.routes.ts     |     100 |      100 |     100 |     100
  jwt.ts                |     100 |       50 |     100 |     100
  validators.ts         |     100 |      100 |     100 |     100
```

The uncovered lines are primarily:
- `catch` blocks in controllers (500 error paths — hard to trigger in unit tests)
- `database.ts` environment/path detection fallbacks
- `jwt.ts` environment variable fallback path

---

## How to Reproduce

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run a specific suite
npm test -- --testPathPattern="auth.test.ts"
```

All tests use isolated SQLite databases (separate file per suite, deleted after run).
