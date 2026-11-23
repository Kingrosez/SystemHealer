# Configuration

## 1. Purpose
This document defines how SystemHealer is configured: Spring profiles,
`application.yml` structure, environment variable overrides, user-facing settings,
and defaults. It is the reference for changing runtime behavior without code.

## 2. Configuration Sources (Priority Order)

1. Command-line arguments (`--server.port=8081`)
2. Environment variables (`SERVER_PORT=8081`)
3. Profile-specific `application-{profile}.yml`
4. Base `application.yml`
5. Hardcoded defaults in code

Later sources override earlier ones only if earlier ones are absent.

## 3. Spring Profiles

| Profile | Purpose | DB | Logging |
|---------|---------|----|---------|
| `dev` (default) | Local development | H2 in-memory | Console, DEBUG optional |
| `prod` | Installed app | SQLite file | File + console, INFO |
| `test` | Automated tests | H2 in-memory | Console, WARN |

Activate: `SPRING_PROFILES_ACTIVE=prod` or `--spring.profiles.active=prod`.

## 4. Base Configuration (`application.yml`)

```yaml
server:
  port: 8080
  address: 127.0.0.1

spring:
  application:
    name: systemhealer
  jackson:
    serialization:
      write-dates-as-timestamps: false
  jpa:
    open-in-view: false

systemhealer:
  db:
    path: ${SYSTEMHEALER_DB_PATH:${APPDATA}/SystemHealer/systemhealer.db}
  logs:
    retention-days: 90
  scan:
    default-roots:
      - ${USERPROFILE}
    exclude:
      - C:\\Windows
      - C:\\$Recycle.Bin
  tasks:
    max-concurrent: 2
    log-buffer-lines: 5000
  duplicates:
    hash-threads: 4
    min-size-bytes: 1024
    max-file-size-bytes: 4294967296
  restore-point:
    create-by-default: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: never
```

## 5. Profile Overrides

### 5.1 `application-dev.yml`

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:systemhealer;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true

logging:
  level:
    com.systemhealer: DEBUG
```

### 5.2 `application-prod.yml`

```yaml
spring:
  datasource:
    url: jdbc:sqlite:${systemhealer.db.path}
    driver-class-name: org.sqlite.JDBC
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true

logging:
  level:
    com.systemhealer: INFO
  file:
    name: ${APPDATA}/SystemHealer/logs/systemhealer.log
```

### 5.3 `application-test.yml`

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
  jpa:
    hibernate:
      ddl-auto: create-drop
  flyway:
    enabled: false

logging:
  level:
    root: WARN
```

## 6. Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `SERVER_PORT` | 8080 | Backend port |
| `SPRING_PROFILES_ACTIVE` | dev | Active profile |
| `SYSTEMHEALER_DB_PATH` | `%APPDATA%\SystemHealer\systemhealer.db` | SQLite path |
| `LOGGING_LEVEL_ROOT` | INFO | Root log level |
| `VITE_API_BASE_URL` (frontend build) | `http://127.0.0.1:8080/api` | API base |

Rules:
- No secrets are stored in env vars in v1 (none needed yet).
- `.env` files are gitignored; use OS env or `application-*.yml` locally.

## 7. User-Facing Settings

Stored in the `app_settings` table (key-value JSON). Editable via Settings UI.

| Setting | Default | Description |
|---------|---------|-------------|
| `logRetentionDays` | 90 | Days to keep logs |
| `defaultScanRoots` | `[%USERPROFILE%]` | Roots used by cleaner/duplicate scan |
| `theme` | `system` | `light`, `dark`, `system` |
| `createRestorePointByDefault` | `true` | Auto restore point before risky ops |
| `duplicateMinSizeBytes` | 1024 | Skip tiny files |
| `maxConcurrentTasks` | 2 | Concurrent long tasks |

Rules:
- Settings override config defaults at runtime (except infrastructure like port/DB).
- Invalid values are rejected with a clear message.
- Changes take effect immediately where feasible; otherwise on restart (documented).

## 8. Configuration Validation

- All config values validated at startup (`@ConfigurationProperties` + `@Validated`).
- Fail fast on invalid config with a clear startup error.
- Log the effective (non-sensitive) config at INFO on startup.

## 9. What Is NOT Configurable

To protect security and consistency:

- Bind address (always `127.0.0.1`).
- CORS origin (fixed to frontend origin).
- Restore-point-before-high-risk (can be defaulted off by user, but the rule
  remains in code; disabling requires explicit UI toggle).
- Command allowlist.

## 10. Related Documents
- `docs/operations/DEPLOYMENT.md`
- `docs/operations/OBSERVABILITY.md`
- `docs/api/API_CONTRACT.md`
- `docs/database/DATABASE_DESIGN.md`

## 11. Status
Draft — v0.1