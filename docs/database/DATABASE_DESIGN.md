# Database Design

## 1. Purpose
This document describes the database design and schema for SystemHealer.

## 2. Database Technology
- **Production**: SQLite (embedded, file-based)
- **Development**: H2 (in-memory or file-based)
- **Migration Tool**: Flyway

## 3. Schema Overview

### 3.1 Entities

```
repair_history
├── id (PK)
├── operation_type
├── start_time
├── end_time
├── status
├── exit_code
├── summary
├── restore_point_id
└── logs (JSON)

settings
├── id (PK)
├── max_history_days
├── check_for_updates
└── created_at

restore_points
├── id (PK)
├── description
├── creation_time
└── type
```

### 3.2 Table Definitions

#### repair_history
Stores history of all repair operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| operation_type | VARCHAR(50) | NOT NULL | SFC, DISM, network, cleanup |
| start_time | TIMESTAMP | NOT NULL | Operation start |
| end_time | TIMESTAMP | NULL | Operation completion |
| status | VARCHAR(20) | NOT NULL | PENDING, IN_PROGRESS, COMPLETED, FAILED |
| exit_code | INTEGER | NULL | Command exit code |
| summary | TEXT | NULL | Brief summary message |
| restore_point_id | BIGINT | NULL | Windows restore point |
| logs | JSON | NULL | Streaming log output |

#### settings
Application configuration (single row).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK | Always 1 |
| max_history_days | INTEGER | DEFAULT 30 | Retention period |
| check_for_updates | BOOLEAN | DEFAULT true | Auto-update check |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last update |

#### restore_points
Windows system restore points created by the app.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK | Windows restore point ID |
| description | VARCHAR(255) | NOT NULL | User-provided description |
| creation_time | TIMESTAMP | NOT NULL | Creation timestamp |
| type | VARCHAR(50) | NOT NULL | APPLICATION, MANUAL |

## 4. Indexes

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| repair_history | id | Primary key (auto) |
| repair_history | status | Query by status |
| repair_history | start_time | Time range queries |
| repair_history | operation_type | Filter by type |
| restore_points | creation_time | Time-based queries |

## 5. Database Migrations

Migrations are stored in `src/main/resources/db/migration/`:

```
V1__create_tables.sql
V2__add_indexes.sql
V3__add_logs_column.sql
```

### Migration Process
1. Run `./mvnw flyway:migrate` on startup
2. Flyway checks `flyway_schema_history` table
3. Applies pending migrations in order
4. Never modify existing migrations

## 6. Sample Queries

### 6.1 Get recent history (paginated)
```sql
SELECT * FROM repair_history
ORDER BY start_time DESC
LIMIT 50 OFFSET 0;
```

### 6.2 Find completed SFC operations
```sql
SELECT * FROM repair_history
WHERE operation_type = 'SFC' AND status = 'COMPLETED'
ORDER BY start_time DESC;
```

### 6.3 Count operations by type
```sql
SELECT operation_type, COUNT(*)
FROM repair_history
GROUP BY operation_type;
```

## 7. Data Retention

- History entries older than `max_history_days` are archived
- Archive process runs daily at 2 AM
- Archived data moved to `history-archive.db`

## 8. Database Configuration

### 8.1 Production (SQLite)
```yaml
spring:
  datasource:
    url: jdbc:sqlite:/path/to/systemhealer.db
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.SQLiteDialect
```

### 8.2 Development (H2)
```yaml
spring:
  datasource:
    url: jdbc:h2:file:./target/h2db/systemhealer
  jpa:
    hibernate:
      ddl-auto: validate
```

## 9. Backup Strategy

Database file is included in application backup:
- Full backup: Database + settings + history
- Incremental backup: Daily differential
- Restore point: Before major operations