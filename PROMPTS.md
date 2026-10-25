# AI Usage Log — PROMPTS.md

This file preserves the original Antigravity prompt records and separately labels exact Codex user prompts recovered from the attached project request and accessible task history. It is not a complete record of all AI assistance or a transcript of AI responses.

---

## Editorial Index (not a verbatim conversation)

This index is an editorial guide and does not replace or rewrite any original prompt.

| Record | Development stages represented |
|---|---|
| Session 1 — Antigravity AI | Assignment analysis, architecture, backend and database, authentication, frontend, TDD, documentation, and submission |
| Session 2 — Antigravity AI | Existing-project audit, continuation, TDD, frontend completion, verification, and Git |
| Session 3 — Codex | Assignment-based project audit and implementation, followed by recovered project follow-ups |


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

## Session 3 — Codex project work (2026-10-25)

### Initial project request (verbatim from the attached prompt)

```text
Read the uploaded assignment PDF carefully and inspect my existing Car Dealership Inventory System project.

**Project location:** `C:\Users\deves\OneDrive\Desktop\Car_Dealership_Inventory`

**Tech stack:** React, TypeScript, Express.js, SQLite, and JWT authentication.

Previously, all 56 backend tests passed, and both backend and frontend production builds succeeded. However, these results must be verified against the current code.

### 1. Audit the Existing Project
- Compare the current implementation against every requirement in the assignment PDF.
- Inspect the backend, frontend, database, authentication, API routes, tests, and configuration.
- Identify incomplete, incorrect, or missing functionality.
- Check the existing Git repository and preserve its history.
- Do not rebuild the project from scratch or unnecessarily rewrite working code.

### 2. Fix the Admin Dashboard
My dashboard previously displayed zero vehicles, and the **Add Vehicle** button was missing.

Investigate and fix the actual cause. Check user roles, admin authorization, vehicle API responses, database records, frontend conditional rendering, and API configuration.

Ensure that:
- Admin users can access the correct admin dashboard.
- Admin users can add, update, delete, and restock vehicles as required by the assignment.
- Regular users cannot access admin-only functionality.
- Vehicle data loads and displays correctly.
- Authentication and authorization work properly.

Do not hardcode fake inventory, bypass authorization, or expose environment variables or secrets. Follow the project's existing authentication design and assignment requirements.

### 3. Complete All Assignment Requirements
Verify and implement anything missing, including:
- User registration and login with JWT authentication.
- Protected API endpoints and appropriate role-based authorization.
- Vehicle fields: ID, make, model, category, price, and quantity.
- Vehicle listing, search, and filtering.
- Admin vehicle creation, updating, deletion, and restocking.
- Correct inventory changes when vehicles are purchased or restocked.
- A stock-aware purchase interface.
- Responsive React frontend and appropriate loading/error states.
- Meaningful backend and frontend tests.

Follow the assignment PDF as the source of truth. Do not add unnecessary features that increase the risk of breaking working functionality.

### 4. Clean Up Documentation About the 35-Commit Instruction
Search `README.md`, `PROMPTS.md`, `STUDY_GUIDE.md`, `TEST_REPORT.md`, and other relevant project documentation for references to my instruction to Antigravity to create or target **35 Git commits**.

Remove repeated references to this instruction from explanatory documentation so it does not unnecessarily appear throughout my submission.

Important:
- Preserve documentation that the assignment genuinely requires.
- If `PROMPTS.md` must contain unedited AI conversation logs, preserve the original logs rather than modifying them to conceal what was said.
- Do not fabricate or rewrite historical conversations.
- Do not create fake commits, backdate commits, or manipulate Git history to make the repository appear more active.
- Do not delete genuine project information unrelated to this cleanup.
- After editing, search the documentation again to verify that redundant references have been removed wherever appropriate.

### 5. Review All Required Documentation
Review and update these files as needed:
- `README.md`: project overview, features, technology stack, installation, environment configuration, database setup, and instructions to run the backend and frontend.
- `PROMPTS.md`: genuine AI prompts/conversation records in the format required by the assignment.
- `TEST_REPORT.md`: actual tests executed, their results, and any remaining limitations.
- `STUDY_GUIDE.md`: clear explanations of the implementation and important technical decisions.

Include screenshots or screenshot instructions if required by the assignment. Document AI usage transparently, and never claim that a feature, test, screenshot, or deployment exists unless it has been verified.

### 6. Test Everything
After making changes:
- Run backend tests.
- Run frontend tests if configured.
- Run backend and frontend production builds.
- Fix failures caused by your changes.
- Check API functionality and admin-versus-regular-user permissions.
- Verify that vehicle records load and that admin actions work.
- Report the exact commands executed and their actual results.

Do not claim tests passed if you did not run them. Clearly identify any tests that could not be executed.

### 7. Git and Submission Readiness
Inspect the existing Git history and repository status before making changes. Preserve existing commits and make only genuine, appropriately scoped commits if necessary and permitted.

Check the assignment's GitHub submission requirements, including whether a public repository and live demo are expected. Do not invent a remote repository, claim a deployment exists, or fabricate screenshots or commit history.

### How to Work
1. First, inspect the existing project and produce a concise checklist of missing requirements and issues.
2. Then start implementing the fixes directly in the opened project folder. Do not stop after giving recommendations.
3. Make small, safe changes and preserve working functionality.
4. Run tests and builds after the changes.
5. Review the final documentation and assignment requirements.
6. At the end, give me a concise report covering:
   - What you fixed.
   - Which requirements are complete or incomplete.
   - Actual test and build results.
   - Documentation changes.
   - Any remaining manual steps for submission.

**Priority:** Finish the existing project correctly, fix the missing admin functionality, meet the assignment requirements, and ensure the submission is genuine, tested, and professionally documented.
```

