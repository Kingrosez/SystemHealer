# Security

## 1. Purpose
This document defines the security model, threat assumptions, safeguards, and
practices for SystemHealer. Because the application executes privileged Windows
commands and deletes files, security is about **preventing accidental or malicious
destructive actions** and **keeping all data local**.

## 2. Security Principles

- **Local-only by default**: no network exposure, no cloud, no telemetry.
- **Least privilege**: request administrator rights only when needed.
- **Defense in depth**: multiple safeguards before any destructive action.
- **No secrets in the repo**: configuration via environment variables.
- **Fail safe**: on error, do nothing destructive.
- **Transparency**: log every privileged action.

## 3. Threat Model

### 3.1 In Scope
- Accidental destructive actions by the user (wrong click, misconfiguration).
- Malicious local processes attempting to call the backend API.
- Command injection through user-supplied paths or arguments.
- Elevation abuse (running more operations as admin than necessary).
- Data leakage of logs or file paths.

### 3.2 Out of Scope (v1)
- Remote attackers (backend is localhost-only).
- Kernel-level malware or rootkits.
- Physical access attacks.
- Supply-chain attacks on Windows itself.

## 4. Network Security

- Backend binds to **127.0.0.1 only** — never `0.0.0.0`.
- CORS restricted to the frontend origin (`http://localhost:5173` in dev,
  packaged origin in prod).
- No authentication in v1 (local-only), but a session token is planned for v1.1.
- All API calls are HTTP on localhost; TLS is unnecessary for loopback but may
  be added if the backend is ever exposed.
- SSE connections are scoped to a `taskId` and closed on completion.

## 5. Command Execution Security

This is the highest-risk area. Rules:

- **Never build command strings from user input.** Use `ProcessBuilder` with
  argument lists.
- **Allowlist commands**: only a fixed set of known commands (sfc, DISM, netsh,
  ipconfig, reg, winget, PowerShell with fixed scripts) may be executed.
- **No shell interpolation**: never pass user input through `cmd /c` or
  `powershell -Command "<user input>"`.
- **Validate paths**: reject paths containing `..`, null bytes, or characters
  outside the expected set.
- **Timeouts**: every command has a timeout; kill on expiry.
- **Logging**: every command is logged with args (redacted if sensitive), exit
  code, and duration.
- **Admin check**: privileged operations check for administrator elevation before
  running and return `ADMIN_REQUIRED` if missing.

Example — safe vs unsafe:

```java
// UNSAFE — string interpolation
Runtime.getRuntime().exec("powershell -Command Remove-Item " + userPath);

// SAFE — argument list, allowlisted script
new ProcessBuilder("powershell", "-NoProfile", "-File",
    "scripts/remove-item.ps1", "--path", validatedPath);
```

## 6. Destructive Action Safeguards

Every destructive operation must pass through all of these:

1. **Preview**: `POST .../preview` returns what will be affected + `confirmToken`.
2. **User confirmation**: frontend shows a dialog; user must click Confirm.
3. **Token validation**: backend verifies the single-use, 5-minute token.
4. **Safety rules**: e.g., duplicate deletion never removes all copies in a group.
5. **Restore point**: high-risk operations create a restore point first.
6. **Audit log**: every deletion recorded with timestamp, path, and outcome.

If any step fails, the operation is aborted — no partial destructive state.

## 7. Administrator Elevation

- The app requests elevation at launch (manifest or launcher script).
- The backend checks `isAdmin` before privileged operations and returns
  `ADMIN_REQUIRED` (HTTP 403) if not elevated.
- Non-privileged features (viewing history, listing programs) work without admin.
- Elevation is never requested silently mid-operation — the UI shows a clear
  prompt explaining why admin is needed.

## 8. File System Security

- Default scan roots exclude system-critical directories:
  `C:\Windows`, `C:\Program Files\WindowsApps`, `$Recycle.Bin`, restore points.
- Deletions go to the Recycle Bin by default; permanent delete requires an
  explicit opt-in.
- Paths are validated and normalized before use.
- Symlinks are not followed during scans (prevents traversal loops).

## 9. Data Protection

- **No telemetry**: the app does not send data anywhere.
- **No cloud sync**: all data stays on the machine.
- **Local DB**: SQLite file under `%APPDATA%\SystemHealer\`.
- **Logs**: may contain file paths; retention is configurable (default 90 days).
- **Secrets**: none stored in the app; any future API keys use environment
  variables or OS credential store (Windows Credential Manager).

## 10. BitLocker Awareness

- The backend detects BitLocker status (`manage-bde -status`).
- Recovery operations display a warning if BitLocker is enabled on the system drive.
- The user is prompted to ensure they have their recovery key before proceeding.

## 11. Dependency & Supply Chain

- Pin dependency versions (`package-lock.json`, Maven BOMs).
- Review new dependencies before adding (license, maintenance, size).
- No dependencies from untrusted sources.
- Future: automated vulnerability scanning in CI (e.g., `npm audit`, OWASP
  Dependency-Check).

## 12. Secure Development Practices

- No secrets committed — `.env` is gitignored; config uses env vars.
- Code review required for all PRs (even solo — self-review diff).
- Agents must never execute real destructive commands during development
  (see `AGENTS.md`).
- Tests mock the command layer; no real system changes in CI.

## 13. Incident Response (Local)

If a destructive action goes wrong:
1. Stop the operation (cancel task).
2. Check the audit log for exactly what was done.
3. Restore from the pre-operation restore point (Recovery tab).
4. Restore registry keys from the `.reg` backup if applicable.
5. Report the issue with logs and `traceId`.

## 14. Future Security Work (v1.1+)

- Session token for API calls (defense against other local processes).
- Signed installer and binaries.
- Optional code signing for the JAR.
- Automated dependency vulnerability scanning in CI.
- Windows Credential Manager integration for any future secrets.

## 15. Related Documents
- `docs/engineering/ERROR_HANDLING.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/ARCHITECTURE_DECISIONS.md`
- `AGENTS.md`

## 16. Status
Draft — v0.1