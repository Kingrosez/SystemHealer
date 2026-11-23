# Architecture Decision Records (ADRs)

## 1. Purpose
This document records significant architectural decisions made for SystemHealer.
Each ADR captures the context, the decision, the alternatives considered, and the
consequences. Future changes to these decisions require a new ADR that supersedes
the old one.

Format: lightweight ADR (based on Michael Nygard's template).

## 2. ADR Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-001 | Use React + Spring Boot split architecture | Accepted | 2026-11-23 |
| ADR-002 | Local-only backend bound to 127.0.0.1 | Accepted | 2026-11-23 |
| ADR-003 | Use Vite instead of Create React App | Accepted | 2026-11-23 |
| ADR-004 | Use embedded database (H2 dev / SQLite prod) | Accepted | 2026-11-23 |
| ADR-005 | Use Server-Sent Events (SSE) for log streaming | Accepted | 2026-11-23 |
| ADR-006 | Preview + confirmation token for destructive actions | Accepted | 2026-11-23 |
| ADR-007 | Restore point required before high-risk repairs | Accepted | 2026-11-23 |
| ADR-008 | Package-by-feature backend structure | Accepted | 2026-11-23 |
| ADR-009 | Use Tailwind CSS + shadcn/ui for styling | Accepted | 2026-11-23 |
| ADR-010 | Defer desktop wrapper (Electron/Tauri) to post-v1 | Accepted | 2026-11-23 |

---

## ADR-001: Use React + Spring Boot split architecture

**Status**: Accepted
**Date**: 2026-11-23

### Context
SystemHealer needs a UI and a backend that executes Windows system commands.
Options: monolithic desktop app (e.g., WPF), single-language stack (e.g., Node
full-stack), or a split frontend/backend.

### Decision
Use React (TypeScript) for the frontend and Spring Boot (Java) for the backend,
communicating over localhost HTTP.

### Consequences
- Clear separation of concerns.
- Backend is independently testable and can be reused if the UI changes.
- Requires managing two runtimes (Node + JVM) during development.
- Larger distribution size than a single-language app.

### Alternatives Considered
- **Electron + Node**: single language, but weaker for Windows system integration.
- **WPF / .NET**: native, but ties the project to Windows-only UI tech.
- **Tauri + Rust**: smaller binary, but steeper learning curve.

---

## ADR-002: Local-only backend bound to 127.0.0.1

**Status**: Accepted
**Date**: 2026-11-23

### Context
The backend executes privileged system commands. Exposing it on the network would
be a serious security risk.

### Decision
Bind the Spring Boot server to `127.0.0.1` only. Restrict CORS to the frontend
origin.

### Consequences
- No remote attack surface.
- No data leaves the machine in v1.
- Cannot be used for remote management (acceptable for v1).

### Alternatives Considered
- **Bind to 0.0.0.0 with auth**: rejected — unnecessary complexity and risk.
- **Unix socket**: not portable to Windows.

---

## ADR-003: Use Vite instead of Create React App

**Status**: Accepted
**Date**: 2026-11-23

### Context
CRA is deprecated and slow. Modern React projects use Vite.

### Decision
Scaffold the frontend with Vite (`react-ts` template).

### Consequences
- Faster dev server and builds.
- Smaller dependency footprint.
- Requires contributors to be familiar with Vite (standard today).

### Alternatives Considered
- **Create React App**: deprecated.
- **Next.js**: overkill — no SSR or cloud needed.

---

## ADR-004: Use embedded database (H2 dev / SQLite prod)

**Status**: Accepted
**Date**: 2026-11-23

### Context
The app needs to persist repair history, logs, and settings. A desktop tool should
not require the user to install a database server.

### Decision
Use H2 in-memory for development and SQLite (file-based) for production.

### Consequences
- Zero setup for users.
- Backup = copy one file.
- Schema must stay compatible between H2 and SQLite.

### Alternatives Considered
- **PostgreSQL/MySQL**: requires installation; overkill for single-user.
- **Flat files (JSON)**: no query capability; poor for logs.

---

## ADR-005: Use Server-Sent Events (SSE) for log streaming

**Status**: Accepted
**Date**: 2026-11-23

### Context
Long-running operations (SFC, DISM, duplicate scan) need to stream progress to the UI.

### Decision
Use SSE (`text/event-stream`) for one-way log streaming from backend to frontend.

### Consequences
- Simpler than WebSocket.
- Works over standard HTTP; no extra protocol.
- One-way only — sufficient for logs.

### Alternatives Considered
- **WebSocket**: bidirectional, but not needed.
- **Polling**: wasteful and laggy.

---

## ADR-006: Preview + confirmation token for destructive actions

**Status**: Accepted
**Date**: 2026-11-23

### Context
Users must never accidentally delete files or registry keys.

### Decision
Every destructive endpoint requires a two-step flow:
1. `POST .../preview` returns what will be affected + a `confirmToken`.
2. `POST .../execute` with the token performs the action.

### Consequences
- Prevents accidental destructive calls.
- Adds one extra round-trip per action.
- Tokens expire (e.g., 5 minutes) and are single-use.

### Alternatives Considered
- **Single-step with UI confirmation only**: weaker — any script could call the API.
- **No confirmation**: unacceptable for safety.

---

## ADR-007: Restore point required before high-risk repairs

**Status**: Accepted
**Date**: 2026-11-23

### Context
Some repairs (registry cleanup, permission reset, network reset) can leave the
system in a worse state.

### Decision
The backend must create a Windows restore point (`Checkpoint-Computer`) before
executing any operation classified as high-risk. If a restore point cannot be
created (e.g., 24-hour Windows limit), the user must be warned and explicitly
opt in.

### Consequences
- Strong recovery guarantee.
- Restore point creation takes time and disk space.
- Must handle the 24-hour Windows limitation gracefully.

### Alternatives Considered
- **Registry export only**: insufficient for system-level changes.
- **No backup**: unacceptable.

---

## ADR-008: Package-by-feature backend structure

**Status**: Accepted
**Date**: 2026-11-23

### Context
Backend could be organized by layer (`controllers/`, `services/`, `repositories/`)
or by feature (`repair/`, `cleaner/`, `recovery/`).

### Decision
Organize by feature. Each module owns its controller, service, DTOs, and tests.

### Consequences
- Easier to navigate and scale.
- Clear module boundaries.
- Cross-cutting concerns live in `common/` and `exec/`.

### Alternatives Considered
- **Layer-based**: becomes unwieldy as features grow.

---

## ADR-009: Use Tailwind CSS + shadcn/ui for styling

**Status**: Accepted
**Date**: 2026-11-23

### Context
Need a consistent, accessible, and fast-to-build UI.

### Decision
Use Tailwind CSS for utility styling and shadcn/ui for accessible components.

### Consequences
- Fast iteration.
- No custom CSS-in-JS runtime.
- Components are copied into the repo (owned, not imported).

### Alternatives Considered
- **MUI**: heavier, opinionated.
- **styled-components**: runtime cost; not aligned with Tailwind approach.

---

## ADR-010: Defer desktop wrapper (Electron/Tauri) to post-v1

**Status**: Accepted
**Date**: 2026-11-23

### Context
v1 can run as a local web app (browser + local backend). A desktop wrapper
(Electron or Tauri) would improve UX but adds complexity.

### Decision
Ship v1 as a browser-based UI + local backend. Defer the wrapper decision to v1.1.

### Consequences
- Faster v1 delivery.
- Users open a browser tab instead of a native window.
- Wrapper choice remains open (Tauri is the likely candidate for size).

### Alternatives Considered
- **Electron now**: larger binary, more complex packaging.
- **Tauri now**: smaller, but Rust toolchain adds friction.

---

## 3. How to Add a New ADR

1. Pick the next ID (ADR-011, ADR-012, ...).
2. Add a row to the index table.
3. Add a section using the template above (Context, Decision, Consequences,
   Alternatives Considered).
4. If superseding an old ADR, mark the old one as `Superseded by ADR-XXX`.
5. Update `CHANGELOG.md` under `[Unreleased] → Changed`.

## 4. Related Documents
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/TECH_STACK.md`
- `docs/architecture/PROJECT_STRUCTURE.md`
- `docs/architecture/DATABASE_DESIGN.md`

## 5. Status
Draft — v0.1 (10 ADRs recorded)