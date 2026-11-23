# Error Handling

## 1. Purpose
This document defines the error handling strategy for SystemHealer. All error
conditions must be handled consistently across frontend and backend.

## 2. Error Categories

| Category | Description | Example |
|----------|-------------|---------|
| Validation | User input doesn't meet requirements | Empty required field |
| Authentication | User not authenticated | Missing token |
| Authorization | User lacks permission | Delete without admin |
| Not Found | Resource doesn't exist | Unknown repair ID |
| Conflict | Resource state conflict | Duplicate operation |
| Server | Backend error | Database unavailable |
| Windows | OS-level error | Permission denied, system file in use |

## 3. Backend Error Handling

### 3.1 Exception Hierarchy

```
SystemHealerException (base)
├── ValidationException → 400 Bad Request
├── AuthenticationException → 401 Unauthorized
├── AuthorizationException → 403 Forbidden
├── ResourceNotFoundException → 404 Not Found
├── ConflictException → 409 Conflict
├── WindowsCommandException → 500 Internal Server Error
└── SystemHealerRuntimeException → 500 Internal Server Error
```

### 3.2 Global Exception Handler

`@ControllerAdvice` class handles all exceptions and converts to standardized
JSON response.

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
}
```

### 3.3 Error Response Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Title is required",
  "path": "/api/repair"
}
```

### 3.4 Windows Command Errors

Windows commands can fail for various reasons. All command execution must:

1. Capture stderr output
2. Capture exit code
3. Wrap in domain-specific exception

```java
public record CommandResult(int exitCode, String stdout, String stderr) {}

public CommandResult execute(String... args) throws WindowsCommandException {
    try {
        Process process = new ProcessBuilder(args).start();
        // ... read output ...
        if (process.exitValue() != 0) {
            throw new WindowsCommandException(
                "Command failed with exit code " + process.exitValue(),
                process.exitValue(),
                stderr
            );
        }
        return new CommandResult(process.exitValue(), stdout, stderr);
    } catch (IOException e) {
        throw new WindowsCommandException("Failed to execute command", e);
    }
}
```

## 4. Frontend Error Handling

### 4.1 API Error Handling

Use TanStack Query's error handling:

```tsx
const { data, error, isError } = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
    errorThreshold: (error) => error.status >= 500 ? Infinity : 0,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});

if (isError) {
    if (error.status === 404) {
        return <NotFound />;
    }
    if (error.status === 403) {
        return <AccessDenied />;
    }
    return <ErrorDisplay message={error.message} />;
}
```

### 4.2 Toast Notifications

Use toast notifications for user-facing errors:

```tsx
const showToast = useToast();

mutate(newRepair, {
  onError: (error: ErrorResponse) => {
    showToast({
      title: getErrorTitle(error.code),
      description: error.message,
      variant: "destructive",
    });
  }
});
```

### 4.3 Form Validation Errors

```tsx
const form = useForm<RepairForm>({
  resolver: zodResolver(schema),
  mode: "onSubmit"
});

if (form.formState.errors) {
  // Errors displayed inline with form fields
}
```

## 5. Error Logging

### 5.1 Backend Logging

```java
@Slf4j
@Service
public class RepairService {
    public void executeSfc() {
        log.info("Starting SFC scan");
        try {
            CommandResult result = executor.execute("sfc", "/scannow");
            log.info("SFC completed with exit code {}", result.exitCode());
        } catch (Exception e) {
            log.error("SFC failed", e);
            throw new RepairFailedException("SFC scan failed", e);
        }
    }
}
```

### 5.2 Frontend Logging

Use Sentry or similar for client-side error tracking (future).

## 6. Error Recovery

### 6.1 Automatic Retry

Retry strategies:
- Network errors: exponential backoff (3 attempts)
- Rate limiting: wait for retry-after header
- Transient Windows errors: notify user, suggest retry

### 6.2 Manual Recovery

Some errors require user action:
- Permission denied: "Run as administrator"
- System file in use: "Close programs and retry"
- Restore point failed: "Create restore point manually in Windows"

## 7. Error Messages to Users

### 7.1 Principles
- Clear and actionable
- No stack traces
- Link to documentation if helpful
- Localized in future versions

### 7.2 Message Guidelines

| Error Type | User Message |
|------------|--------------|
| Validation | "Please fill in all required fields." |
| Permission | "Please run SystemHealer as administrator." |
| Network | "Network error. Please check your connection and try again." |
| System command | "Unable to complete operation. See logs for details." |
| Unknown | "An unexpected error occurred. Please try again or contact support." |

## 8. Monitoring and Alerting

### 8.1 Log Levels
- `ERROR`: Unexpected failures, system errors
- `WARN`: Recoverable issues, deprecated usage
- `INFO`: Major operations (repair started/completed)
- `DEBUG`: Detailed diagnostic information (dev only)

### 8.2 Error Metrics
Track error counts by type:
- Total errors per hour
- Error types distribution
- Recovery success rate

## 9. Testing Error Handling

### 9.1 Backend Tests

```java
@Test
void handleValidationException_returnsBadRequest() {
    mockMvc.perform(post("/api/repair")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
}

@Test
void handleWindowsException_returnsInternalServerError() {
    given(repairService.executeSfc()).willThrow(
        new WindowsCommandException("Access denied"));

    mockMvc.perform(post("/api/repair/sfc"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.code").value("WINDOWS_ERROR"));
}
```

### 9.2 Frontend Tests

```tsx
it("shows error message when API returns 500", () => {
  server.use(
    rest.post("/api/repair/sfc", (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<RepairPage />);
  fireEvent.click(screen.getByText("Run SFC"));

  expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
});
```

## 10. Debugging Guide

### 10.1 Backend Debugging
1. Check application logs: `tail -f logs/application.log`
2. Enable debug logging: `logging.level.com.kingrosez=DEBUG`
3. Use debugger with `./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"`

### 10.2 Frontend Debugging
1. Open browser DevTools (F12)
2. Check Network tab for failed requests
3. Console logs: `console.error()` statements
4. React DevTools for component state

### 10.3 Windows Command Debugging
1. Test command manually in PowerShell
2. Check exit code: `$LASTEXITCODE`
3. Verify permissions (run as admin if needed)
4. Check Windows event logs: `Get-EventLog`