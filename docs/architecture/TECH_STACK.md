# Tech Stack

## 1. Purpose
This document lists every technology, framework, library, and tool used in
SystemHealer, with versions and rationale. Any new dependency must be added
here before it is merged (enforced by `AGENTS.md`).

## 2. Summary Table

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 18.x | UI framework |
| Frontend | TypeScript | 5.x | Type safety |
| Frontend | Vite | 5.x | Build tool / dev server |
| Frontend | React Router | 6.x | Client-side routing |
| Frontend | TanStack Query | 5.x | Server-state management |
| Frontend | Tailwind CSS | 3.x | Styling |
| Frontend | shadcn/ui | latest | Accessible UI components |
| Frontend | ESLint + Prettier | latest | Linting and formatting |
| Frontend | Vitest + Testing Library | latest | Unit/component tests |
| Backend | Java (LTS) | 17+ | Language runtime |
| Backend | Spring Boot | 3.x | Application framework |
| Backend | Spring Web | 3.x | REST API |
| Backend | Spring Boot DevTools | 3.x | Dev hot reload |
| Backend | Spring Boot Actuator | 3.x | Health/metrics endpoints |
| Backend | H2 (dev) / SQLite (prod) | latest | Embedded database |
| Backend | Spring Data JPA | 3.x | Persistence |
| Backend | Flyway | 10.x | DB migrations |
| Backend | Maven | 3.9+ | Build tool |
| Backend | JUnit 5 + Mockito | latest | Unit tests |
| Backend | Spring Boot Test | 3.x | Integration tests |
| Integration | PowerShell | Windows built-in | System commands |
| Integration | CMD | Windows built-in | Legacy commands |
| Integration | Winget | Windows built-in | Software updates |
| Integration | Java ProcessBuilder | JDK 17+ | Process execution |
| Tooling | Git | 2.40+ | Version control |
| Tooling | GitHub Flow | — | Branching model |
| Tooling | Conventional Commits | — | Commit format |
| Tooling | GitHub Actions | — | CI (future) |

## 3. Frontend Stack

### 3.1 React 18 + TypeScript 5
- **Why**: Industry-standard UI library with strong typing via TypeScript.
- **Usage**: All UI components are functional components with hooks.
- **Constraint**: No class components.

### 3.2 Vite 5
- **Why**: Fast dev server and optimized production builds (faster than CRA).
- **Usage**: `npm run dev` for development, `npm run build` for production.
- **Constraint**: Do not introduce Webpack or CRA.

### 3.3 React Router 6
- **Why**: Standard client-side routing for multi-page SPA.
- **Usage**: Tabs (Repair, Cleaner, etc.) map to routes.

### 3.4 TanStack Query 5
- **Why**: Handles server-state caching, retries, and background refetching.
- **Usage**: All API calls go through TanStack Query hooks.
- **Constraint**: No raw `fetch` in components — use query/mutation hooks.

### 3.5 Tailwind CSS 3 + shadcn/ui
- **Why**: Utility-first styling with accessible, copy-paste components.
- **Usage**: Layout, spacing, colors via Tailwind classes; interactive components via shadcn/ui.
- **Constraint**: No CSS-in-JS libraries (styled-components, emotion).

### 3.6 ESLint + Prettier
- **Why**: Consistent code style and early error detection.
- **Usage**: Runs on pre-commit and CI (future).

### 3.7 Vitest + Testing Library
- **Why**: Fast, Vite-native test runner with DOM testing utilities.
- **Usage**: Component tests and hook tests.

## 4. Backend Stack

### 4.1 Java 17 (LTS)
- **Why**: Long-term support, modern language features (records, sealed classes).
- **Constraint**: Do not use Java 21+ features unless the team agrees to upgrade.

### 4.2 Spring Boot 3.x
- **Why**: Batteries-included framework, easy REST API, strong ecosystem.
- **Modules**:
  - Spring Web (REST)
  - Spring Boot DevTools (dev hot reload)
  - Spring Boot Actuator (health endpoints)
  - Spring Data JPA (persistence)
  - Flyway (migrations)

### 4.3 Embedded Database (H2 / SQLite)
- **Why**: Zero-setup for users; no external DB server.
- **Dev**: H2 in-memory (fast reset).
- **Prod**: SQLite file (`%APPDATA%\SystemHealer\systemhealer.db`).
- **Constraint**: No PostgreSQL/MySQL in v1.

### 4.4 Maven
- **Why**: Standard, widely supported, good IDE integration.
- **Usage**: `./mvnw clean install`, `./mvnw spring-boot:run`.
- **Constraint**: Do not introduce Gradle.

### 4.5 JUnit 5 + Mockito + Spring Boot Test
- **Why**: Standard Java testing stack.
- **Usage**: Unit tests for services, integration tests for controllers.

## 5. Windows Integration Stack

### 5.1 PowerShell
- **Usage**: Restore points (`Checkpoint-Computer`), system info, service control.
- **Constraint**: All commands must be run via `ProcessBuilder` with explicit args
  (no `powershell -Command "<user input>"`).

### 5.2 CMD
- **Usage**: Legacy commands (`sfc`, `DISM`, `netsh`, `ipconfig`).
- **Constraint**: Same as PowerShell — no string interpolation of user input.

### 5.3 Winget
- **Usage**: Software update scanning and execution.
- **Constraint**: Only official winget sources in v1.

### 5.4 Java ProcessBuilder
- **Why**: Cross-platform process execution with output streaming.
- **Usage**: Wrapped by the Command Execution Layer (see ARCHITECTURE.md).
- **Constraint**: Every command must have a timeout and a logger.

## 6. Tooling

| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub Flow | Branching model (see CONTRIBUTING.md) |
| Conventional Commits | Commit format (see AGENTS.md) |
| GitHub Actions | CI (planned — build, test, lint on PR) |
| VS Code | Primary editor |
| GitHub Copilot / Cursor / Claude Code | AI coding agents (see AGENTS.md) |

## 7. Version Pinning Policy

- **Frontend**: Pin major versions in `package.json`; use `package-lock.json`.
- **Backend**: Pin versions in `pom.xml`; use Spring Boot's dependency management.
- **Windows tools**: Rely on the OS-provided versions; document minimum Windows
  build (19041+).

## 8. What We Are NOT Using (and Why)

| Technology | Why Not |
|------------|---------|
| Electron / Tauri | v1 uses browser + local backend; wrapper decision deferred |
| Next.js | Not needed — no SSR, no cloud |
| Redux | TanStack Query covers server state; local state is simple |
| styled-components | Tailwind + shadcn/ui is the chosen styling approach |
| PostgreSQL / MySQL | Embedded DB is sufficient for single-user desktop |
| Gradle | Maven is the standard for Spring Boot starters |
| Docker | Not needed for a local Windows desktop tool |

## 9. Upgrade Policy

- **Patch/minor**: Applied during regular maintenance.
- **Major (React, Spring Boot, Java)**: Requires an ADR in
  `docs/architecture/ARCHITECTURE_DECISIONS.md`.
- **Security patches**: Applied immediately.

## 10. Adding a New Dependency

Before adding a dependency:
1. Check if the standard library or an existing dependency covers the need.
2. Evaluate maintenance status, license, and bundle size (frontend).
3. Add it to this document with a one-line rationale.
4. Update `CHANGELOG.md` under `[Unreleased] → Added`.

## 11. Related Documents
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/ARCHITECTURE_DECISIONS.md`
- `CONTRIBUTING.md`
- `AGENTS.md`

## 12. Status
Draft — v0.1