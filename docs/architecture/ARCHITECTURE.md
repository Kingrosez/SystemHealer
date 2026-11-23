# Architecture

## 1. Purpose
This document describes the high-level architecture of SystemHealer, including
its components, communication patterns, deployment model, and key design
decisions. It serves as the reference for how the frontend, backend, and
Windows integration layer work together.

## 2. Architectural Style

SystemHealer follows a **local client-server architecture** with three layers:

1. **Presentation Layer** — React (TypeScript) SPA running in the browser
   (or embedded webview), served from localhost.
2. **Application Layer** — Spring Boot (Java) REST API running on localhost,
   orchestrating all operations.
3. **System Integration Layer** — Windows OS invoked via PowerShell, CMD,
   and Java native calls, wrapped in backend services.

This is intentionally **not** a cloud application. The backend binds to
`127.0.0.1` only. No data leaves the machine in v1.

## 3. High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SystemHealer Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐                 │
│  │   React SPA     │  HTTP   │  Spring Boot    │  Windows      │
│  │  (TypeScript)   │◄──────►│   (Java)        │  System APIs  │
│  │  Port 3000      │         │  Port 8080      │               │
│  └─────────────────┘         └─────────────────┘                 │
│         │                              │                        │
│         │ Web UI                       │ REST API               │
│         │                              │                        │
│         ▼                              ▼                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                System Integration Layer                 │  │
│  │  • PowerShell (SFC, DISM, Restore Points)              │  │
│  │  • CMD (netsh, ipconfig, winget)                       │  │
│  │  • Java Native Calls (Registry)                        │  │
│  │  • Windows Event Log                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Component Overview

### 4.1 Presentation Layer (Frontend)

| Component | Tech Stack | Purpose |
|-----------|------------|---------|
| App | React 18, TypeScript | Main application shell |
| Router | React Router | Tab navigation (Dashboard, Repair, Uninstaller, etc.) |
| API Client | Axios | HTTP communication with backend |
| Components | Custom React components | Reusable UI elements |
| State | React Context | Global application state |

### 4.2 Application Layer (Backend)

| Component | Tech Stack | Purpose |
|-----------|------------|---------|
| Spring Boot | Java 17, Spring Boot 3.x | Application framework |
| Web MVC | Spring MVC | REST API controllers |
| Service Layer | Spring @Service | Business logic orchestration |
| Security | Spring Security | API origin restrictions |
| Logging | SLF4J | Operation logging |

### 4.3 System Integration Layer

| Service | Command | Purpose |
|---------|---------|---------|
| RepairService | `sfc /scannow`, `DISM` | System file repair |
| NetworkRepairService | `netsh winsock reset`, `ipconfig` | Network stack repair |
| UninstallService | `reg query`, `wmic` | Program enumeration |
| CleanupService | PowerShell `Remove-Item` | File cleanup |
| UpdateService | `winget upgrade` | Software updates |
| RestorePointService | PowerShell `Checkpoint-Computer` | System restore points |

## 5. Communication Patterns

### 5.1 HTTP API

- **Base URL**: `http://localhost:8080/api/*`
- **Protocol**: HTTPS not used in v1 (localhost only)
- **Format**: JSON request/response

### 5.2 Real-Time Updates

Long-running operations stream output via:
- **SSE (Server-Sent Events)**: Primary mechanism
- **WebSocket**: Fallback (TBD in v1)

### 5.3 Request Flow Example

```
1. User clicks "Run SFC" → React POST /api/repair/sfc
2. Backend creates restore point (if needed)
3. Backend executes sfc /scannow
4. Streams output via SSE to frontend
5. Frontend displays live log
6. Backend returns final JSON result
```

## 6. Data Model

### 6.1 Core Entities

| Entity | Fields | Purpose |
|--------|--------|---------|
| RepairJob | id, type, startTime, endTime, status, output | Track repair operations |
| UninstallItem | id, name, publisher, installPath, uninstallString | Program information |
| FileItem | path, size, hash, lastModified | File metadata |
| RestorePoint | id, name, creationTime, description | System restore point |

### 6.2 Data Persistence

- **Location**: `%APPDATA%\SystemHealer\systemhealer.db` (SQLite file)
- **Format**: SQLite database with 11 tables
- **Schema**: repair_history, duplicate_groups, cleanup_items, cleanup_executions, updater_scans, tasks, settings, system_info, repair_options, duplicate_files
- **Retention**: Configurable via settings.log_retention_days (default: 90 days for repairs, 30 days for duplicates)

## 7. Security Considerations

- Backend binds to `127.0.0.1:8080` only
- All destructive operations require `confirm` token
- Administrator privileges required for system operations
- No data is transmitted off-machine in v1
- CORS restricted to localhost origins

## 8. Deployment Model

### 8.1 Local Installation
- Frontend: Built to `frontend/dist/`, served by backend embedded server
- Backend: Executable JAR, run as administrator on Windows 10/11

### 8.2 Packaging Options
- `winget` package (ideal)
- Manual ZIP distribution

### 8.3 Update Strategy
- Backend can self-update via winget
- Frontend served as static files (no separate update mechanism)

## 9. Design Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Local client-server | Security, no network dependency | Cannot support remote management |
| React + Spring Boot | Strong type safety, good tooling | Larger bundle size |
| SSE for streaming | Simple, works over HTTP | Limited to unidirectional streaming |
| Embedded frontend | Single executable | Separate frontend builds needed |

## 10. Architecture Status

Draft — v0.1