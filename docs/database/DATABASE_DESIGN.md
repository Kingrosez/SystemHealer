# Database Design

## 1. Purpose
This document describes the database design and schema for SystemHealer. It serves as the authoritative reference for all database tables, columns, constraints, indexes, and relationships. This document must be updated before any schema changes.

## 2. Database Technology
- **Production**: SQLite (embedded, file-based) at `%APPDATA%\SystemHealer\systemhealer.db`
- **Development**: H2 (in-memory or file-based)
- **Migration Tool**: Flyway (Database versioning)
- **SQL Dialect**: ANSI SQL-92 compatible for portability

## 3. Design Principles

### 3.1 Type Mapping
| Logical Type | SQLite Type | Notes |
|--------------|-------------|-------|
| UUID | TEXT(36) | Stored as canonical string representation |
| ISO-8601 Timestamp | TEXT | `2026-11-23T10:15:30Z` format, UTC |
| Boolean | INTEGER | 0 = false, 1 = true |
| JSON | TEXT | Serialized as JSON string |
| Enum | TEXT | CHECK constraint ensures valid values |

### 3.2 Naming Conventions
- **Tables**: snake_case (e.g., `repair_history`, `duplicate_groups`)
- **Columns**: snake_case
- **Primary Keys**: `id` (auto-incrementing INTEGER or TEXT for UUIDs)
- **Foreign Keys**: `column_name` + `_id` suffix
- **Indexes**: `idx_<table>_<column>` for single column, `idx_<table>_<col1>_<col2>` for composites

### 3.3 Constraints
- Primary keys are NOT NULL
- Foreign keys include ON DELETE CASCADE for child tables
- CHECK constraints enforce enum values and business rules
- UNIQUE constraints prevent duplicates
- NOT NULL where data is required

## 4. Schema Overview (11 Tables)

```
settings
└── (single row configuration)

repair_history
├── repair_task_results (1..*)
├── cleanup_tasks (1..*)
├── duplicate_scan_tasks (1..*)
└── update_tasks (1..*)

repair_options
└── (lookup table)

system_info
└── (single row snapshot)

duplicate_groups
├── duplicate_files (1..*)
└── cleanup_leftovers (1..*)

cleanup_items
└── cleanup_executions (1..*)

cleanup_executions
└── cleanup_execution_logs (1..*)

updater_scans
└── updater_check_results

restore_points
└── (list of restore points)

tasks
└── (abstract task tracking for all long-running operations)
```

## 5. Table Definitions

### 5.1 settings
Application-wide configuration (single row, always id=1).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, NOT NULL | Always 1 |
| log_retention_days | INTEGER | DEFAULT 90, CHECK (log_retention_days > 0) | Days to retain repair history |
| duplicate_retention_days | INTEGER | DEFAULT 30, CHECK (duplicate_retention_days > 0) | Days to retain duplicate scan results |
| default_scan_roots | TEXT | JSON | Default directories to scan (JSON array) |
| theme | TEXT | DEFAULT 'system', CHECK (theme IN ('light', 'dark', 'system')) | UI theme preference |
| max_concurrent_tasks | INTEGER | DEFAULT 2, CHECK (max_concurrent_tasks BETWEEN 1 AND 5) | Max parallel long-running tasks |
| auto_create_restore_point | INTEGER | DEFAULT 1 | Create restore point before high-risk operations |
| created_at | TEXT | NOT NULL | ISO-8601 UTC timestamp |
| updated_at | TEXT | NOT NULL | ISO-8601 UTC timestamp |

**Indexes**: None (single row, always queried by id=1)

### 5.2 repair_history
Stores history of all repair operations with results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | Unique identifier |
| task_id | TEXT(36) | UNIQUE, NOT NULL | UUID from /repair/start |
| actions | TEXT | NOT NULL | JSON array of action IDs: ["sfc","dism","network"] |
| started_at | TEXT | NOT NULL | ISO-8601 UTC, operation start |
| finished_at | TEXT | NULL | ISO-8601 UTC, operation completion |
| status | TEXT | NOT NULL, CHECK (status IN ('PENDING','RUNNING','SUCCESS','FAILED','CANCELLED')) | Final status |
| exit_code | INTEGER | NULL | Overall exit code |
| summary | TEXT | NULL | Brief summary message |
| restore_point_id | TEXT(50) | NULL | Windows System Restore Point ID |
| created_at | TEXT | NOT NULL | ISO-8601 UTC |
| created_by | TEXT(50) | NULL | Source: 'manual', 'scheduled', 'api' |

