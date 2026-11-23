# Configuration Guide

## 1. Purpose
This document describes how to configure SystemHealer for different environments and use cases.

## 2. Configuration Sources

Configuration is loaded in the following order (later sources override earlier ones):

1. Default values (embedded in JAR)
2. `application.yml` (classpath)
3. Environment-specific `application-{profile}.yml`
4. Environment variables
5. Command-line arguments

## 3. Application.yml Structure

```yaml
# Server configuration
server:
  port: ${SYSTEMHEALER_PORT:8080}

# Application metadata
spring:
  application:
    name: SystemHealer

# Database configuration
spring:
  datasource:
    url: ${SYSTEMHEALER_DB_URL:jdbc:sqlite:/data/systemhealer.db}
    driver-class-name: org.sqlite.JDBC
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

  # Flyway database migrations
  flyway:
    locations: classpath:db/migration
    baseline-on-migrate: true

# Logging configuration
logging:
  level:
    com.kingrosez: ${SYSTEMHEALER_LOG_LEVEL:INFO}
  file:
    name: ${SYSTEMHEALER_LOG_PATH:%APPDATA%\\SystemHealer\\logs\\application.log}

# Actuator endpoints
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,loggers
  endpoint:
    health:
      show-details: always

# Application-specific settings
systemhealer:
  # History retention in days
  historyRetentionDays: ${SYSTEMHEALER_HISTORY_DAYS:90}
  # Maximum concurrent operations
  maxConcurrentOperations: ${SYSTEMHEALER_MAX_CONCURRENT:2}
  # Default restore point description prefix
  restorePointPrefix: "SystemHealer"
```

## 4. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SYSTEMHEALER_PORT` | 8080 | HTTP server port |
| `SYSTEMHEALER_DB_URL` | sqlite DB path | Database connection URL |
| `SYSTEMHEALER_LOG_LEVEL` | INFO | Root logging level |
| `SYSTEMHEALER_LOG_PATH` | `%APPDATA%` | Log file path |
| `SYSTEMHEALER_HISTORY_DAYS` | 90 | Days to retain history |
| `SYSTEMHEALER_MAX_CONCURRENT` | 2 | Max parallel operations |
| `SYSTEMHEALER_RESTORE_POINT_PREFIX` | SystemHealer | Restore point description prefix |
| `SYSTEMHEALER_DATA_PATH` | `%APPDATA%\SystemHealer` | Data directory |

## 5. Profiles

### 5.1 Development Profile
Activated with `-Dspring.profiles.active=dev` or `spring.profiles.active=dev` environment variable.

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:systemhealer;DB_CLOSE_DELAY=-1
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true

logging:
  level:
    com.kingrosez: DEBUG
    org.hibernate.SQL: DEBUG

management:
  endpoints:
    web:
      exposure:
        include: "*"
```

### 5.2 Production Profile
```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:sqlite:/data/systemhealer.db
  jpa:
    hibernate:
      ddl-auto: validate

logging:
  level:
    com.kingrosez: WARN
```

## 6. External Configuration

### 6.1 Configuration File
Place `application.yml` in:
- `%APPDATA%\SystemHealer\application.yml` (user-specific)
- `%PROGRAMDATA%\SystemHealer\application.yml` (system-wide)

### 6.2 Command Line
```bash
java -jar systemhealer.jar --server.port=9090 --systemhealer.historyRetentionDays=180
```

### 6.3 System Properties
```bash
java -Dserver.port=9090 -Dsystemhealer.historyRetentionDays=180 -jar systemhealer.jar
```

## 7. Advanced Configuration

### 7.1 Custom Data Directory
```bash
# Set data directory for all files
SYSTEMHEALER_DATA_PATH=C:\CustomPath
```

Directory structure created:
```
C:\CustomPath\
├── systemhealer.db          # SQLite database
├── logs\
│   ├── application.log
│   └── error.log
└── backups\                 # Future: automatic backups
```

### 7.2 Logging Configuration
```yaml
# logback-spring.xml
<configuration>
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${SYSTEMHEALER_LOG_PATH}/application.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>${SYSTEMHEALER_LOG_PATH}/application.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
      <maxFileSize>10MB</maxFileSize>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>
</configuration>
```

### 7.3 Database Connection Pool
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 5
      minimum-idle: 2
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

## 8. Security Configuration

### 8.1 Network Binding
By default, server binds to localhost only. To expose to network:

```yaml
server:
  address: 0.0.0.0
```

Warning: Only use in trusted networks. The API is not secured for external access.

### 8.2 CORS (Future)
```yaml
spring:
  cors:
    allowed-origins: http://localhost:5173
    allowed-methods: GET,POST,PUT,DELETE
```

## 9. Performance Tuning

### 9.1 Thread Pool Configuration
```yaml
systemhealer:
  executor:
    core-pool-size: 2
    max-pool-size: 4
    queue-capacity: 10
```

### 9.2 Database Write-Ahead Logging
```yaml
spring:
  datasource:
    url: jdbc:sqlite:/data/systemhealer.db?_journal_mode=WAL
```

## 10. Migration Configuration

### 10.1 Database Migration Path
By default, migrations are in `classpath:db/migration/`.

For custom location:
```yaml
spring:
  flyway:
    locations: filesystem:/path/to/migrations
```

### 10.2 Baseline on Migrate
If upgrading from non-Flyway managed database:
```yaml
spring:
  flyway:
    baseline-on-migrate: true
    baseline-version: 1.0
    baseline-description: "Initial baseline"
```

## 11. Monitoring Configuration

### 11.1 Disable Actuator
```yaml
management:
  endpoints:
    web:
      exposure:
        include: none
```

### 11.2 Enable Additional Endpoints
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,loggers,env,mappings
```

## 12. Testing Configuration

### 12.1 Override for Tests
```yaml
# src/test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:test
  jpa:
    hibernate:
      ddl-auto: create
```

### 12.2 Test Properties
```bash
# System properties for tests
-Dspring.profiles.active=test
-Dspring.datasource.url=jdbc:h2:mem:test
```

## 13. Configuration Validation

### 13.1 Required Configuration
- Database path must be writable
- Log directory must be writable
- Sufficient disk space for database and logs

### 13.2 Validation Rules
```java
@ConfigurationProperties(prefix = "systemhealer")
@Validated
public class SystemHealerProperties {

    @Min(1)
    @Max(365)
    private int historyRetentionDays = 90;

    @Min(1)
    @Max(10)
    private int maxConcurrentOperations = 2;

    @NotBlank
    private String restorePointPrefix = "SystemHealer";

    // getters and setters
}
```

## 14. Common Configuration Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| "Cannot open database" | Directory doesn't exist or no write permission | Create directory and grant write access |
| "Port already in use" | Another process using port | Change `server.port` or stop conflicting service |
| "Log file not created" | Log path inaccessible | Check `SYSTEMHEALER_LOG_PATH` |
| "Operations too slow" | Database locked or disk full | Check disk space, close other instances |