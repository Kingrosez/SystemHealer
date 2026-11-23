# Security Guidelines

## 1. Purpose
This document defines the security model and best practices for SystemHealer.

## 2. Security Model

### 2.1 Threat Model
SystemHealer operates in a local desktop context with elevated Windows privileges:

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| Local privilege escalation | Medium | High | Run as admin only when needed |
| Data exfiltration | Low | Medium | No network data collection |
| Command injection | Medium | High | Strict input validation, parameterized commands |
| Credential exposure | Low | High | No credential storage |

### 2.2 Design Principles
- **Principle of Least Privilege**: Only elevate to admin when performing Windows repairs
- **Defense in Depth**: Multiple layers of validation (input, command, execution)
- **Secure by Default**: Safe defaults, no configuration required
- **Fail Securely**: Errors reveal no sensitive information

## 3. Input Validation

### 3.1 API Input
All API endpoints validate input before processing:

```java
public record RepairRequest(
    @NotNull boolean createRestorePoint,
    @NotBlank String operationType
) {}
```

### 3.2 Windows Command Arguments
- Never interpolate user input into commands
- Use allowlist for valid operations
- Validate file paths against allowlist

```java
public enum RepairOperation {
    SFC("/scannow"),
    DISM("/online /cleanup-image /restorehealth"),
    NETWORK("netsh winsock reset");

    private final String arguments;
}
```

## 4. Authentication & Authorization

### 4.1 Current State (v1)
- No network endpoints exposed
- Local-only API on localhost
- No authentication required

### 4.2 Future Considerations
When network access is added:
- OAuth 2.0 / OpenID Connect
- API keys for service access
- Role-based access control

```java
// Future implementation
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/api/admin/*")
public ResponseEntity<?> adminOperation() { ... }
```

## 5. Secrets Management

### 5.1 What IS Stored
- Application settings (non-sensitive)
- Local database file (`systemhealer.db`)
- Optional: Windows credentials (if added)

### 5.2 What is NEVER Stored
- API keys
- Passwords
- Windows credentials
- User personal data

### 5.3 .gitignore Protection
```
# Never commit
.env
*.key
*secret*
!*.example
```

## 6. Windows Integration Security

### 6.1 Process Execution
- Use `ProcessBuilder` with argument array (not shell string)
- Set `inheritIO` to false
- Capture output, don't echo to console

```java
ProcessBuilder pb = new ProcessBuilder(
    "sfc", "/scannow"
);
pb.redirectOutput(ProcessBuilder.Redirect.PIPE);
pb.redirectError(ProcessBuilder.Redirect.PIPE);
```

### 6.2 PowerShell Considerations
- Never execute raw PowerShell scripts from input
- Use specific PowerShell commands with validated arguments
- Sanitize any file paths: `[System.IO.Path]::GetFullPath()`

### 6.3 Restore Points
- Create restore points before destructive operations
- User must confirm restore point creation
- Log restore point ID for audit trail

## 7. Data Protection

### 7.1 Encryption at Rest
- SQLite database encrypted if sensitive data added
- Use SQLCipher for encryption

### 7.2 Backups
- Backup files contain no credentials
- Encrypt backups if stored externally
- Local backups only by default

## 8. Logging & Audit

### 8.1 What is Logged
- Operation start/end times
- Operation type and status
- Error codes (not stack traces in production)
- Restore point IDs

### 8.2 What is NOT Logged
- File paths being repaired
- System command output
- Windows error messages

### 8.3 Log Sanitization
```java
// Sanitize before logging
public void logOperation(String operation, int exitCode) {
    if (exitCode != 0) {
        log.error("Operation failed: {} with code {}", operation, exitCode);
    }
}
```

## 9. Security Testing

### 9.1 Static Analysis
- SpotBugs for Java
- ESLint security rules for TypeScript
- Dependency vulnerability scanning

### 9.2 Dynamic Testing
- OWASP ZAP for any future web interfaces
- Command injection test cases
- Path traversal tests

## 10. Security Checklist

Before each release:

- [ ] No `.env` files in build
- [ ] No hardcoded credentials
- [ ] All commands use validated arguments
- [ ] No sensitive data in logs
- [ ] Dependencies scanned for vulnerabilities
- [ ] Backup files are secure