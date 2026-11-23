# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for SystemHealer, a Windows
desktop utility for system repair, cleanup, software updating, and recovery.
It translates the product requirements (PRD) into detailed, testable software
requirements for the development team.

### 1.2 Scope
SystemHealer consists of:
- A React (TypeScript) frontend providing the user interface
- A Spring Boot (Java) backend exposing a local REST API
- A Windows integration layer executing system commands (PowerShell, CMD, Win32)

### 1.3 Definitions
- SFC: System File Checker (sfc /scannow)
- DISM: Deployment Image Servicing and Management
- Winget: Windows Package Manager
- Restore Point: Windows System Restore checkpoint
- Leftover: Files/registry entries remaining after an uninstall

## 2. Overall Description

### 2.1 Product Perspective
SystemHealer runs locally on Windows 10/11. The React frontend communicates with
the Spring Boot backend over localhost HTTP (default port 8080). The backend
executes elevated system commands and returns structured results.

### 2.2 Product Functions
- System repair (SFC, DISM, network reset, Windows Update repair)
- Deep uninstall with leftover cleanup
- Junk/cache cleaning with preview
- Duplicate file detection and removal
- Software update scanning and execution
- Restore point creation and rollback
- Repair history and logging

### 2.3 User Characteristics
- Non-technical home users (need plain language, safe defaults)
- Power users (need logs, previews, granular control)
- IT technicians (need history, repeatability, recovery)

### 2.4 Constraints
- Windows-only (Win32 API, PowerShell, CMD)
- Requires administrator privileges for most repair operations
- Backend must run on localhost only (no remote access in v1)
- All destructive operations must be reversible or confirmed

### 2.5 Assumptions
- User has administrator access to the machine
- Windows 10 (build 19041+) or Windows 11
- .NET Framework 4.8+ available (required by some repair tools)
- Internet access available for software updates

## 3. Functional Requirements

### 3.1 System Repair Module

FR-3.1.1: The system shall execute `sfc /scannow` and stream output to the UI.
FR-3.1.2: The system shall execute `DISM /Online /Cleanup-Image /RestoreHealth`.
FR-3.1.3: The system shall execute `netsh winsock reset` and `ipconfig /flushdns`.
FR-3.1.4: The system shall stop/restart Windows Update services and rename
            SoftwareDistribution to repair update components.
FR-3.1.5: The system shall create a restore point before any repair operation
            classified as high-risk.
FR-3.1.6: The system shall display a summary of repaired/failed items after
            each repair run.

### 3.2 Uninstaller Module

FR-3.2.1: The system shall enumerate installed programs from the Windows registry.
FR-3.2.2: The system shall allow search and filter by name/publisher.
FR-3.2.3: The system shall trigger the program's standard uninstaller.
FR-3.2.4: After uninstall, the system shall scan common leftover locations
            (Program Files, ProgramData, AppData, registry keys).
FR-3.2.5: The system shall present detected leftovers for user review before deletion.
FR-3.2.6: The system shall support force uninstall for programs with broken
            or missing uninstallers.

### 3.3 Cleaner Module

FR-3.3.1: The system shall scan and report temp files, system logs, Windows
            Update cache, and recycle bin contents.
FR-3.3.2: The system shall scan known application cache directories.
FR-3.3.3: The system shall provide a preview of files to be deleted with sizes.
FR-3.3.4: The system shall delete files to the Recycle Bin by default.
FR-3.3.5: The system shall find duplicate files using size grouping followed by
            SHA-256 hash verification.
FR-3.3.6: The system shall always retain at least one copy per duplicate group.

### 3.4 Software Updater Module

FR-3.4.1: The system shall detect outdated software using `winget upgrade`.
FR-3.4.2: The system shall display current vs. available versions.
FR-3.4.3: The system shall execute per-app or bulk updates via `winget upgrade`.
FR-3.4.4: The system shall create a restore point before bulk updates.

### 3.5 Recovery Module

FR-3.5.1: The system shall create Windows restore points via PowerShell
            (`Checkpoint-Computer`).
FR-3.5.2: The system shall detect the 24-hour Windows restore point limit and
            warn the user.
FR-3.5.3: The system shall export registry keys to `.reg` files before deletion.
FR-3.5.4: The system shall maintain a repair history with timestamps and outcomes.
FR-3.5.5: The system shall allow rollback to a selected restore point via `rstrui.exe`.
FR-3.5.6: The system shall detect BitLocker status and warn before recovery actions.

## 4. External Interface Requirements

### 4.1 User Interfaces
- React SPA served on localhost
- Tabs: Dashboard, Repair, Uninstaller, Cleaner, Updater, Recovery, History, Settings
- Real-time log panel for long-running operations
- Confirmation modals for all destructive actions

### 4.2 Software Interfaces
- Spring Boot REST API on `http://localhost:8080/api/*`
- PowerShell / CMD invoked via `ProcessBuilder`
- Windows Registry accessed via Java native calls or `reg` commands
- Winget CLI for software updates

### 4.3 Communication Interfaces
- HTTP/JSON between React and Spring Boot
- Server-Sent Events (SSE) or WebSocket for live log streaming (TBD)

## 5. Non-Functional Requirements

NFR-5.1 Performance: Repair scans shall return initial results within 5 seconds.
NFR-5.2 Performance: Duplicate scan shall process 10,000 files in under 60 seconds.
NFR-5.3 Reliability: No operation shall delete a file without user confirmation.
NFR-5.4 Reliability: Every high-risk operation must have a rollback path.
NFR-5.5 Security: The backend shall bind to 127.0.0.1 only.
NFR-5.6 Security: All destructive API endpoints require an explicit confirm token.
NFR-5.7 Usability: Main UI shall avoid technical jargon (plain-language labels).
NFR-5.8 Usability: Long operations shall show progress and allow cancellation.
NFR-5.9 Maintainability: Each module shall be independently testable.
NFR-5.10 Portability: Windows 10 (19041+) and Windows 11 only.

## 6. System Models

### 6.1 High-Level Architecture
[React Frontend] <--HTTP/JSON--> [Spring Boot Backend] <--ProcessBuilder--> [Windows OS]

### 6.2 Data Flow (Repair Example)
User clicks Repair → React POST /api/repair/start →
Backend creates restore point → Backend runs SFC →
Streams output via SSE → React displays log → Backend returns summary →
React shows results + rollback option

## 7. Acceptance Criteria (Sample)
- AC-1: Running "Repair" executes SFC and DISM and shows a summary.
- AC-2: Deleting leftovers requires user confirmation and is logged.
- AC-3: Duplicate finder never deletes all copies in a group.
- AC-4: Restore point is created before any high-risk repair.
- AC-5: Backend rejects requests from non-localhost origins.

## 8. Appendices
- Glossary of Windows repair commands
- References: PROJECT_REQUIREMENTS.md, PRD.md

## 9. Status
Draft — v0.1