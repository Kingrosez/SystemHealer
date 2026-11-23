# Acceptance Criteria

## 1. Purpose
This document defines the acceptance criteria for each SystemHealer feature. A
feature is "done" only when all its criteria are met and verified. Criteria are
written in Given/When/Then form where practical, and map back to the functional
requirements in `SRS.md`.

## 2. Global Criteria (Apply to Every Feature)

- [ ] Follows `docs/engineering/CODING_STANDARDS.md`
- [ ] Has unit tests (backend and/or frontend as applicable)
- [ ] Handles loading, empty, error, and success states
- [ ] Destructive actions require preview + confirmation token
- [ ] Errors shown to the user use plain language (`userMessage`)
- [ ] Logged server-side with `traceId`
- [ ] Documented in `CHANGELOG.md` under `[Unreleased]`
- [ ] No real system commands executed in tests
- [ ] Accessible (keyboard reachable, labeled) per `ACCESSIBILITY.md`

## 3. System Repair

| ID | Criterion |
|----|-----------|
| AC-R1 | Given the user is admin, when they start SFC, then the backend runs `sfc /scannow` and streams output via SSE. |
| AC-R2 | Given SFC exits non-zero, then the UI shows a plain-language failure and suggests reboot + retry. |
| AC-R3 | Given `createRestorePoint=true`, then a restore point is created before any repair command runs. |
| AC-R4 | Given restore point creation fails, then the operation aborts with `RESTORE_POINT_FAILED`. |
| AC-R5 | Given the user clicks Cancel, then the running process is killed within 2 s and status is `CANCELLED`. |
| AC-R6 | Given a repair completes, then the history shows actions, status, and repaired/failed counts. |
| AC-R7 | Given the user is not admin, then privileged actions return `ADMIN_REQUIRED` and the UI explains why. |

## 4. Uninstaller

| ID | Criterion |
|----|-----------|
| AC-U1 | The programs list shows name, publisher, version, size, and install date. |
| AC-U2 | Search filters by name/publisher within 300 ms for 500 programs. |
| AC-U3 | Triggering uninstall launches the program's standard uninstaller. |
| AC-U4 | After uninstall, leftovers preview lists files/folders/registry keys with sizes. |
| AC-U5 | Leftover deletion requires the `confirmToken` from preview. |
| AC-U6 | Force uninstall is available when the standard uninstaller is missing. |
| AC-U7 | Every uninstall is recorded in `uninstall_records` with outcome. |

## 5. Cleaner (Junk / Cache)

| ID | Criterion |
|----|-----------|
| AC-C1 | Scan reports categories (temp, logs, cache, recycle bin) with sizes. |
| AC-C2 | Preview lists each item and total size; no deletion happens before confirm. |
| AC-C3 | Deletion defaults to Recycle Bin; permanent delete requires explicit opt-in. |
| AC-C4 | After deletion, a summary shows deleted count and freed bytes. |
| AC-C5 | Per-file failures are reported, never silently skipped. |

## 6. Duplicate Finders

| ID | Criterion |
|----|-----------|
| AC-D1 | Scan uses size grouping then SHA-256 verification; progress streams via SSE. |
| AC-D2 | Results group identical files with paths and modified dates. |
| AC-D3 | The system rejects any deletion that would remove all copies in a group (`WOULD_DELETE_ALL_COPIES`). |
| AC-D4 | At least one copy per group is always retained. |
| AC-D5 | Scan of 10,000 files completes in under 60 s on a mid-range machine. |

## 7. Software Updater

| ID | Criterion |
|----|-----------|
| AC-P1 | If winget is unavailable, the UI shows a clear message and disables the updater. |
| AC-P2 | Scan lists outdated packages with current and available versions. |
| AC-P3 | Bulk update creates a restore point first. |
| AC-P4 | Per-app and bulk updates stream progress. |
| AC-P5 | Update outcomes are recorded in `software_update_records`. |

## 8. Recovery

| ID | Criterion |
|----|-----------|
| AC-V1 | The user can create a restore point from the Recovery tab. |
| AC-V2 | Restore points are listed with description, date, and sequence number. |
| AC-V3 | Restoring to a point requires explicit confirmation (`confirm: true`). |
| AC-V4 | If Windows rejects creation (24-hour limit), the UI shows `RESTORE_POINT_LIMIT`. |
| AC-V5 | If BitLocker is enabled, recovery shows a warning and requires acknowledgment. |
| AC-V6 | Registry keys are backed up to `.reg` before any registry deletion. |

## 9. History

| ID | Criterion |
|----|-----------|
| AC-H1 | History lists repair, cleanup, uninstall, and update runs with timestamps and status. |
| AC-H2 | History is paginated (default 50 per page). |
| AC-H3 | Clicking a history item shows details and log lines. |
| AC-H4 | Old records are pruned per retention policy. |

## 10. Settings

| ID | Criterion |
|----|-----------|
| AC-S1 | User can change log retention, default scan roots, theme, and restore-point default. |
| AC-S2 | Settings persist across restarts. |
| AC-S3 | Invalid values are rejected with a clear message. |

## 11. Cross-Cutting Acceptance

| ID | Criterion |
|----|-----------|
| AC-X1 | Backend binds to 127.0.0.1 only. |
| AC-X2 | CORS allows only the frontend origin. |
| AC-X3 | No secrets in the repo. |
| AC-X4 | Every destructive endpoint enforces the preview + token flow. |
| AC-X5 | SSE connections close on complete/cancel and on unmount. |
| AC-X6 | App runs on Windows 10 (19041+) and Windows 11. |

## 12. Definition of Done (Feature)

A feature is accepted when:
- All its AC-* criteria pass in manual + automated tests.
- Global criteria are met.
- PR reviewed and merged.
- `CHANGELOG.md` updated.

## 13. Related Documents
- `SRS.md`
- `docs/testing/TESTING_STRATEGY.md`
- `docs/api/API_CONTRACT.md`
- `docs/engineering/ERROR_HANDLING.md`

## 14. Status
Draft — v0.1