**Indexes**:
- `idx_repair_history_started_at` (started_at DESC) - for recent history queries
- `idx_repair_history_status` (status) - for status filtering

### 5.3 repair_options
Lookup table of available repair actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT(50) | PK, NOT NULL | Unique option identifier (e.g., 'sfc', 'dism') |
| name | TEXT | NOT NULL | Display name |
| risk | TEXT | NOT NULL, CHECK (risk IN ('low', 'medium', 'high')) | Risk level |
| description | TEXT | NOT NULL | User-facing description |
| enabled | INTEGER | DEFAULT 1 | 0/1 for availability |
| order | INTEGER | NOT NULL | Display order |

**Indexes**: None (small lookup table)

### 5.4 system_info
Snapshot of system information at startup.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, NOT NULL | Always 1 |
| os_version | TEXT | NOT NULL | "Windows 11 Pro 23H2" |
| build_number | TEXT | NOT NULL | "22631" |
| cpu_model | TEXT | NOT NULL | "Intel Core i7-12700" |
| ram_gb | INTEGER | NOT NULL | Total RAM in gigabytes |
| is_admin | INTEGER | NOT NULL | 0/1 |
| bitlocker_enabled | INTEGER | NOT NULL | 0/1 |
| winget_available | INTEGER | NOT NULL | 0/1 |
| captured_at | TEXT | NOT NULL | ISO-8601 UTC when captured |

**Indexes**: None (single row)

### 5.5 duplicate_groups
Groups of files identified as duplicates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT(36) | PK, NOT NULL | UUID for the group |
| scan_task_id | TEXT(36) | FK → tasks.id, NOT NULL | Which scan found this group |
| hash | TEXT(64) | NOT NULL | SHA-256 hash of file contents |
| file_size_bytes | BIGINT | NOT NULL | Size of files in this group |
| file_count | INTEGER | NOT NULL | Number of files in group |
| estimated_freed_bytes | BIGINT | NOT NULL | Potential space if duplicates deleted |
| created_at | TEXT | NOT NULL | ISO-8601 UTC |

**Indexes**:
- `idx_duplicate_groups_scan_task_id` (scan_task_id) - link to scan task
- `idx_duplicate_groups_hash` (hash) - deduplication

### 5.6 duplicate_files
Individual files within a duplicate group.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT(36) | PK, NOT NULL | UUID of this file |
| group_id | TEXT(36) | FK → duplicate_groups.id, NOT NULL, ON DELETE CASCADE | Which group |
| path | TEXT | NOT NULL | Full file path |
| modified_at | TEXT | NOT NULL | ISO-8601 UTC |
| is_selected | INTEGER | DEFAULT 0 | 0/1, user chose which to delete |

**Indexes**:
- `idx_duplicate_files_group_id` (group_id) - primary access pattern
- `idx_duplicate_files_path` (path) - unique constraint for safety

### 5.7 cleanup_items
Items discovered during a cleanup preview scan.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT(36) | PK, NOT NULL | UUID |
| scan_task_id | TEXT(36) | FK → tasks.id, NOT NULL | Which scan found this item |
| path | TEXT | NOT NULL | File/directory path |
| category | TEXT | NOT NULL, CHECK (category IN ('temp','logs','cache','browser','system')) | Type of item |
| size_bytes | BIGINT | NOT NULL | Size on disk |
| file_count | INTEGER | DEFAULT 1 | Number of files (for directories) |
| created_at | TEXT | NOT NULL | ISO-8601 UTC |

**Indexes**:
- `idx_cleanup_items_scan_task_id` (scan_task_id)
- `idx_cleanup_items_category` (category)

### 5.8 cleanup_executions
Records of cleanup execution operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT(36) | PK, NOT NULL | UUID |
| execution_token | TEXT(64) | NOT NULL, UNIQUE | Token from preview |
| scan_task_id | TEXT(36) | FK → tasks.id, NOT NULL | Originating scan |
| paths | TEXT | NOT NULL | JSON array of paths deleted |
| deleted_count | INTEGER | NOT NULL | Number of items deleted |
| freed_bytes | BIGINT | NOT NULL | Space recovered |
| failures | TEXT | NOT NULL | JSON array of {path, error} |
| status | TEXT | NOT NULL, CHECK (status IN ('RUNNING','SUCCESS','FAILED')) | Execution status |
| started_at | TEXT | NOT NULL | ISO-8601 UTC |
| completed_at | TEXT | NULL | ISO-8601 UTC |
| created_at | TEXT | NOT NULL | ISO-8601 UTC |

