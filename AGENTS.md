# AGENTS.md — AI Agent Guidelines for SystemHealer

## 1. Purpose
This document defines how AI coding agents must operate on the SystemHealer
repository. It ensures that agent-driven work stays consistent, safe, and
reviewable. All agents (Cursor, Copilot, Claude Code, etc.) must follow these
rules.

## 2. Core Rules (Non-Negotiable)

- NEVER push directly to `main`. All work happens on a short-lived branch.
- ALWAYS create a branch before making changes:
  `git checkout main && git pull origin main && git checkout -b <type>/<short-name>`
- ALWAYS use Conventional Commits for commit messages.
- ALWAYS stop and report on errors — do not try to work around failures silently.
- NEVER delete or overwrite files outside the scope of the current task.
- NEVER run destructive system commands (e.g., `rm -rf`, registry deletes,
  `format`, `del /f /s /q` on system paths) during development or testing.
- ALWAYS confirm with the human before creating a PR or merging.
- NEVER commit secrets, API keys, tokens, or `.env` files.

## 3. Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<short-name>` | `feature/scaffold-react` |
| Bug fix | `fix/<short-name>` | `fix/cors-config` |
| Documentation | `docs/<short-name>` | `docs/fill-documentation` |
| Chore / setup | `chore/<short-name>` | `chore/initial-scaffold` |
| Refactor | `refactor/<short-name>` | `refactor/repair-service` |
| Test | `test/<short-name>` | `test/duplicate-finder` |

Rules:
- Lowercase only, hyphens instead of spaces.
- Keep it under 50 characters.
- One branch per task. Do not mix unrelated work.

## 4. Commit Message Convention (Conventional Commits)

Format: `<type>(<optional scope>): <short description>`

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no behavior change |
| `test` | Adding or fixing tests |
| `chore` | Build, tooling, dependencies |
| `perf` | Performance improvement |

Examples:
- `feat(repair): add SFC scan endpoint`
- `fix(cors): allow localhost:3000 origin`
- `docs: add SRS specification`
- `chore: scaffold Spring Boot backend`

Rules:
- Use imperative mood ("add", not "added").
- Keep the subject line under 72 characters.
- Reference issues when applicable: `feat(cleaner): add duplicate finder (#12)`.

## 5. Agent Roles

### 5.1 Scaffolding Agent
- Responsibility: Create folder structures, initial files, and boilerplate.
- Scope: No business logic. No feature code.
- Must stop after scaffolding and report the file list.

### 5.2 Backend Agent
- Responsibility: Build Spring Boot services, controllers, and Windows command integration.
- Scope: `backend/` only.
- Must write unit tests for each new service.
- Must not modify frontend files.

### 5.3 Frontend Agent
- Responsibility: Build React components, pages, and API integration.
- Scope: `frontend/` only.
- Must not modify backend files.
- Must follow the design system in `docs/frontend/DESIGN_SYSTEM.md` (when written).

### 5.4 Documentation Agent
- Responsibility: Fill `.md` files, write API contracts, and maintain docs.
- Scope: `docs/` and root-level `.md` files only.
- Must not touch source code.

### 5.5 Review Agent
- Responsibility: Review PRs for correctness, safety, and style compliance.
- Scope: Read-only. Cannot push or merge.
- Must flag: direct pushes to main, missing tests, destructive operations
  without confirmation, hardcoded secrets.

## 6. Safety Rules for Windows Operations

- All system-modifying commands must be run only by the Spring Boot backend,
  never by the frontend or agent scripts.
- Every destructive operation must:
  1. Create a restore point (if high-risk).
  2. Require explicit user confirmation.
  3. Log the action with timestamp and outcome.
- Agents must NEVER execute real repair commands (SFC, DISM, registry deletes)
  during development. Use mock/simulated outputs unless the human explicitly
  asks for a live test.
- Agents must not modify the Windows registry during development.

## 7. Stop Conditions (When an Agent Must Halt and Report)

An agent must stop and report to the human if:
- A `git push` fails or times out.
- A file it needs to modify is missing.
- A command returns an unexpected error.
- It is about to perform a destructive or irreversible action.
- It is unsure which branch to work on.
- It needs to create a PR or merge (always requires human confirmation).

## 8. What Agents Must Never Do

- Push to `main` directly.
- Merge PRs without human approval.
- Delete branches they did not create.
- Overwrite `README.md`, `LICENSE`, or `.gitignore` without instruction.
- Commit `node_modules/`, `target/`, `dist/`, or build artifacts.
- Add dependencies without documenting them in `docs/architecture/TECH_STACK.md`.
- Write placeholder code (e.g., `// TODO: implement`) without flagging it.

## 9. Prompt Handoff Format

When a human hands a task to an agent, the prompt should include:
- Repo URL and local path
- Current branch state
- The exact task (one task per prompt)
- Constraints (what NOT to do)
- Stop and report instructions

Agents should confirm they understood the task before starting if anything
is ambiguous.

## 10. Status
Draft — v0.1