# Project Requirements

## 1. Project Overview
SystemHealer is an all-in-one Windows PC care tool built with React (frontend)
and Spring Boot (backend). It diagnoses, repairs, cleans, and recovers Windows
systems through a single unified interface.

## 2. Goals
- Provide one-click system repair (SFC, DISM, network reset)
- Deep uninstall with leftover file/registry cleanup
- Cache, junk, and duplicate file cleaning
- Software update detection and execution
- Recovery via restore points and rollback
- Safe by default: preview before delete, restore point before risky actions

## 3. Scope

### In Scope
- Windows 10 and Windows 11 (desktop)
- Local desktop application (React UI + Spring Boot backend on localhost)
- Administrator-elevated operations for system-level repairs

### Out of Scope
- macOS / Linux support
- Cloud-based remote management
- Mobile app
- Antivirus / real-time malware protection

## 4. Functional Requirements

### 4.1 System Repair
- FR-1: Execute SFC scan and display results
- FR-2: Execute DISM image repair
- FR-3: Reset network stack (Winsock, DNS, IP)
- FR-4: Repair Windows Update components

### 4.2 Uninstaller
- FR-5: List installed programs with search/filter
- FR-6: Trigger standard uninstall
- FR-7: Scan and remove leftover files and registry entries
- FR-8: Force uninstall for broken uninstallers

### 4.3 Cleaner
- FR-9: Clean temp files, system logs, update cache, recycle bin
- FR-10: Clean application caches (browser, Office, etc.)
- FR-11: Find and remove duplicate files by hash
- FR-12: Preview before deletion

### 4.4 Software Updater
- FR-13: Scan installed software for available updates (via winget)
- FR-14: Execute per-app or bulk updates
- FR-15: Create restore point before bulk updates

### 4.5 Recovery
- FR-16: Create system restore point before risky operations
- FR-17: Roll back to a restore point
- FR-18: Backup and restore registry keys
- FR-19: Maintain repair history with revert option

## 5. Non-Functional Requirements
- NFR-1: All destructive operations require explicit user confirmation
- NFR-2: Preview/dry-run mode for all cleanup features
- NFR-3: Real-time progress and log output in the UI
- NFR-4: Administrator privilege detection and elevation prompt
- NFR-5: BitLocker warning before recovery operations
- NFR-6: Restore point created before any high-risk repair

## 6. Constraints
- Windows-only (Win32 API, PowerShell, CMD)
- Requires administrator privileges for most repair features
- React frontend + Spring Boot backend, communicating over localhost

## 7. Success Criteria
- User can diagnose and repair common Windows issues without using CMD
- No data loss from any cleanup or repair operation
- Every risky action has a recovery path

## 8. Status
Draft — v0.1