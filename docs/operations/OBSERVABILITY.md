# Observability Guide

## 1. Purpose
This document defines how SystemHealer emits, collects, and analyzes operational data to ensure reliability and performance.

## 2. Principles

SystemHealer is a local-only desktop application with no telemetry or external data collection. Observability is designed for:

- Local debugging and troubleshooting
- User-facing diagnostics
- Developer logs for support

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

Backend logs use SLF4J + Logback with structured output:

```
2026-11-23T10:15:30Z INFO  [traceId=a1b2c3d4] c.s.repair.RepairService - SFC started
```

Each request is assigned a UUID trace ID for correlation across logs and API responses.

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

## 4. Health Endpoints

Spring Boot Actuator exposes the following endpoints:

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `/actuator/health` | Liveness + readiness | None |
| `/actuator/info` | Build info | None |
| `/actuator/metrics` | Micrometer metrics | None |

## 5. Metrics

| Metric | Description | Labels |
|--------|-------------|--------|
| `http_requests_total` | Total HTTP requests | method, path, status |
| `http_request_duration_seconds` | Request latency | method, path |
| `repair_operations_total` | Count of repair operations | operation, status |
| `repair_operation_duration_seconds` | Operation duration | operation |

System metrics (CPU, memory, disk) are exposed via Micrometer using Windows Management Instrumentation.

## 6. Task Tracking

Long-running operations stream progress via Server-Sent Events (SSE) to the frontend:

```
event: progress
data: {"taskId": "abc-123", "status": "RUNNING", "progress": 45, "message": "Scanning files..."}
```

## 7. User-Facing Diagnostics

The Status Bar component displays:

- Current operation and progress
- System health indicator (green/yellow/red)
- Quick access to logs

## 8. Error Reporting

Errors are returned with:

- `userMessage`: Plain-language description
- `traceId`: For developer logs
- `retryable`: Whether to retry

## 9. Alerting

- No external alerting system
- Critical errors written to `error.log` and shown in UI
- User can export logs for support

## 10. Log Retention

- Application logs: 30 days
- Error logs: 90 days
- Operation logs: cleaned after 30 days

## 11. Related Documents

- `docs/operations/CONFIGURATION.md`
- `docs/testing/TESTING_STRATEGY.md`
- `docs/api/API_CONTRACT.md`

## 12. Status

Draft — v0.1