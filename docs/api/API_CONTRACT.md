# API Contract

## 1. Purpose
This document is the single source of truth for the HTTP API between the React
frontend and the Spring Boot backend. Both sides must implement against this
contract. Any change requires an update to this document **before** code changes.

## 2. Conventions

- Base URL: `http://127.0.0.1:8080/api`
- Content type: `application/json` (except SSE endpoints)
- Encoding: UTF-8
- Timestamps: ISO-8601 UTC (`2026-11-23T10:15:30Z`)
- IDs: UUID v4 strings
- All endpoints are local-only; CORS restricted to the frontend origin.

### 2.1 Standard Error Response
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

- `userMessage` is **required** on every error response and is the only
  message safe to show to end users.
- `traceId` is optional but should be included when available to aid support.
- `path` is the request path that produced the error.

### 2.2 Standard Success Envelope (for list endpoints)
```json
{
  "items": [ ... ],
  "page": 0,
  "size": 50,
  "total": 1234
}
```

### 2.3 Confirmation Token Flow (Destructive Endpoints)
Destructive endpoints require a two-step flow:

1. `POST .../preview` → returns what will be affected + a `confirmToken`.
2. `POST .../execute` with `confirmToken` → performs the action.

Tokens are single-use and expire after 5 minutes.

For duplicate deletion the preview step is
`POST /api/cleaner/duplicates/preview` (see §4.26); its `confirmToken` must be
sent to `POST /api/cleaner/duplicates/execute`.

## 3. Endpoint Index

| Method | Path | Module | Purpose |
|--------|------|--------|---------|
| GET | `/api/health` | common | Health check |
| GET | `/api/system/info` | common | OS, CPU, RAM, admin status, BitLocker |
| GET | `/api/disk/usage` | disk | Drive list + latest usage scan results |
| POST | `/api/disk/scan` | disk | Start an asynchronous disk usage scan |
| GET | `/api/disk/stream/{taskId}` | disk | SSE disk scan progress |
| GET | `/api/repair/options` | repair | Available repair actions |
| POST | `/api/repair/start` | repair | Start a repair run |
| GET | `/api/repair/stream/{taskId}` | repair | SSE log stream |
| POST | `/api/repair/{taskId}/cancel` | repair | Cancel a running repair |
| GET | `/api/repair/history` | repair | Paginated repair history |
| GET | `/api/repair/history/{id}` | repair | Single repair detail + logs |
| GET | `/api/programs` | uninstaller | Installed programs list |
| POST | `/api/programs/{id}/uninstall` | uninstaller | Trigger uninstall |
| POST | `/api/programs/{id}/leftovers/preview` | uninstaller | Scan leftovers |
| POST | `/api/programs/{id}/leftovers/execute` | uninstaller | Delete leftovers |
| POST | `/api/cleaner/scan` | cleaner | Scan junk/cache |
| POST | `/api/cleaner/preview` | cleaner | Preview items + confirmToken |
| POST | `/api/cleaner/execute` | cleaner | Delete selected items |
| POST | `/api/cleaner/duplicates/scan` | cleaner | Start duplicate scan |
| GET | `/api/cleaner/duplicates/stream/{taskId}` | cleaner | SSE duplicate scan progress |
| GET | `/api/cleaner/duplicates/groups` | cleaner | Paginated duplicate groups |
| POST | `/api/cleaner/duplicates/preview` | cleaner | Preview duplicate groups + confirmToken |
| POST | `/api/cleaner/duplicates/execute` | cleaner | Delete selected duplicates |
| GET | `/api/updater/scan` | updater | Scan for outdated software |
| POST | `/api/updater/execute` | updater | Execute updates |
| GET | `/api/updater/stream/{taskId}` | updater | SSE update progress |
| GET | `/api/recovery/restore-points` | recovery | List available restore points |
| POST | `/api/recovery/restore-points` | recovery | Create a restore point |
| POST | `/api/recovery/restore` | recovery | Restore to a selected point |
| GET | `/api/settings` | settings | Get app settings |
| PUT | `/api/settings` | settings | Update app settings |

