# Coding Standards

## 1. Purpose
This document defines the coding conventions for SystemHealer across frontend
(React + TypeScript) and backend (Spring Boot + Java). Following these standards
keeps the codebase consistent, reviewable, and maintainable.

## 2. General Principles

- **Readability over cleverness**: code is read more than written.
- **Small, focused units**: functions and components do one thing.
- **Explicit over implicit**: no hidden side effects.
- **No dead code**: remove unused imports, variables, and functions.
- **No commented-out code**: use Git history instead.
- **Consistent naming**: follow the conventions in each section below.
- **Self-documenting code**: prefer clear names over comments; comment only *why*, not *what*.

## 3. File & Folder Naming

| Type | Convention | Example |
|------|------------|---------|
| Folders | lowercase-kebab | `duplicate-finder/` |
| React components | PascalCase.tsx | `RepairPanel.tsx` |
| React hooks | camelCase.ts, `use` prefix | `useRepairStatus.ts` |
| Utility modules | camelCase.ts | `formatBytes.ts` |
| Java classes | PascalCase.java | `RepairService.java` |
| Java packages | lowercase | `com.systemhealer.repair` |
| SQL migrations | `V###__desc.sql` | `V001__create_history.sql` |
| Markdown docs | SCREAMING_SNAKE.md | `API_CONTRACT.md` |

## 4. Frontend Standards (React + TypeScript)

### 4.1 Language
- **TypeScript strict mode** is required (`"strict": true` in `tsconfig.json`).
- No `any` unless justified with a comment. Prefer `unknown` + narrowing.
- Prefer `type` for unions/intersections; use `interface` for object shapes that may be extended.

### 4.2 Components
- Functional components only — no class components.
- One component per file; file name matches the component name.
- Props must be typed with an explicit `Props` interface/type.
- Keep components under ~150 lines; split into subcomponents or hooks if larger.
- No business logic in components — move it to hooks or feature modules.

```tsx
// Good
type RepairPanelProps = {
  onStart: () => void;
  isRunning: boolean;
};

export function RepairPanel({ onStart, isRunning }: RepairPanelProps) {
  return (
    <button onClick={onStart} disabled={isRunning}>
      {isRunning ? 'Repairing…' : 'Start Repair'}
    </button>
  );
}
```

### 4.3 Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `RepairPanel` |
| Files | PascalCase | `RepairPanel.tsx` |
| Functions | camelCase | `getHistory()`, `formatDate()` |
| Constants | UPPER_SNAKE_CASE | `MAX_HISTORY_DAYS` |
| Types/Interfaces | PascalCase | `RepairJob`, `HistoryEntry` |

### 4.4 State Management
- **Server state**: TanStack Query (queries + mutations). All API data lives here.
- **Global UI state** (theme, admin status, active task): React Context.
- **Local component state**: `useState` / `useReducer`.
- **Custom hooks**: extract reusable logic into hooks (`src/hooks/`).
- No Redux unless an ADR justifies it.

### 4.5 Styling
- Use Tailwind CSS utility classes.
- Use shadcn/ui components for interactive elements.
- No CSS-in-JS libraries in v1.

## 5. Backend Standards (Spring Boot + Java)

### 5.1 Language
- Use Java 17 records for immutable data carriers.
- Use `var` for local variables with clear initializers.
- Use try-with-resources for automatic resource management.

### 5.2 Spring Boot Conventions
- Controllers in `api/` package, annotated with `@RestController`.
- Services in `service/` package, annotated with `@Service`.
- Models in `model/` package, annotated with `@Entity`.
- Repositories in `repository/` package, extending `JpaRepository`.

### 5.3 Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `RepairService.java` |
| Methods | camelCase | `saveHistory()`, `getByStatus()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Variables | camelCase | `repairJob`, `outputStream` |

### 5.4 DTOs and Entities
- DTOs for API input/output, no JPA annotations.
- Entities for database persistence, with JPA annotations.
- Use `@JsonIgnore` to exclude sensitive fields from API responses.

### 5.5 Error Handling
- Use custom exceptions per domain (e.g., `RepairFailedException`).
- `@ControllerAdvice` for global exception handling.
- Return standard error response format.

## 6. API Contract Standards

### 6.1 REST Principles
- Use nouns for endpoints, pluralized.
- Use HTTP methods correctly (`GET`, `POST`, `PUT`, `DELETE`).
- Use status codes properly (200, 201, 400, 401, 403, 404, 500).

### 6.2 Request/Response Format
- All requests with body: `application/json`.
- All responses: `application/json`.
- Use ISO 8601 for dates: `YYYY-MM-DDTHH:mm:ss.SSS`.

### 6.3 Query Parameters
- Use snake_case for parameter names.
- Document all parameters in API spec.

## 7. Database Standards

### 7.1 Schema Naming
- Table names: snake_case plural (`repair_history`).
- Column names: snake_case (`start_time`, `status`).
- Primary keys: `id` (auto-increment).
- Foreign keys: foreign table's singular + `_id`.

### 7.2 Indexing
- Index foreign key columns.
- Index frequently queried columns (e.g., `status`).
- Use compound indexes for common query patterns.

### 7.3 Migrations
- Always use Flyway migrations.
- Never modify existing migrations.
- Add one feature per migration file.

## 8. Testing Standards

### 8.1 Test Naming
- Class: `ClassNameTest.java` or `testName.test.ts`.
- Method: `testName_scenario_expectedResult()`.

### 8.2 Test Structure
- Arrange, Act, Assert pattern.
- One assertion per test line.
- No shared state between tests.

### 8.3 Test Types
- Unit tests: test isolated functions/methods.
- Integration tests: test API endpoints with mock DB.
- End-to-end tests: test full workflows (future).

## 9. Git Standards

### 9.1 Commits
- Use Conventional Commits format.
- Keep subject line under 72 characters.
- Use imperative mood ("add", not "added").

### 9.2 Branches
- Prefix with type: `feature/`, `fix/`, `docs/`, `test/`, `refactor/`.
- Keep names descriptive and hyphenated.
- One branch per feature/fix.

## 10. Security Standards

### 10.1 Input Validation
- Validate all user input at API boundaries.
- Use `@Valid` annotations for DTOs.
- Never trust client data.

### 10.2 Secrets Management
- Never commit secrets.
- Use environment variables for local dev.
- Use GitHub Secrets for CI.

### 10.3 Database Security
- Use parameterized queries (JPA protects by default).
- No raw SQL with string interpolation.
- Encrypt sensitive data at rest.