# 🚗 Car Dealership Inventory Management System

A full-stack web application for managing a car dealership's vehicle inventory, built with Node.js/TypeScript (backend) and React/TypeScript (frontend), following Test-Driven Development methodology.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Test Results](#test-results)
- [Project Structure](#project-structure)
- [AI Usage](#ai-usage)

---

## Overview

This system allows car dealership staff to:
- Register and authenticate with role-based access (User / Admin)
- Browse the full vehicle inventory with pagination
- Search and filter vehicles by make, category, and price range
- Purchase vehicles (reduces stock)
- Restock vehicles (Admin only)
- Add, edit, and delete vehicles from the inventory (Admin: add/edit/delete; Users: browse/purchase)

---

## Features

### Authentication
- ✅ User registration with email, username, password validation
- ✅ Admin role assignment via secure admin code
- ✅ JWT-based authentication (7-day expiry)
- ✅ Protected routes (middleware-enforced)
- ✅ Password hashing with bcrypt (10 rounds)

### Vehicle Inventory
- ✅ Full CRUD operations for vehicles
- ✅ 7 vehicle categories: Sedan, SUV, Truck, Coupe, Van, Electric, Hybrid
- ✅ Stock tracking (quantity management)
- ✅ Purchase flow with stock validation
- ✅ Admin-only restock and delete operations
- ✅ Server-side pagination (configurable page size)
- ✅ Multi-filter search (make, category, price range) with case-insensitive partial match

### Frontend UI
- ✅ Dark-themed responsive design with Tailwind CSS
- ✅ Login / Register pages with validation feedback
- ✅ Vehicle grid with stock status indicators
- ✅ Search/filter bar with live filtering
- ✅ Inventory statistics panel
- ✅ Modal dialogs for add/edit/delete/purchase/restock
- ✅ Toast notifications for user feedback
- ✅ Pagination component
- ✅ Skeleton loading states
- ✅ Admin-only controls visible conditionally

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js v22 | Runtime |
| Express 4 | HTTP framework |
| TypeScript | Type safety |
| SQLite (via `sqlite` + `sqlite3`) | Database (no native compile required) |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Zod | Request validation |
| Jest + Supertest | TDD test framework |
| ts-jest | TypeScript Jest transformer |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| Vite 8 | Build tool / dev server |
| TypeScript 6 | Type safety |
| Tailwind CSS 3 | Styling |
| Context API | Auth state management |
| Fetch API | HTTP client |

---

## Architecture

```
Car_Dealership_Inventory/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── @types/             # Express type extensions
│   │   ├── config/database.ts  # SQLite singleton with schema init
│   │   ├── controllers/        # Auth & Vehicle controllers
│   │   ├── middleware/         # JWT auth, admin guard, error handler
│   │   ├── models/             # UserModel, VehicleModel (async)
│   │   ├── routes/             # Auth & Vehicle route definitions
│   │   ├── utils/              # JWT helpers, Zod validators
│   │   ├── app.ts              # Express app configuration
│   │   └── server.ts           # HTTP server entry point
│   └── tests/                  # Jest + Supertest TDD suites
│       ├── auth.test.ts        # 17 tests
│       ├── vehicles.test.ts    # 24 tests
│       └── inventory.test.ts   # 12 tests
│
└── frontend/                   # React + Vite SPA
    └── src/
        ├── components/
        │   ├── auth/           # LoginForm, RegisterForm
        │   ├── vehicles/       # VehicleCard, VehicleForm, SearchFilterBar
        │   ├── ui/             # Modal, Pagination
        │   ├── AuthPage.tsx    # Authentication page
        │   └── Dashboard.tsx   # Main inventory dashboard
        ├── context/
        │   └── AuthContext.tsx # Global auth state (React Context)
        ├── hooks/
        │   └── useVehicles.ts  # Vehicle data & actions hook
        └── lib/
            └── api.ts          # Typed API client (fetch-based)
```

### Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- bcrypt hash
  role TEXT DEFAULT 'user'         -- 'user' | 'admin'
    CHECK(role IN ('user', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL
    CHECK(category IN ('Sedan','SUV','Truck','Coupe','Van','Electric','Hybrid')),
  price REAL NOT NULL CHECK(price > 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your JWT_SECRET and ADMIN_REGISTRATION_CODE
npm run dev
```

The backend runs on **http://localhost:3001**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on **http://localhost:5173** with API proxy to `:3001`.

### Environment Variables (backend/.env)

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
ADMIN_REGISTRATION_CODE=ADMIN_SECRET_2024
CORS_ORIGIN=http://localhost:5173
DB_PATH=./data/car_dealership.sqlite
```

---

## API Reference

All endpoints except `/api/health` require `Authorization: Bearer <token>`.

### Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | None | Register new user |
| `POST` | `/api/auth/login` | None | Login and get JWT |
| `GET` | `/api/auth/me` | Required | Get current user profile |

**Register Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "admin",        // optional
  "adminCode": "SECRET"   // required if role is admin
}
```

### Vehicle Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/api/vehicles` | Required | Any | List vehicles (paginated) |
| `GET` | `/api/vehicles/search` | Required | Any | Search with filters |
| `GET` | `/api/vehicles/:id` | Required | Any | Get vehicle by ID |
| `POST` | `/api/vehicles` | Required | Any | Add new vehicle |
| `PUT` | `/api/vehicles/:id` | Required | Any | Update vehicle |
| `DELETE` | `/api/vehicles/:id` | Required | **Admin** | Delete vehicle |
| `POST` | `/api/vehicles/:id/purchase` | Required | Any | Purchase (decrement stock) |
| `POST` | `/api/vehicles/:id/restock` | Required | **Admin** | Restock (increment stock) |

**Search Query Parameters:**
- `make` — partial, case-insensitive text match
- `category` — exact match (`Sedan`, `SUV`, etc.)
- `minPrice` / `maxPrice` — numeric range
- `page` / `limit` — pagination

---

## Test Results

```
Test Suites: 3 passed, 3 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        ~6.2s
```

| Suite | Tests | Status |
|-------|-------|--------|
| `auth.test.ts` | 17 | ✅ All pass |
| `vehicles.test.ts` | 24 | ✅ All pass |
| `inventory.test.ts` | 12 | ✅ All pass |

Run tests:
```bash
cd backend
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

---

## Project Structure

```
backend/
├── data/                    # SQLite DB files (gitignored)
├── src/
│   ├── @types/
│   │   └── express.d.ts     # Extends Express Request with user payload
│   ├── config/
│   │   └── database.ts      # connectDB / getDB / closeDB singleton
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── vehicle.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts  # authenticate, requireAdmin, validate, errorHandler
│   ├── models/
│   │   ├── user.model.ts
│   │   └── vehicle.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── vehicle.routes.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── validators.ts
│   ├── app.ts
│   └── server.ts
└── tests/
    ├── auth.test.ts
    ├── inventory.test.ts
    ├── setup.ts
    └── vehicles.test.ts
```

---

## AI Usage

This project was developed with significant AI assistance from **Antigravity AI** (Google DeepMind). All AI-assisted commits are marked with:

```
Co-authored-by: Antigravity AI <antigravity@users.noreply.github.com>
```

See [`PROMPTS.md`](./PROMPTS.md) for the complete, unedited AI conversation logs.

AI assistance was used for:
- System architecture and technology selection
- TDD test suite design (Red phase — tests written before implementation)
- Backend API implementation
- Debugging SQLite singleton isolation and env var timing issues
- React frontend component development
- Documentation

All tests are real and were verified to pass. No commit timestamps were fabricated.