## 4. Endpoint Details

### 4.1 GET `/api/health`
Response 200:
```json
{ "status": "ok", "version": "0.1.0", "uptimeSeconds": 1234 }
```

### 4.2 GET `/api/system/info`
Response 200:
```json
{
  "os": "Windows 11 Pro 23H2",
  "build": "22631",
  "cpu": "Intel Core i7-12700",
  "ramGb": 32,
  "isAdmin": true,
  "bitLockerEnabled": false,
  "wingetAvailable": true
}
```

### 4.3 GET `/api/repair/options`
Response 200:
```json
{
  "options": [
    { "id": "sfc", "name": "System File Checker", "risk": "low" },
    { "id": "dism", "name": "DISM Image Repair", "risk": "low" },
    { "id": "network", "name": "Network Reset", "risk": "medium" },
    { "id": "windows-update", "name": "Windows Update Repair", "risk": "medium" }
  ]
}
```

### 4.4 POST `/api/repair/start`
Request:
```json
{ "actions": ["sfc", "dism"], "createRestorePoint": true }
```

Response 202:
```json
{ "taskId": "uuid", "streamUrl": "/api/repair/stream/uuid" }
```

Notes:
- If `createRestorePoint` is `true`, the request must include a valid
  `X-Confirm-Token` header. Tokens are single-use and expire after 5 minutes.
- Without a valid token the backend responds `409` with a challenge body:

```json
{
  "taskId": null,
  "streamUrl": null,
  "restorePointStatus": "restore_point_required",
  "restorePointToken": "rp_..."
}
```

- The client should create a restore point via §4.23, then retry the request
  with `X-Confirm-Token: <restorePointToken>`. The backend does not create the
  restore point itself.
- If `createRestorePoint` is `false`, no token is required.
- If restore point creation fails, the client may still retry with the token
  after the user explicitly acknowledges the warning.

### 4.5 GET `/api/repair/stream/{taskId}` (SSE)
Response: `text/event-stream`. Events:
```
event: log
data: {"line":"Beginning SFC scan...","level":"INFO","timestamp":"..."}

event: progress
data: {"step":"sfc","percent":45}

event: complete
data: {"taskId":"uuid","status":"SUCCESS","summary":{"repaired":3,"failed":0}}
```

### 4.6 POST `/api/repair/{taskId}/cancel`
Response 204. Kills the process and emits `complete` with `status: CANCELLED`.

### 4.7 GET `/api/repair/history?page=0&size=50`
Response 200 (standard envelope):
```json
{
  "items": [
    {
      "id": "uuid",
      "startedAt": "2026-11-23T10:00:00Z",
      "finishedAt": "2026-11-23T10:05:00Z",
      "actions": ["sfc","dism"],
      "status": "SUCCESS",
      "summary": { "repaired": 3, "failed": 0 }
    }
  ],
  "page": 0, "size": 50, "total": 1
}
```

### 4.8 GET `/api/repair/history/{id}`
Response 200: full record + paginated log lines.

