# Deployment Guide

## 1. Purpose
This document describes how to build, package, and deploy SystemHealer.

## 2. Build Process

### 2.1 Prerequisites
- Java 17 JDK
- Node.js 18+
- Maven 3.9+
- Windows 10 or later

### 2.2 Build Commands

#### Development Build
```bash
# Clone and setup
git clone https://github.com/Kingrosez/SystemHealer.git
cd SystemHealer

# Backend
cd backend
./mvnw clean install

# Frontend
cd ../frontend
npm install
npm run build
```

#### Production Build
```bash
# Full build with all modules
cd ..
./mvnw clean verify -Pproduction
```

### 2.3 Build Outputs

| Location | Contents |
|----------|----------|
| `backend/target/*.jar` | Spring Boot executable JAR |
| `frontend/dist/` | Static assets |
| `frontend/dist/index.html` | Entry point |

## 3. Packaging

### 3.1 JAR Packaging
The backend builds a fat JAR with embedded dependencies:

```bash
java -jar target/systemhealer-*.jar
```

### 3.2 Frontend Build
```bash
npm run build
# Output: dist/ directory
```

### 3.3 Combined Package Structure
```
systemhealer-1.0.0/
├── backend/
│   └── systemhealer.jar
├── frontend/
│   ├── index.html
│   ├── assets/
│   └── ...
├── config/
│   └── application.yml
└── systemhealer.exe
```

## 4. Installation

### 4.1 Windows Installer (Future)
- MSI package with Start Menu shortcuts
- Desktop shortcut creation
- Uninstall entry in Programs & Features

### 4.2 Portable Mode
1. Extract ZIP to `C:\Program Files\SystemHealer`
2. Create desktop shortcut to `systemhealer.exe`
3. Pin to taskbar if desired

### 4.3 Startup Options
```powershell
# Standard installation
start-process "C:\Program Files\SystemHealer\systemhealer.exe"

# Development mode with debug logging
.\mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dlogging.level.com.kingrosez=DEBUG"
```

## 5. Database Initialization

### 5.1 First Run
- Flyway creates database schema
- SQLite database created at `%APPDATA%\SystemHealer\systemhealer.db`
- Initial settings inserted

### 5.2 Database Location
| Platform | Path |
|----------|------|
| Windows | `%APPDATA%\SystemHealer\systemhealer.db` |
| Development | `target/h2db/systemhealer.mv.db` |

## 6. Configuration

### 6.1 Application.yml
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:sqlite:/path/to/db
  jpa:
    hibernate:
      ddl-auto: validate

logging:
  level:
    com.kingrosez: INFO
```

### 6.2 Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `SYSTEMHEALER_PORT` | 8080 | HTTP port |
| `SYSTEMHEALER_DB_PATH` | %APPDATA% | Database location |
| `SYSTEMHEALER_LOG_LEVEL` | INFO | Logging level |

## 7. Running the Application

### 7.1 From JAR
```bash
java -jar systemhealer-*.jar
```

### 7.2 From IDE
```bash
# IntelliJ
./mvnw spring-boot:run

# VS Code (with extensions)
# Run > Start Debugging (F5)
```

### 7.3 Development Mode
```bash
# Frontend hot reload
cd frontend
npm run dev

# Backend with dev profile
cd ../backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## 8. Docker Deployment (Future)

### 8.1 Docker Build
```dockerfile
FROM eclipse-temurin:17-jre
COPY backend/target/*.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### 8.2 Docker Compose
```yaml
version: '3.8'
services:
  systemhealer:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
```

## 9. Release Process

### 9.1 Version Numbering
- Format: `MAJOR.MINOR.PATCH`
- Semantic Versioning: https://semver.org/

### 9.2 Pre-release Checklist
- [ ] All tests pass
- [ ] Coverage above thresholds
- [ ] Changelog updated
- [ ] Docker image built (if applicable)
- [ ] Release notes drafted
- [ ] Security scan complete

### 9.3 Tagging
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 10. Rollback Procedures

### 10.1 Database Migration Rollback
```bash
# Downgrade database
./mvnw flyway:undo
```

### 10.2 Application Rollback
1. Stop current version
2. Replace JAR with previous version
3. Restore database backup if needed
4. Restart application

## 11. Monitoring in Production (Future)

### 11.1 Health Checks
```bash
curl http://localhost:8080/actuator/health
```

### 11.2 Metrics Endpoint
```bash
curl http://localhost:8080/actuator/metrics
```

## 12. Troubleshooting

### 12.1 Port Already in Use
```bash
# Find process using port 8080
netstat -ano | findstr :8080
# Kill process
taskkill /PID <pid> /F
```

### 12.2 Database Lock
```bash
# Check for lock file
ls -la %APPDATA%\SystemHealer\*.lock
# Remove if stale
del %APPDATA%\SystemHealer\systemhealer.db.lock
```

### 12.3 Debug Logs
```bash
# Run with debug logging
java -jar systemhealer.jar --logging.level.com.kingrosez=DEBUG
```