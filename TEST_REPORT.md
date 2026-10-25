# Test and Build Report — Car Dealership Inventory System

**Verified:** 2026-10-25
**Environment:** Node.js and npm installed from the workspace runtime; Windows
**Database:** Temporary SQLite files created by the backend test suites

## Results

| Working directory | Command | Result |
|---|---|---|
| `backend/` | `npm test -- --runInBand` | 4 suites, 58 tests passed |
| `backend/` | `npm run test:coverage` | 4 suites, 58 tests passed; statements 85.19%, branches 65.04%, functions 92.85%, lines 84.83% |
| `frontend/` | `npm test` | 2 test files, 5 tests passed |
| `backend/` | `npm run build` | Passed (`tsc`) |
| `frontend/` | `npm run build` | Passed (`tsc -b` and Vite production build) |

The backend tests cover registration and login, token protection, vehicle listing/search, admin authorization for creation/update/deletion/restocking, and purchase/restock inventory changes. The React component tests cover the disabled purchase action at zero stock, admin-only vehicle actions, and dashboard access to the Add Vehicle action.

## Execution Notes

The first frontend build and test attempts inside the restricted shell failed with `spawn EPERM` in Vite's Windows path-resolution helper. Running the same commands with the approved execution permission succeeded. The initial backend run before the authorization changes passed 56 tests; the final run includes the new authorization cases and passes 58.

## Remaining Verification and Submission Work

- The frontend suite covers dashboard role visibility and vehicle card stock/admin actions; it does not yet cover full browser flows for authentication or vehicle form submission.
- No application screenshots are present. Capture genuine regular-user and admin views after running the application and add them to the README as described there.
- No Git remote is configured in this checkout. The assignment's required public repository URL must be added after the repository is published. A live deployment is optional.
- The first-run SQLite database is empty by design; an admin must add inventory. No sample or fake vehicles are inserted.
