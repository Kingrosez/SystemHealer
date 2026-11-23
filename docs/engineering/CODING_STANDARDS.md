# Coding Standards

## 1. Purpose
This document defines the coding standards and patterns used in SystemHealer.
All contributors must follow these standards to maintain code quality and
consistency.

## 2. Frontend Coding Standards

### 2.1 Language: TypeScript
- Use TypeScript for all frontend code.
- Prefer `interface` over `type` for object shapes.
- Use `enum` for fixed sets of constants.
- Never use `any` — use `unknown` and narrow first.

### 2.2 React Components
- Use functional components with hooks only.
- Use TypeScript generics for component props.
- Destructure props inside the function body.

```tsx
interface Props {
  title: string;
  count?: number;
}

export function CounterCard({ title, count = 0 }: Props) {
  return (
    <Card>
      <h3>{title}</h3>
      <p>{count}</p>
    </Card>
  );
}
```

### 2.3 Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `RepairCard.tsx` |
| Files | PascalCase | `RepairCard.tsx` |
| Functions | camelCase | `getHistory()`, `formatDate()` |
| Constants | UPPER_SNAKE_CASE | `MAX_HISTORY_DAYS` |
| Types/Interfaces | PascalCase | `RepairJob`, `HistoryEntry` |

### 2.4 State Management
- Use React Context for global state.
- Use custom hooks for reusable logic.
- Use TanStack Query for server state.

### 2.5 Styling
- Use Tailwind CSS utility classes.
- Use shadcn/ui components for interactive elements.
- No CSS-in-JS libraries in v1.

## 3. Backend Coding Standards

### 3.1 Language: Java 17
- Use records for immutable data carriers.
- Use `var` for local variables with clear initializers.
- Use try-with-resources for automatic resource management.

### 3.2 Spring Boot Conventions
- Controllers in `api/` package, annotated with `@RestController`.
- Services in `service/` package, annotated with `@Service`.
- Models in `model/` package, annotated with `@Entity`.
- Repositories in `repository/` package, extending `JpaRepository`.

### 3.3 Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `RepairService.java` |
| Methods | camelCase | `saveHistory()`, `getByStatus()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Variables | camelCase | `repairJob`, `outputStream` |

### 3.4 DTOs and Entities
- DTOs for API input/output, no JPA annotations.
- Entities for database persistence, with JPA annotations.
- Use `@JsonIgnore` to exclude sensitive fields from API responses.

### 3.5 Error Handling
- Use custom exceptions per domain (e.g., `RepairFailedException`).
- `@ControllerAdvice` for global exception handling.
- Return standard error response format.

## 4. API Contract Standards

### 4.1 REST Principles
- Use nouns for endpoints, pluralized.
- Use HTTP methods correctly (`GET`, `POST`, `PUT`, `DELETE`).
- Use status codes properly (200, 201, 400, 401, 403, 404, 500).

### 4.2 Request/Response Format
- All requests with body: `application/json`.
- All responses: `application/json`.
- Use ISO 8601 for dates: `YYYY-MM-DDTHH:mm:ss.SSS`.

### 4.3 Query Parameters
- Use snake_case for parameter names.
- Document all parameters in API spec.

## 5. Database Standards

### 5.1 Schema Naming
- Table names: snake_case plural (`repair_history`).
- Column names: snake_case (`start_time`, `status`).
- Primary keys: `id` (auto-increment).
- Foreign keys: foreign table's singular + `_id`.

### 5.2 Indexing
- Index foreign key columns.
- Index frequently queried columns (e.g., `status`).
- Use compound indexes for common query patterns.

### 5.3 Migrations
- Always use Flyway migrations.
- Never modify existing migrations.
- Add one feature per migration file.

## 6. Testing Standards

### 6.1 Test Naming
- Class: `ClassNameTest.java` or `testName.test.ts`.
- Method: `testName_scenario_expectedResult()`.

### 6.2 Test Structure
- Arrange, Act, Assert pattern.
- One assertion per test line.
- No shared state between tests.

### 6.3 Test Types
- Unit tests: test isolated functions/methods.
- Integration tests: test API endpoints with mock DB.
- End-to-end tests: test full workflows (future).

## 7. Git Standards

### 7.1 Commits
- Use Conventional Commits format.
- Keep subject line under 72 characters.
- Use imperative mood ("add", not "added").

### 7.2 Branches
- Prefix with type: `feature/`, `fix/`, `docs/`, `test/`, `refactor/`.
- Keep names descriptive and hyphenated.
- One branch per feature/fix.

## 8. Security Standards

### 8.1 Input Validation
- Validate all user input at API boundaries.
- Use `@Valid` annotations for DTOs.
- Never trust client data.

### 8.2 Secrets Management
- Never commit secrets.
- Use environment variables for local dev.
- Use GitHub Secrets for CI.

### 8.3 Database Security
- Use parameterized queries (JPA protects by default).
- No raw SQL with string interpolation.
- Encrypt sensitive data at rest.

## 9. Performance Standards

### 9.1 Query Optimization
- Avoid N+1 queries (use JOIN FETCH or @EntityGraph).
- Use pagination for large result sets.
- Add database indexes for common queries.

### 9.2 API Performance
- Use streaming for large responses (SSE for logs).
- Implement caching where appropriate.
- Set reasonable timeouts on external calls.

## 10. Documentation Standards

- Update CHANGELOG.md for user-facing changes.
- Add Javadoc for public classes/methods (backend).
- Add JSDoc for public functions (frontend).
- Document ADRs for architectural changes.