### 4.9 GET `/api/programs?search=&page=0&size=100`
Response 200 (standard envelope):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Example App",
      "publisher": "Example Inc.",
      "version": "1.2.3",
      "installDate": "2025-06-01T00:00:00Z",
      "sizeBytes": 123456789,
      "uninstallString": "..."
    }
  ],
  "page": 0, "size": 100, "total": 1
}
```

### 4.10 POST `/api/programs/{id}/uninstall`
Request:
```json
{ "force": false }
```

Response 202: `{ "taskId": "uuid", "streamUrl": "/api/programs/{id}/stream/{taskId}" }`

### 4.11 POST `/api/programs/{id}/leftovers/preview`
Response 200:
```json
{
  "files": [{ "path": "C:\\ProgramData\\ExampleApp", "sizeBytes": 4096 }],
  "registryKeys": ["HKCU\\Software\\ExampleApp"],
  "confirmToken": "tok_abc"
}
```

### 4.12 POST `/api/programs/{id}/leftovers/execute`
Request:
```json
{ "confirmToken": "tok_abc", "files": ["..."], "registryKeys": ["..."] }
```

Response 200: `{ "deleted": 5, "failed": 0, "failures": [] }`

### 4.13 POST `/api/cleaner/scan`
Request: `{ "roots": ["C:\\Users\\Me\\AppData\\Local\\Temp"], "categories": ["temp","logs","cache"] }`
Response 202: `{ "taskId": "uuid", "streamUrl": "/api/cleaner/stream/uuid" }`

### 4.14 POST `/api/cleaner/preview`
Response 200:
```json
{
  "items": [
    { "path": "...", "category": "temp", "sizeBytes": 1234 }
  ],
  "totalSizeBytes": 5678,
  "confirmToken": "tok_xyz"
}
```

### 4.15 POST `/api/cleaner/execute`
Request: `{ "confirmToken": "tok_xyz", "paths": ["..."] }`
Response 200: `{ "deleted": 10, "freedBytes": 12345, "failures": [] }`

### 4.16 POST `/api/cleaner/duplicates/scan`
Request: `{ "roots": ["D:\\"], "minSizeBytes": 1024 }`
Response 202: `{ "taskId": "uuid", "streamUrl": "/api/cleaner/duplicates/stream/uuid" }`

### 4.17 GET `/api/cleaner/duplicates/stream/{taskId}` (SSE)
Events: `progress`, `log`, `complete` (same pattern as repair).

### 4.18 GET `/api/cleaner/duplicates/groups?page=0&size=50`
Response 200 (standard envelope):
```json
{
  "items": [
    {
      "groupId": "uuid",
      "hash": "sha256:...",
      "sizeBytes": 1024,
      "files": [
        { "id": "uuid", "path": "D:\\a\\file.txt", "modifiedAt": "..." },
        { "id": "uuid", "path": "D:\\b\\file.txt", "modifiedAt": "..." }
      ]
    }
  ],
  "page": 0, "size": 50, "total": 12
}
```

### 4.19 POST `/api/cleaner/duplicates/execute`
Request:
```json
{ "confirmToken": "tok_dupe", "fileIds": ["uuid1","uuid2"] }
```

Response 200: `{ "deleted": 2, "freedBytes": 2048, "failures": [] }`
The `confirmToken` must come from `POST /api/cleaner/duplicates/preview` (§4.26).
Server rejects any request that would delete **all** copies in a group (409 `WOULD_DELETE_ALL_COPIES`).

### 4.20 GET `/api/updater/scan`
Response 200:
```json
{
  "available": true,
  "updates": [
    { "id": "uuid", "name": "Example App", "currentVersion": "1.2.3", "availableVersion": "1.3.0" }
  ]
}
```

### 4.21 POST `/api/updater/execute`
Request: `{ "ids": ["uuid1","uuid2"] }`
Response 202: `{ "taskId": "uuid", "streamUrl": "/api/updater/stream/uuid" }`

### 4.22 GET `/api/recovery/restore-points`
Response 200:
```json
{
  "points": [
    { "id": "uuid", "description": "Pre-repair 2026-11-23", "createdAt": "2026-11-23T10:00:00Z", "sequenceNumber": 12 }
  ]
}
```

### 4.23 POST `/api/recovery/restore-points`
Request: `{ "description": "Before cleanup" }`
Response 201: `{ "id": "uuid", "createdAt": "..." }`
Returns 409 `RESTORE_POINT_LIMIT` if Windows refuses (24-hour limit).

### 4.24 POST `/api/recovery/restore`
Request: `{ "pointId": "uuid", "confirm": true }`
Response 202: `{ "taskId": "uuid" }` (system restore runs; app may exit).

### 4.25 GET/PUT `/api/settings`
Settings shape (key-value):
```json
{
  "logRetentionDays": 90,
  "defaultScanRoots": ["C:\\Users"],
  "theme": "system",
  "createRestorePointByDefault": true
}
```

### 4.26 POST `/api/cleaner/duplicates/preview`
Request (pagination is optional):
```json
{ "page": 0, "size": 50 }
```

Response 200:
```json
{
  "items": [
    {
      "groupId": "uuid",
      "hash": "sha256:...",
      "sizeBytes": 1024,
      "files": [
        { "id": "uuid", "path": "D:\\a\\file.txt", "modifiedAt": "..." },
        { "id": "uuid", "path": "D:\\b\\file.txt", "modifiedAt": "..." }
      ]
    }
  ],
  "page": 0,
  "size": 50,
  "total": 12,
  "confirmToken": "tok_dupe_..."
}
```

Notes:
- The token is single-use, expires after 5 minutes, and must be sent to
  `POST /api/cleaner/duplicates/execute` (§4.19).
- The client must keep at least one file selected per group; the server
  rejects any request that would delete every copy in a group with
  409 `WOULD_DELETE_ALL_COPIES`.

### 4.27 GET `/api/disk/usage`
Response 200:
```json
{
  "drives": [
    {
      "letter": "C:",
      "label": "System",
      "totalBytes": 512000000000,
      "usedBytes": 300000000000,
      "freeBytes": 212000000000,
      "fileSystem": "NTFS"
    }
  ],
  "usage": [
    {
      "path": "C:\\Users",
      "name": "Users",
      "sizeBytes": 123456789,
      "isDirectory": true,
      "children": []
    }
  ]
}
```

Notes:
- `usage` holds the most recent scan results and may be empty before the
  first scan.
- `children` is optional and may be omitted for leaf items.

### 4.28 POST `/api/disk/scan`
Request:
```json
{ "drive": "C:", "maxDepth": 3 }
```

Response 202:
```json
{ "taskId": "uuid", "streamUrl": "/api/disk/stream/uuid" }
```

Notes:
- The scan runs asynchronously. The client may poll `GET /api/disk/usage`
  for updated results or consume the SSE stream.

### 4.29 GET `/api/disk/stream/{taskId}` (SSE)
Response: `text/event-stream`. Events follow the standard pattern used by the
other streaming endpoints (`progress`, `log`, `complete`, see §4.5).

## 5. HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 202 | Accepted (async task started) |
| 204 | No Content |
| 400 | Validation error |
| 403 | Permission denied (e.g., not admin) |
| 404 | Not found |
| 409 | Conflict (e.g., restore point limit, duplicate deletion rule) |
| 500 | Internal error (command failure) |
| 503 | Dependency unavailable (e.g., winget missing) |

## 6. Error Codes (Machine-Readable)

| Code | When |
|------|------|
| `VALIDATION_FAILED` | Bad request body |
| `ADMIN_REQUIRED` | Operation needs admin |
| `RESTORE_POINT_FAILED` | Could not create restore point |
| `RESTORE_POINT_LIMIT` | Windows 24-hour limit hit |
| `COMMAND_TIMEOUT` | Command exceeded timeout |
| `COMMAND_FAILED` | Non-zero exit code |
| `WOULD_DELETE_ALL_COPIES` | Duplicate deletion safety rule |
| `WINGET_UNAVAILABLE` | Winget not installed |
| `BITLOCKER_ENABLED` | Recovery blocked while BitLocker active |
| `TASK_NOT_FOUND` | Unknown taskId |
| `TASK_ALREADY_RUNNING` | Max concurrent tasks reached |

## 7. Versioning

- API version is implicit in the path (`/api/...`).
- Breaking changes require a new path prefix (`/api/v2/...`) and an ADR.
- Non-breaking additions are allowed without version bump.

## 8. Related Documents
- `docs/api/INTEGRATION_GUIDE.md`
- `docs/engineering/ERROR_HANDLING.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/security/SECURITY.md`

## 9. Status
Draft — v0.1