**Indexes**:
- `idx_cleanup_executions_started_at` (started_at DESC)

### 5.9 cleanup_execution_logs
Log lines for a cleanup execution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | Unique identifier |
| execution_id | TEXT(36) | FK → cleanup_executions.id, NOT NULL, ON DELETE CASCADE | Which execution |
| line_number | INTEGER | NOT NULL | Sequential line number |
| timestamp | TEXT | NOT NULL | ISO-8601 UTC |
| level | TEXT | NOT NULL, CHECK (level IN ('TRACE','DEBUG','INFO','WARN','ERROR')) | Log level |
| message | TEXT | NOT NULL | Log message content |

**Indexes**:
- `idx_cleanup_execution_logs_execution_id` (execution_id, line_number ASC)

### 5.10 updater_scans
Results of winget update scans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT(36) | PK, NOT NULL | UUID |
| scan_time | TEXT | NOT NULL | ISO-8601 UTC |
| available_count | INTEGER | NOT NULL | Number of available updates |
| total_update_size_bytes | BIGINT | NOT NULL | Download size |
| programs | TEXT | NOT NULL | JSON array of {id, name, currentVersion, availableVersion} |
| cached_at | TEXT | NOT NULL | When results cached |

**Indexes**:
- `idx_updater_scans_scan_time` (scan_time DESC)

### 5.11 tasks
Generic task tracking for all long-running operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT(36) | PK, NOT NULL | UUID |
| type | TEXT | NOT NULL, CHECK (type IN ('REPAIR','CLEANER','DUPLICATE_SCAN','UPDATER')) | Operation type |
| status | TEXT | NOT NULL, CHECK (status IN ('PENDING','RUNNING','SUCCESS','FAILED','CANCELLED')) | Current status |
| started_at | TEXT | NOT NULL | ISO-8601 UTC |
| updated_at | TEXT | NOT NULL | ISO-8601 UTC |
| progress_percent | INTEGER | DEFAULT 0, CHECK (progress_percent BETWEEN 0 AND 100) | Completion percentage |
| current_step | TEXT | NULL | Human-readable current action |
| description | TEXT | NULL | User-provided description |
| error_code | TEXT(50) | NULL | Machine error code if failed |
| error_message | TEXT | NULL | User-friendly error message |

**Indexes**:
- `idx_tasks_status` (status) - status queries
- `idx_tasks_type` (type) - type filtering
- `idx_tasks_updated_at` (updated_at DESC) - recent tasks

## 6. Relationships Diagram

```
tasks (id)
├── repair_history (task_id)
├── duplicate_groups (scan_task_id)
├── cleanup_items (scan_task_id)
└── updater_scans (id) ← scan_task_id
    └── cleanup_executions (scan_task_id)
        └── cleanup_execution_logs (execution_id)
```

## 7. Indexes Summary

| Index Name | Table | Columns | Purpose |
|------------|-------|---------|---------|
| idx_repair_history_started_at | repair_history | started_at DESC | Recent history |
| idx_repair_history_status | repair_history | status | Status filtering |
| idx_duplicate_groups_scan_task_id | duplicate_groups | scan_task_id | Link to scan |
| idx_duplicate_groups_hash | duplicate_groups | hash | Deduplication |
| idx_duplicate_files_group_id | duplicate_files | group_id | Group access |
| idx_duplicate_files_path | duplicate_files | path | Unique constraint |
| idx_cleanup_items_scan_task_id | cleanup_items | scan_task_id | Scan items |
| idx_cleanup_items_category | cleanup_items | category | Category filter |
| idx_cleanup_executions_started_at | cleanup_executions | started_at DESC | Execution history |
| idx_cleanup_execution_logs_execution_id | cleanup_execution_logs | execution_id, line_number | Log retrieval |
| idx_updater_scans_scan_time | updater_scans | scan_time DESC | Recent scans |
| idx_tasks_status | tasks | status | Status queries |
| idx_tasks_type | tasks | type | Type filtering |
| idx_tasks_updated_at | tasks | updated_at DESC | Recent tasks |