### Recovered follow-up: continue the assignment work (verbatim)

```text
You stopped after providing a completion report, but the assignment is not fully finished. Continue working in the existing project folder and do not stop at another summary or checklist.

First, inspect the current project state and identify which tasks from your previous report remain incomplete.

Then complete as much as possible directly:

1. Re-read the assignment PDF and verify every requirement against the current implementation.
2. Inspect the current README, PROMPTS.md, STUDY_GUIDE.md, and TEST_REPORT.md. Fix any missing or inconsistent documentation.
3. Check all documentation for the repeated 35-commit instruction. Remove redundant references where appropriate, but preserve genuine, unedited AI logs if required.
4. Run the application and verify the admin workflow if your environment permits. If manual browser interaction is unavailable, give me exact steps to verify it.
5. Check that the frontend, backend, database initialization, authentication, vehicle management, purchases, and role-based permissions work correctly.
6. Run the relevant tests and production builds again if you change any code.
7. Check the Git status, .gitignore, and repository contents for secrets or unnecessary generated files. Do not expose .env credentials or private admin codes.
8. Prepare the repository for GitHub publication. If you cannot create the remote or authenticate and push, tell me exactly what I must do manually. Do not invent a repository URL.
9. Identify the screenshots required by the assignment and help me capture them. Do not fabricate screenshots.
10. Complete all other tasks that can be performed safely in the current environment.

Do not merely explain what remains. Perform the available work directly, verify your changes, and continue until you reach a genuine blocker that requires my input.

Do not fabricate tests, commits, screenshots, AI conversations, deployment URLs, or results. Preserve the existing Git history and working code.

At the end, clearly separate:

- Completed and verified tasks
- Tasks requiring my manual action
- Any genuine blockers
```

### Recovered follow-up: remove decorative emojis (verbatim)

```text
Review the entire project and remove **only decorative emojis that are not part of the code or required for functionality**.

### Strict Rules

1. Remove emojis used purely for decoration in README files, Markdown documentation, headings, comments, UI text, notifications, and other non-code content.
2. **Do not modify, delete, rewrite, reformat, or refactor any code.** Keep all source files, configuration files, tests, dependencies, and project structure intact.
3. Preserve every code-related symbol, including operators, punctuation, special characters, Unicode characters, escape sequences, regex patterns, and symbols used in strings or logic.
4. Do not change variable names, function names, API endpoints, database queries, authentication logic, business logic, UI functionality, or test cases.
5. Do not change file contents except where necessary to remove a clearly decorative emoji. Do not make unrelated improvements.
6. Do not delete or rename any files, and do not modify screenshots or their references.
7. If an emoji's purpose is unclear or it might be required by the code or functionality, **leave it unchanged**.
8. Preserve all existing Git history and commits. Do not commit, push, reset, or reinitialize the repository.

### Verification

- Review every change and confirm that only decorative emojis have been removed.
- Ensure no code, logic, formatting, or unrelated text has changed.
- Report the exact files modified and the emojis removed from each file.
- If any change affects code or anything beyond decorative emoji removal, revert that unrelated change.

**Important:** Make the smallest possible changes. Do not perform a general cleanup or polish. The only objective is to remove non-code-related decorative emojis while keeping everything else intact.

my project should work how it is working now
```

**Record availability (editorial note):** The accessible Codex history provides exact user prompt messages, but no separate exported assistant-response transcript or public chat link was present in the inspected project materials. The existing “AI Actions Taken” sections above are retained unchanged and are editorial summaries, not verbatim AI dialogue.


## AI Co-Authorship Policy

The Git history reachable from the current `HEAD` contains 14 commits. Twelve include a `Co-authored-by` trailer; the two without one are `0724baa` and `e2847fb`. This history check does not establish whether those commits involved AI assistance, so this document makes no claim that every AI-assisted commit has a trailer. The trailer format used in the history is:

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
- Inventing conversation logs — this file includes the original prompt records and exact recovered Codex user prompts identified above; other historical prompt and response records may be unavailable
