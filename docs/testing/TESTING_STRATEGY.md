# Testing Strategy

## 1. Purpose
This document defines how SystemHealer is tested across frontend and backend:
test levels, tooling, coverage targets, mocking strategy, and CI expectations.
Because the app runs privileged Windows commands, tests must **never execute real
destructive operations**.

## 2. Testing Principles

- **Test behavior, not implementation.**
- **Never run real system commands in tests** — mock the command layer.
- **Fast feedback**: unit tests run in seconds; integration tests in minutes.
- **Confidence in safety**: every destructive path has a test.
- **Failures are isolated**: one flaky test must not block the suite.

## 3. Test Levels

| Level | Scope | Tooling | Speed | Runs in CI |
|-------|-------|---------|-------|------------|
| Unit (frontend) | Components, hooks | Vitest + Testing Library | Fast | Yes |
| Unit (backend) | Services, utilities | JUnit 5 + Mockito | Fast | Yes |
| Integration (backend) | Controllers + DB | Spring Boot Test + MockMvc | Medium | Yes |
| Contract | API shapes vs `API_CONTRACT.md` | Fixtures + schema validation | Fast | Yes |
| E2E (optional, local) | Full flow (UI + backend) | Playwright | Slow | Manual / nightly |

## 4. Backend Testing

### 4.1 Unit Tests
- Every service class has tests for happy path + at least one failure path.
- Mock dependencies (repositories, `CommandRunner`).
- Use AssertJ for assertions.

```java
@Test
void shouldThrowWhenRestorePointFails() {
  when(commandRunner.run(any())).thenThrow(new CommandExecutionException("..."));
  assertThatThrownBy(() -> repairService.start(request))
      .isInstanceOf(CommandExecutionException.class);
}
```

### 4.2 Command Layer Tests
The `exec/CommandRunner` is mocked everywhere except its own unit tests.
Its own tests simulate:
- Normal exit (code 0)
- Non-zero exit
- Timeout
- Launch failure
- Cancellation

**Never** call real `sfc`, `DISM`, `netsh`, or registry commands in tests.

### 4.3 Controller Tests
- Use `@WebMvcTest` + `MockMvc`.
- Verify HTTP status, response shape, and error envelope.
- Validate request DTOs (Bean Validation).

### 4.4 Persistence Tests
- Use H2 in-memory for repository tests.
- Flyway migrations must run cleanly in the test profile.
- Test cascade deletes and constraints.

### 4.5 Coverage Targets
- Services: **80% line coverage** minimum.
- Command layer: **90%** (safety-critical).
- Controllers: every endpoint has at least one test.
- Exclusions: DTOs, config classes.

## 5. Frontend Testing

### 5.1 Component Tests
- Vitest + React Testing Library.
- Test rendered output and user interactions, not internal state.
- One smoke test per feature page.

```tsx
it('shows confirm dialog before deleting', async () => {
  render(<CleanerPage />);
  await userEvent.click(screen.getByRole('button', { name: /delete files/i }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

### 5.2 Hook Tests
- Use `renderHook` for custom hooks.
- Mock the API client (`src/lib/api.ts`) with MSW.

### 5.3 API Mocking
- MSW (Mock Service Worker) intercepts requests in tests.
- Fixtures mirror `API_CONTRACT.md` shapes.
- SSE mocked via a fake `EventSource`.

### 5.4 Error & Empty States
- Every data view has tests for: loading, empty, error, success.

### 5.5 Coverage Targets
- Components: **70% line coverage** minimum.
- Hooks: **80%**.
- Critical flows (repair, cleaner, recovery): 100% of happy + error paths.

## 6. Contract Testing

- Fixtures in `frontend/src/test/fixtures/` match `API_CONTRACT.md`.
- A schema validation test ensures fixtures conform to the contract.
- Backend integration tests assert response shapes match the same schemas.

## 7. End-to-End (Optional)

- Playwright runs against a locally started backend + frontend.
- Uses a **test profile** where `CommandRunner` is a fake bean.
- No real system changes.
- Run manually or nightly; not on every PR.

## 8. Test Data

- No production data in tests.
- Use generated fixtures and in-memory DB.
- Temp directories for file-system tests (cleaned up after).

## 9. CI Expectations (Future GitHub Actions)

| Stage | Command |
|-------|---------|
| Frontend lint | `npm run lint` |
| Frontend test | `npm test -- --run` |
| Backend test | `./mvnw test` |
| Build | `npm run build` + `./mvnw package` |

CI must pass before merge. Flaky tests are quarantined and fixed promptly.

## 10. Manual Testing Checklist (Pre-Release)

- [ ] Repair flow with a fake action (no real SFC)
- [ ] Cleaner preview → confirm → delete in a temp folder
- [ ] Duplicate scan on a temp folder
- [ ] Restore point creation (non-destructive check)
- [ ] Cancel a running task
- [ ] Error state (stop backend, click Retry)
- [ ] Keyboard-only navigation of main flows

## 11. Related Documents
- `docs/engineering/ERROR_HANDLING.md`
- `docs/engineering/PERFORMANCE.md`
- `docs/api/API_CONTRACT.md`
- `CONTRIBUTING.md`

## 12. Status
Draft — v0.1