## 8. Database Migrations

Migrations are stored in `src/main/resources/db/migration/`:

```
V1__create_initial_tables.sql   # settings, system_info, tasks, repair_options
V2__create_repair_tables.sql    # repair_history
V3__create_cleaner_tables.sql   # duplicate_groups, duplicate_files, cleanup_*
V4__create_updater_tables.sql   # updater_scans
V5__add_indexes.sql             # Performance indexes
V6__add_retention_columns.sql   # duplicate_retention_days
```

### Migration Process
1. Application starts, Flyway runs automatically
2. Flyway checks `flyway_schema_history` table
3. Applies pending migrations in order by version
4. Never modify existing migrations - create new ones for schema changes

## 9. Data Retention & Cleanup

### 9.1 Retention Policies
| Table | Default Days | Configurable | Cleanup Method |
|-------|--------------|--------------|----------------|
| repair_history | 90 | Yes (log_retention_days) | Background job |
| cleanup_executions | 30 | Via cleanup_retention_days field | Background job |
| update_scans | 30 | Yes | Background job |
| tasks | 7 | No | Daily prune |

### 9.2 Cleanup Strategy
- Retention job runs daily at 2:00 AM
- DELETE with WHERE clause for age
- Never DELETE without timestamp filter
- Archive option: copy to `systemhealer-archive.db` before delete

## 10. Sample Queries

### 10.1 Get recent repair history (paginated)
```sql
SELECT h.*,
       (SELECT COUNT(*) FROM cleanup_executions e
        WHERE e.scan_task_id = h.id) as cleanup_count
FROM repair_history h
ORDER BY h.started_at DESC
LIMIT 50 OFFSET 0;
```

### 10.2 Find duplicate groups with files selected for deletion
```sql
SELECT g.id, g.hash, g.file_size_bytes,
       f.path as selected_path
FROM duplicate_groups g
JOIN duplicate_files f ON g.id = f.group_id
WHERE g.scan_task_id = 'uuid-here'
  AND f.is_selected = 1;
```

### 10.3 Summary of cleanup by category
```sql
SELECT c.category,
       COUNT(*) as item_count,
       SUM(c.size_bytes) as total_bytes
FROM cleanup_items c
WHERE c.scan_task_id = 'uuid-here'
GROUP BY c.category;
```

### 10.4 Active tasks with progress
```sql
SELECT id, type, current_step, progress_percent
FROM tasks
WHERE status = 'RUNNING'
ORDER BY updated_at DESC;
```

## 11. Database Configuration

### 11.1 Production (SQLite)
```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:sqlite:{app.data.dir}/systemhealer.db
    driver-class-name: org.sqlite.JDBC
  jpa:
    properties:
      hibernate:
        dialect: com.github.gwenn.hibernate.dialect.SQLiteDialect
  flyway:
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### 11.2 Development (H2)
```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:file:./target/h2db/systemhealer;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    locations: classpath:db/migration
```

## 12. Backup & Recovery

### 12.1 Database Backup
- Database file is included in application backup
- Full backup: Database + settings + history
- Incremental backup: Daily differential
- Restore point: Before major operations

### 12.2 Manual Backup Command
```bash
# On Windows
copy "%APPDATA%\SystemHealer\systemhealer.db" "D:\Backup\systemhealer_backup.db"
```

### 12.3 Recovery Process
1. Stop SystemHealer service
2. Replace database file
3. Run migrations if schema changed
4. Start application

## 13. Performance Considerations

### 13.1 WAL Mode (SQLite)
- Enabled by default for better concurrent read performance
- Journal file: `systemhealer.db-wal`

### 13.2 Page Size
- Default 4KB page size
- Suitable for typical record sizes

### 13.3 Query Optimization
- Always use indexes for WHERE clauses on large tables
- Avoid SELECT * - specify columns needed
- Use LIMIT for pagination

## 14. Related Documents
- `docs/api/API_CONTRACT.md` - API endpoints and response schemas
- `docs/engineering/SCALABILITY.md` - Scalability strategies
- `docs/operations/BACKUP_AND_RECOVERY.md` - Backup procedures
- `docs/architecture/ARCHITECTURE.md` - Overall system design

## 15. Status
Draft — v0.1