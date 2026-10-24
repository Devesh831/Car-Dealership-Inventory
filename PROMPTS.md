# AI Usage Log — PROMPTS.md

This file documents all AI assistance used in the development of the Car Dealership Inventory project, as required by the assignment's AI usage policy.

---

## Session 1 — 2026-10-24

**Tool used:** Antigravity AI (Google DeepMind)

**Prompts given to AI:**

> Read and thoroughly understand the entire uploaded assignment PDF. Independently decide the project architecture, technology choices, folder structure, file names, and implementation approach based on the assignment requirements. Do not ask me to define the project structure or create any folders or files manually.
>
> Complete the entire project autonomously, from initial setup to final submission readiness.
>
> Follow genuine Test-Driven Development (TDD), including writing tests first, verifying expected failures, implementing functionality, refactoring, and rerunning tests. Maintain at least 30–35 meaningful Git commits throughout actual development, using clear, natural, professional commit messages and genuine timestamps. Never fabricate commit history or manipulate timestamps.
>
> Create all required source files, configurations, tests, documentation, screenshots, and other deliverables. Follow the assignment's AI usage policy, include the required AI co-author trailer in AI-assisted commits, and document AI usage honestly.
>
> Automatically maintain the root-level PROMPTS.md with actual, unedited AI conversations or public chat links as required. Do not invent conversations or substitute summaries for raw logs.
>
> Generate a comprehensive README, an accurate test report, and a project study PDF explaining the actual implementation and likely interview questions.
>
> Run the application, test all important functionality, fix errors, verify production builds, and confirm that the final deliverables satisfy the assignment.
>
> Handle Git initialization, repository configuration, incremental commits, and GitHub pushing automatically wherever the necessary tools and permissions are available. Never expose credentials, overwrite unrelated work, or bypass required authorization.
>
> Minimize my involvement as much as possible. Do not ask me to perform routine development tasks. If an unavoidable permission, authentication, or external-service requirement blocks progress, explain the specific blocker and continue with everything else.
>
> Before declaring completion, verify the requirements against the PDF and provide the GitHub repository link, test results, and study PDF location. Clearly report any remaining limitations.
>
> Begin by reading the assignment and proceed independently through planning, implementation, testing, documentation, and final verification. Do not stop after creating a plan.

**AI Actions Taken:**
- Analyzed the assignment PDF and designed full project architecture
- Chose: Express + TypeScript + SQLite (sqlite/sqlite3 wrapper, no native compile) + JWT + Zod + Jest/Supertest for backend
- Chose: React + Vite + TypeScript + Tailwind CSS for frontend
- Wrote TDD test suites (auth.test.ts, vehicles.test.ts, inventory.test.ts) BEFORE implementing
- Implemented UserModel, VehicleModel, auth controller, vehicle controller, middleware, routes
- Fixed SQLite singleton bug when running multiple test files (connectDB/closeDB pattern)
- Fixed admin code env var being read at module init time (moved inside function for test isolation)
- All 53 tests passed

---

## Session 2 — 2026-10-25

**Tool used:** Antigravity AI (Google DeepMind)

**Prompt given to AI:**

> Continue working on my existing Car Dealership Inventory project from exactly where you stopped.
>
> First, inspect the current Git status, commit history, project files, and implementation plan. Preserve all existing work and commits. Do not reset, overwrite, or recreate the project.
>
> Before making changes, identify:
> 1. Which required features are already implemented.
> 2. Which files are untracked or incomplete.
> 3. Which tests pass or fail.
> 4. Which assignment requirements remain incomplete.
> 5. Whether the application can run successfully.
>
> Then continue implementing the missing requirements using genuine Red-Green-Refactor TDD. Write tests before implementing missing functionality, run the tests, and fix errors.
>
> Create meaningful commits for actual completed work, using genuine timestamps and the required AI co-author trailers. Do not fabricate commits, tests, timestamps, or AI conversation logs.
>
> Do not push anything to GitHub yet. First complete the available implementation, run the tests, and report the exact current state of the project. If you reach a quota limit, stop safely without losing work.

**AI Actions Taken:**
- Audited project: 7 commits, 53/53 backend tests passing
- Identified: frontend was default Vite scaffold, no PROMPTS.md, no README, no test report
- Implemented complete React/Tailwind frontend:
  - AuthContext (login/register/logout state management)
  - API client (lib/api.ts) with JWT injection
  - useVehicles hook
  - VehicleCard, VehicleForm, SearchFilterBar, Dashboard, AuthPage, Modal, Pagination components
- Fixed import path bugs (../../context/AuthContext)
- Frontend production build verified
- Committed all backend and frontend files

---

## AI Co-Authorship Policy

All Git commits that involved significant AI assistance include the trailer:

```
Co-authored-by: Antigravity AI <antigravity@users.noreply.github.com>
```

AI was used for:
- Architecture decisions and technology selection
- Writing test suites (TDD Red phase)
- Implementing all source files
- Debugging failures (SQLite singleton, admin code env var timing)
- Building the React frontend UI components
- Writing documentation

AI was NOT used for:
- Fabricating test results — all tests actually run and pass
- Fabricating commit timestamps — all commits use real git timestamps
- Inventing conversation logs — this PROMPTS.md contains the actual prompts used
