# Acceptance Criteria

## 1. Purpose
This document defines the acceptance criteria for SystemHealer features. These criteria define what "done" looks like for each feature and can be used for automated testing.

## 2. Feature: System File Checker (SFC)

### 2.1 User Story
As a user, I want to run System File Checker to scan and repair Windows system files.

### 2.2 Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| SFC-001 | App is open and user is on Dashboard | User clicks "Run SFC" | Preview dialog opens |
| SFC-002 | Preview dialog is open | User sees "Create restore point" option | User can toggle the option |
| SFC-003 | Preview dialog is open | User clicks "Run Scan" | Progress dialog opens |
| SFC-004 | SFC is running | Progress is displayed | Progress bar updates in real-time |
| SFC-005 | SFC completes successfully | Exit code is 0 | Success message shows with result |
| SFC-006 | SFC fails | Exit code is non-zero | Error message shows with guidance |
| SFC-007 | SFC completes | History entry is created | Entry appears in History tab |
| SFC-008 | User navigates away and back | History list is visible | SFC entry is listed |

### 2.3 Validation Rules
- Restore point must be created before scan if option selected
- Process must be cancelable during execution
- Logs must be streamed to UI during execution
- All operations require admin privileges

## 3. Feature: DISM Repair

### 3.1 User Story
As a user, I want to run DISM repair to fix Windows system image.

### 3.2 Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| DISM-001 | App is open | User clicks "Run DISM" | Preview dialog opens |
| DISM-002 | DISM scan completes | Operation finishes | Summary is displayed |
| DISM-003 | DISM runs | Progress is visible | Status updates in real-time |

## 4. Feature: History

### 4.1 User Story
As a user, I want to view my repair history.

### 4.2 Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| HIST-001 | No history exists | User opens History tab | "No history" message displays |
| HIST-002 | History exists | User opens History tab | List of history items displays |
| HIST-003 | History list is long | User scrolls | Pagination loads more items |
| HIST-004 | History item exists | User clicks item | Detail view shows |
| HIST-005 | Multiple history items | User searches by type | Matching items shown |
| HIST-006 | History has age | Items older than threshold | Items are archived/hidden |

### 4.3 History Entry Format
- Display: Operation type, start time, end time, status
- Details: Exit code, restore point ID, logs (expandable)

## 5. Feature: Restore Points

### 5.1 User Story
As a user, I want to create and manage system restore points.

### 5.2 Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| RP-001 | User initiates SFC with restore option | System creates restore point | Restore point ID recorded |
| RP-002 | Restore point exists | User views restore points | Point is listed with description |
| RP-003 | Operation completes | Restore point is valid | User can restore to point |

## 6. Feature: Settings

### 6.1 User Story
As a user, I want to configure application settings.

### 6.2 Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| SET-001 | Settings page is open | User changes max history days | Value is saved and validated |
| SET-002 | Settings change | User toggles auto-update | Setting is persisted |
| SET-003 | App restarts | Settings were saved | Previous settings are loaded |

## 7. Feature: Network Reset

### 7.1 User Story
As a user, I want to reset my network configuration.

### 7.2 Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| NET-001 | Network tab is open | User clicks "Reset Network" | Confirmation dialog appears |
| NET-002 | User confirms | Network reset runs | Progress is displayed |
| NET-003 | Network reset completes | IP is renewed | Success message shows |

## 8. Feature: Cleanup Tools

### 8.1 User Story
As a user, I want to clean temporary files.

### 8.2 Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| CLEAN-001 | Cleanup tab is open | User clicks "Scan Temp Files" | List of files to clean shows |
| CLEAN-002 | Files are listed | User selects files | Size total updates |
| CLEAN-003 | Files selected | User clicks "Clean" | Files are removed |
| CLEAN-004 | Cleanup completes | History entry created | Operation logged |

## 9. Error Scenarios

### 9.1 Permission Errors
| ID | Given | When | Then |
|----|-------|------|------|
| ERR-001 | App not running as admin | User tries SFC | Error message: "Run as administrator" |
| ERR-002 | Permission denied | Command fails | Error code: ACCESS_DENIED |

### 9.2 Network Errors
| ID | Given | When | Then |
|----|-------|------|------|
| ERR-101 | Network unavailable | App tries to check updates | Error: "Cannot connect to update server" |

### 9.3 Validation Errors
| ID | Given | When | Then |
|----|-------|------|------|
| VAL-001 | Invalid input | User submits form | Field error displays |
| VAL-002 | Empty restore point description | User creates RP | "Description required" message |

## 10. Performance Criteria

| Criterion | Threshold | Measurement |
|-----------|-----------|-------------|
| App startup | < 3 seconds | Time from launch to UI |
| API response | < 100ms avg | Cached API calls |
| Database query | < 10ms | Simple queries by ID |
| Memory usage | < 500MB | During heavy operations |

## 11. Accessibility Criteria

| ID | Requirement | Test Method |
|----|-------------|-------------|
| A11Y-001 | All buttons have labels | Automated scan |
| A11Y-002 | Color is not only indicator | Manual review |
| A11Y-003 | Focus is visible | Keyboard navigation |
| A11Y-004 | Screen reader accessible | NVDA/VoiceOver test |

## 12. Security Criteria

| ID | Requirement | Test Method |
|----|-------------|-------------|
| SEC-001 | No credentials stored | Code review |
| SEC-002 | Commands use validated args | Integration test |
| SEC-003 | API only on localhost | Network test |
| SEC-004 | Input validation on all fields | Unit tests |

## 13. Data Criteria

| Criterion | Requirement | Test Method |
|-----------|-------------|-------------|
| History retention | Configurable days | Test with edge dates |
| Database integrity | Valid after operations | DB constraint tests |
| Backup creation | On demand | Manual + verification |
| Restore point sync | With Windows | Windows API check |