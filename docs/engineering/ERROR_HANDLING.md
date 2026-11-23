# Error Handling

## 1. Purpose
This document defines how SystemHealer detects, represents, propagates, logs, and
surfaces errors across the backend (Spring Boot) and frontend (React). Because the
app executes privileged Windows commands, error handling must be predictable,
safe, and never leave the system in an unknown state.

## 2. Principles

- **Fail loudly in logs, softly in UI**: log full detail server-side; show plain language to users.
- **Never swallow errors**: every `catch` must log or rethrow.
- **No partial destructive state**: if a destructive operation fails midway, the system must report exactly what succeeded and what didn't.
- **Recoverable vs. fatal**: distinguish errors the user can fix (e.g., "run as administrator") from those requiring a restart or rollback.
- **No stack traces to the frontend**: internal details stay server-side.

## 3. Backend Error Model

### 3.1 Exception Hierarchy

```
SystemHealerException (base, extends RuntimeException)
├── ValidationException          → HTTP 400
├── NotFoundException            → HTTP 404
├── ConflictException            → HTTP 409
├── PermissionDeniedException    → HTTP 403
├── CommandExecutionException    → HTTP 500 (wraps process failures)
├── DependencyUnavailableException → HTTP 503 (e.g., winget missing)
└── InternalException            → HTTP 500 (fallback)
```

Each exception carries:
- `code` (machine-readable, e.g., `REPAIR_SFC_FAILED`)
- `message` (developer-facing)
- `userMessage` (plain-language, safe to show)
- optional `details` map (safe context)

### 3.2 Standard Error Response

All errors return a consistent JSON shape.

```json
{
  "timestamp": "2026-11-23T10:15:30Z",
  "status": 500,
  "code": "REPAIR_SFC_FAILED",
  "message": "SFC scan failed with exit code 1",
  "userMessage": "System File Checker could not complete. Try running as administrator.",
  "path": "/api/repair/start",
  "traceId": "a1b2c3d4"
}
```

`traceId` links to backend logs for support.

### 3.3 Global Exception Handler

Implement `@RestControllerAdvice` (`GlobalExceptionHandler`) that:
- Maps each exception type to the correct HTTP status.
- Builds the standard error response.
- Logs at `ERROR` (unexpected) or `WARN` (expected/validation).
- Never leaks stack traces or file paths.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(CommandExecutionException.class)
  public ResponseEntity<ErrorResponse> handleCommand(CommandExecutionException ex) {
    log.error("Command failed: {} (exit={})", ex.getCode(), ex.getExitCode(), ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ErrorResponse.from(ex));
  }
}
```

## 4. Command Execution Errors

The `exec/CommandRunner` is the highest-risk area. Rules:

- Every command has a **timeout** (default 10 minutes for SFC/DISM, 2 minutes for quick commands).
- On non-zero exit code → throw `CommandExecutionException` with:
  - command name (not raw args if they contain sensitive paths)
  - exit code
  - last N lines of stderr
- On timeout → kill the process, throw `CommandExecutionException` with `code = COMMAND_TIMEOUT`.
- On process launch failure → `InternalException`.
- **Partial success**: if a multi-step repair fails at step 3 of 5, report which steps succeeded and which failed. Do not report overall "success".

## 5. Frontend Error Handling

### 5.1 API Errors
- Every TanStack Query/mutation defines an `onError` handler.
- API client (`src/lib/api.ts`) normalizes error responses into a typed `ApiError { code, message, userMessage, status }`.
- UI shows `userMessage` (never `message` or stack traces).

### 5.2 Error States per View
Every data-driven view must handle four states:
- **Loading**: spinner or skeleton.
- **Empty**: friendly "nothing here" message.
- **Error**: plain-language message + retry button.
- **Success**: normal render.

### 5.3 Error Boundaries
- Wrap route-level components in an `ErrorBoundary`.
- On crash: show a fallback UI with "Reload" and "Go to Dashboard".
- Log the error to console in dev; in production, optionally send to a local log endpoint (future).

### 5.4 User-Facing Messages
- Plain language, no codes, no jargon.
- Actionable: tell the user what to do next.
- Examples:
  - ❌ "CommandExecutionException: exit 1"
  - ✅ "System File Checker could not complete. Try running as administrator."
  - ❌ "ECONNREFUSED 127.0.0.1:8080"
  - ✅ "Can't reach the SystemHealer service. Make sure it's running and try again."

## 6. Logging

| Level | When | Example |
|-------|------|---------|
| `ERROR` | Unexpected failures, command failures | SFC failed with exit 1 |
| `WARN` | Recoverable issues, validation failures | Restore point skipped (24h limit) |
| `INFO` | Major operations | Repair started, cleanup completed |
| `DEBUG` | Detailed flow (dev only) | Command args, intermediate results |

Rules:
- Backend: SLF4J. No `System.out.println`.
- Frontend: no `console.log` in committed code.
- Logs include `traceId` for correlation.
- Never log secrets, tokens, or full file contents.

## 7. Safety-Critical Errors (Repair / Recovery)

| Scenario | Behavior |
|----------|----------|
| Restore point creation fails | Abort high-risk operation; tell user to enable System Protection |
| SFC/DISM exits non-zero | Report failure + suggest reboot + retry; link to logs |
| Registry delete fails midway | Stop; report which keys were deleted; offer restore from backup |
| Duplicate deletion fails on some files | Report per-file results; never silently skip |
| Winget missing | `DependencyUnavailableException`; disable updater UI with explanation |
| BitLocker enabled + recovery action | Warn user; require explicit confirmation |

## 8. Retry Policy

- **Never auto-retry destructive operations.**
- Safe read-only operations (scan, list, preview) may retry once on transient failure (network, timeout).
- User-initiated retry is always available via the UI.
- Log every retry attempt.

## 9. Testing Error Paths

- Every service method must have at least one test for its failure path.
- `CommandRunner` tests must simulate: non-zero exit, timeout, launch failure.
- Controller tests must verify the standard error response shape.
- Frontend tests must cover loading/error/empty states for each page.

## 10. Related Documents
- `docs/engineering/CODING_STANDARDS.md`
- `docs/engineering/DEVELOPMENT_WORKFLOW.md`
- `docs/api/API_CONTRACT.md`
- `docs/operations/OBSERVABILITY.md`
- `docs/testing/TESTING_STRATEGY.md`

## 11. Status
Draft — v0.1