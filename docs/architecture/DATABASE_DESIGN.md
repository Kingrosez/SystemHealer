# Database Design (Architecture Overview)

## 1. Purpose
This document provides a high-level overview of the data model used by
SystemHealer. It summarizes the entities, relationships, and storage strategy.
The detailed schema (columns, indexes, constraints, migration scripts) lives in
`docs/database/DATABASE_DESIGN.md`.

## 2. Storage Strategy

SystemHealer uses an **embedded database** — no external DB server.

| Environment | Database | Location |
|-------------|----------|----------|
| Development | H2 (in-memory) | Resets on restart |
| Production | SQLite | `%APPDATA%\SystemHealer\systemhealer.db` |

Rationale:
- Zero setup for users.
- No network surface (consistent with local-only architecture).
- File-based backup is trivial (copy the `.db` file).
- Sufficient for single-user desktop scale.

## 3. Core Entities (Summary)

| Entity | Purpose | Approx. Volume |
|--------|---------|----------------|
| `RepairHistory` | Record of every repair run | Hundreds |
| `RepairLogLine` | Streamed log lines per repair | Thousands per repair |
| `CleanupSession` | Record of each cleaner run | Hundreds |
| `CleanupItem` | Individual file/item deleted | Tens of thousands |
| `DuplicateGroup` | A set of duplicate files found | Hundreds |
| `DuplicateFile` | File belonging to a group | Thousands |
| `UninstallRecord` | Program uninstalled + leftovers removed | Hundreds |
| `RestorePointRecord` | System restore point created by the app | Dozens |
| `AppSetting` | User preferences (key-value) | Dozens |
| `SoftwareUpdateRecord` | Detected outdated app + update action | Hundreds |

## 4. Entity Relationships (High Level)

```
RepairHistory
├── RepairLogLine (1:M)
└── RestorePointRecord (0:M) ←─-> SystemRestorePoint (external)

CleanupSession
└── CleanupItem (1:M)

DuplicateGroup
└── DuplicateFile (1:M)

UninstallRecord
├── Leftover (1:M)
└── RestorePointRecord (0:M) ←─-> SystemRestorePoint (external)

SoftwareUpdateRecord
└── AppSetting (0:M) ←─-> User preferences

AppSetting
└── (key-value store, no relations)
```

## 5. Data Flow Examples

### 5.1 Repair History Flow
1. User initiates "Run SFC" → Backend creates `RepairHistory` entry (status: IN_PROGRESS)
2. Each log line streams → Backend appends to `RepairLogLine` (foreign key: repairHistoryId)
3. Repair completes → Update `RepairHistory` status to COMPLETED/FAILED
4. Optionally create `RestorePointRecord` for rollback reference

### 5.2 Duplicate Detection Flow
1. User scans for duplicates → Backend creates `DuplicateGroup`
2. For each detected group → Backend creates `DuplicateFile` entries
3. User deletes group → Mark `DuplicateGroup.status = DELETED` (soft delete for audit)
4. Permanent cleanup happens after retention period

### 5.3 Uninstall Flow
1. User uninstalls program → Create `UninstallRecord`
2. Detect leftovers → Create `CleanupItem` with type=LEFTOVER
3. User deletes → Move to Recycle Bin (log action in `CleanupItem`)
4. Optional: Create restore point before action

## 6. Persistence Layer

### 6.1 JPA Entities

```java
@Entity
@Table(name = "repair_history")
public class RepairHistory {
    @Id @GeneratedValue
    private Long id;
    private String operationType;    // SFC, DISM, NETWORK
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;           // IN_PROGRESS, COMPLETED, FAILED
    private String summary;
}

@Entity
@Table(name = "repair_log_line")
public class RepairLogLine {
    @Id @GeneratedValue
    private Long id;
    @ManyToOne
    private RepairHistory repairHistory;
    private LocalDateTime timestamp;
    @Column(columnDefinition = "TEXT")
    private String line;
}

@Entity
@Table(name = "app_setting")
public class AppSetting {
    @Id
    private String key;
    private String value;
}
```

### 6.2 Flyway Migrations (Location)

```
src/main/resources/db/migration/
├── V1__create_repair_history.sql
├── V2__create_repair_log_line.sql
├── V3__create_cleanup_session.sql
├── V4__create_duplicate_tables.sql
├── V5__add_uninstall_tables.sql
├── V6__add_restore_point_tables.sql
├── V7__add_software_update_tables.sql
└── V8__add_app_settings.sql
```

### 6.3 Migration Example (V1)

```sql
CREATE TABLE repair_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operation_type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    summary TEXT
);

CREATE INDEX idx_repair_history_status ON repair_history(status);
CREATE INDEX idx_repair_history_start_time ON repair_history(start_time);
```

## 7. Data Retention Policy

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Repair history | 90 days | Audit trail for troubleshooting |
| Log lines | 30 days per history | Sufficient for diagnosis |
| Duplicate groups | 7 days after deletion | Allow undo window |
| Software updates | Indefinite | Update decisions are auditable |
| App settings | Indefinite | User preferences |

## 8. Backup and Restore

### 8.1 Automatic Backup
- Database file is backed up to `%APPDATA%\SystemHealer\backups\`
- Backup runs once daily (or on app shutdown if database changed)

### 8.2 Manual Backup
- User can trigger backup via Recovery module
- Restores from selected backup file

### 8.3 Recovery Flow
1. User selects backup file in UI
2. Backend stops application
3. Database file is replaced with backup
4. App restarts, history restored

## 9. Related Documents

- `docs/database/DATABASE_DESIGN.md` — Detailed schema, columns, constraints
- `docs/architecture/ARCHITECTURE.md` — Component overview
- `docs/architecture/TECH_STACK.md` — Database technology versions

## 10. Architecture Status

Draft — v0.1