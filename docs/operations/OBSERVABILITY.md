# Observability Guide

## 1. Purpose
This document describes how SystemHealer emits, collects, and analyzes operational data to ensure reliability and performance.

## 2. Metrics

### 2.1 Application Metrics
| Metric | Description | Labels |
|--------|-------------|--------|
| `http_requests_total` | Total HTTP requests | method, path, status |
| `http_request_duration_seconds` | Request latency | method, path |
| `repair_operations_total` | Count of repair operations | operation, status |
| `repair_operation_duration_seconds` | Operation duration | operation |

### 2.2 System Metrics
| Metric | Description | Source |
|--------|-------------|--------|
| `system_cpu_percent` | CPU utilization | Windows Management Instrumentation |
| `system_memory_percent` | Memory usage percentage | Performance Counters |
| `system_disk_percent` | Disk space used | Drive info API |

### 2.3 Database Metrics
| Metric | Description |
|--------|-------------|
| `db_connections_active` | Active database connections |
| `db_query_duration_seconds` | Query execution time |

## 3. Logging

### 3.1 Log Levels
| Level | Usage |
|-------|-------|
| `ERROR` | Operation failure, unrecoverable state |
| `WARN` | Retryable failure, degraded performance |
| `INFO` | Operation start/completion, state changes |
| `DEBUG` | Detailed execution flow |
| `TRACE` | Fine-grained debugging |

### 3.2 Log Format
```
{
  "timestamp": "2024-01-15T10:00:00Z",
  "level": "INFO",
  "logger": "com.kingrosez.systemhealer.service.RepairService",
  "message": "SFC operation started",
  "thread": "http-nio-8080-exec-1",
  "context": {
    "operationId": "abc-123",
    "userId": "user-456"
  }
}
```

### 3.3 Log Files
| Location | Purpose |
|----------|---------|
| `%APPDATA%\SystemHealer\logs\application.log` | Application logs |
| `%APPDATA%\SystemHealer\logs\error.log` | Error-only logs |
| `%APPDATA%\SystemHealer\logs\repair\` | Operation-specific logs |

### 3.4 Structured Logging
```java
logger.info("Operation completed",
    keyValue("operation", "SFC"),
    keyValue("durationMs", duration.toMillis()),
    keyValue("exitCode", result.exitCode())
);
```

## 4. Tracing

### 4.1 Distributed Tracing
- OpenTelemetry instrumentation
- Span attributes for operations
- Trace context propagation

### 4.2 Span Structure
```
Trace: repair-workflow
├── Span: HTTP Request
│   ├── Span: Validate Input
│   └── Span: Execute Repair
│       ├── Span: Create Restore Point
│       └── Span: Run SFC
└── Span: Update History
```

## 5. Health Checks

### 5.1 Liveness Probe
```bash
GET /actuator/health/liveness
```
Returns 200 when application is running.

### 5.2 Readiness Probe
```bash
GET /actuator/health/readiness
```
Returns 200 when application is ready to serve traffic.

### 5.3 Custom Health Indicators

| Indicator | Check |
|-----------|-------|
| `database` | Database connectivity |
| `windows` | Administrative privileges |
| `disk` | Write permissions |

## 6. Alerting

### 6.1 Alert Rules
| Alert | Condition | Severity |
|-------|-----------|----------|
| `app_high_memory` | Memory > 80% for 5m | Warning |
| `operation_failure_rate` | Failure rate > 5% | Critical |
| `database_connection_errors` | > 10 errors in 1m | Critical |

### 6.2 Notification Channels
- Windows Toast notifications (desktop)
- Email alerts (future)

## 7. Dashboards

### 7.1 Key Metrics Dashboard
- Request rate and latency
- Operation success/failure counts
- System resource usage

### 7.2 Operation Dashboard
- Recent operations timeline
- Average operation duration by type
- Failure reasons breakdown

## 8. Debugging

### 8.1 Live Endpoints
```bash
# View current metrics
GET /actuator/metrics

# View loggers
GET /actuator/loggers

# Thread dump
GET /actuator/dump
```

### 8.2 Profiling
```bash
# Generate heap dump
jcmd <pid> GC.run_finalization

# CPU profiling (JMH)
java -jar systemhealer.jar --debug
```

### 8.3 Query Database Directly
```bash
# SQLite CLI access
sqlite3 "%APPDATA%\SystemHealer\systemhealer.db"
.tables
.select * from operation_history;
```

## 9. Monitoring Stack (Future)

### 9.1 Prometheus Integration
```yaml
# scrape config
scrape_configs:
  - job_name: 'systemhealer'
    static_configs:
      - targets: ['localhost:8080']
```

### 9.2 Grafana Dashboard
- Pre-built dashboards for common metrics
- Custom queries for operational insights

## 10. Incident Response

### 10.1 Troubleshooting Flow
1. Check application status: `/actuator/health`
2. Review recent logs: `application.log`
3. Check operation history in database
4. Examine system resources (CPU, memory, disk)

### 10.2 Common Issues

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| Slow operations | High CPU/memory | Check system resources |
| Permission errors | Not running as admin | Restart as administrator |
| Database locked | Concurrent access | Close other instances |
| High failure rate | Corrupted system files | Run SFC first |

### 10.3 Log Access for Support
```powershell
# Package logs for support
Compress-Archive -Path "$env:APPDATA\SystemHealer\logs" -DestinationPath "systemhealer-logs.zip"
```