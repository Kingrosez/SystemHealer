# API Contract

## 1. Purpose
This document describes the REST API contract for SystemHealer. All endpoints
return JSON and are hosted at `http://localhost:8080/api/`.

## 2. Authentication
No authentication is required for local development. Production may add
origin-based CORS restrictions.

## 3. Common Types

### 3.1 ErrorResponse
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

### 3.2 ConfirmToken
```json
{
  "token": "abc123",
  "expiresAt": "2024-01-15T10:35:00Z"
}
```

## 4. Repair Endpoints

### 4.1 POST /api/repair/sfc
Execute System File Checker scan.

**Request:**
```json
{
  "createRestorePoint": true
}
```

**Response:**
```json
{
  "id": 123,
  "operationType": "SFC",
  "startTime": "2024-01-15T10:30:00Z",
  "status": "IN_PROGRESS"
}
```

### 4.2 GET /api/repair/{id}/logs
Stream SFC output via Server-Sent Events.

**Response (SSE):**
```
data: Starting System File Checker...

data: Verifying files [10000/15000]...

data: Scan completed successfully.
```

### 4.3 POST /api/repair/dism
Execute DISM repair.

**Request:**
```json
{
  "imagePath": "C:\\Windows",
  "createRestorePoint": true
}
```

### 4.4 POST /api/repair/network
Reset network stack.

**Request:**
```json
{
  "createRestorePoint": true
}
```

## 5. History Endpoints

### 5.1 GET /api/history
Get all repair history (paginated).

**Query Parameters:**
- `page` (int): Page number, default 0
- `size` (int): Page size, default 50

**Response:**
```json
{
  "content": [
    {
      "id": 123,
      "operationType": "SFC",
      "startTime": "2024-01-15T10:30:00Z",
      "endTime": "2024-01-15T10:45:00Z",
      "status": "COMPLETED",
      "summary": "Windows Resource Protection did not find any integrity violations."
    }
  ],
  "totalPages": 5,
  "totalElements": 250,
  "number": 0,
  "size": 50
}
```

### 5.2 GET /api/history/{id}
Get detailed history by ID.

**Response:**
```json
{
  "id": 123,
  "operationType": "SFC",
  "startTime": "2024-01-15T10:30:00Z",
  "endTime": "2024-01-15T10:45:00Z",
  "status": "COMPLETED",
  "exitCode": 0,
  "summary": "Scan completed successfully.",
  "restorePointId": 456,
  "logs": ["Starting scan...", "..."]
}
```

## 6. Cleanup Endpoints

### 6.1 POST /api/cleanup/temp-files
Clean temporary files.

**Request:**
```json
{
  "previewOnly": false
}
```

**Preview Response:**
```json
{
  "items": [
    {
      "path": "C:\\Users\\User\\AppData\\Local\\Temp\\temp1.tmp",
      "size": 1024,
      "lastModified": "2024-01-15T09:00:00Z"
    }
  ],
  "totalSize": 1024,
  "confirmToken": "xyz789"
}
```

### 6.2 POST /api/cleanup/duplicate-files
Scan for duplicate files.

**Request:**
```json
{
  "scanPath": "C:\\Users\\User\\Downloads",
  "previewOnly": true
}
```

## 7. Uninstall Endpoints

### 7.1 GET /api/uninstall/programs
List installed programs.

**Response:**
```json
[
  {
    "id": "program-123",
    "name": "Visual Studio Code",
    "publisher": "Microsoft",
    "version": "1.85.0",
    "installPath": "C:\\Program Files\\Microsoft VS Code"
  }
]
```

### 7.2 POST /api/uninstall/{id}
Uninstall a program.

**Request:**
```json
{
  "removeLeftovers": true,
  "previewOnly": true
}
```

## 8. Restore Point Endpoints

### 8.1 POST /api/restore-point
Create a system restore point.

**Request:**
```json
{
  "description": "Before repair"
}
```

**Response:**
```json
{
  "id": 789,
  "creationTime": "2024-01-15T09:00:00Z",
  "description": "Before repair"
}
```

### 8.2 GET /api/restore-point/{id}
Get restore point details.

## 9. Settings Endpoints

### 9.1 GET /api/settings
Get application settings.

### 9.2 PUT /api/settings
Update application settings.

**Request:**
```json
{
  "maxHistoryDays": 30,
  "checkForUpdates": true
}
```

## 10. Integration Guide

See `docs/api/INTEGRATION_GUIDE.md` for client usage examples.