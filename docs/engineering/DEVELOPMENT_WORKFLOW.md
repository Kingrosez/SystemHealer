# Development Workflow

## 1. Purpose
This document describes the end-to-end development process for SystemHealer —
from picking up a task to merging code into `main`. It complements
`CONTRIBUTING.md` (contributor-facing) and `AGENTS.md` (agent-facing) by focusing
on the practical daily loop.

## 2. Workflow Overview

### 2.1 Daily Loop
```
1. Sync → Create branch → Code → Test → Commit → Push → PR
2. Wait for review → Address comments → Approve
```

### 2.2 Branch Lifespan
- Feature branches: live until merged.
- Hotfix branches: merged to both `main` and `develop` (if present).
- Delete after merge: `git branch -d type/short-name`.

## 3. Local Development Setup

### 3.1 Prerequisites
| Tool | Version | Purpose |
|------|---------|---------|
| JDK | 17+ (OpenJDK/Oracle) | Backend compilation |
| Node.js | 18+ | Frontend tooling |
| Git | 2.40+ | Version control |
| Windows | 10/11 | Platform target |

### 3.2 Initial Setup
```bash
# Clone and enter
git clone https://github.com/Kingrosez/SystemHealer.git
cd SystemHealer

# Set up backend
cd backend
./mvnw install -DskipTests  # Download dependencies

# Set up frontend
cd ../frontend
npm install
```

## 4. Backend Development (Spring Boot)

### 4.1 Running the Server
```bash
# From project root
./mvnw -pl backend spring-boot:run
```

Server available at `http://localhost:8080`.

### 4.2 Development Mode
Enable hot-reload by adding to `application-dev.yml`:
```yaml
spring:
  devtools:
    restart:
      enabled: true
```

### 4.3 Testing Backend
```bash
# Unit tests only
./mvnw test

# With coverage
./mvnw jacoco:report

# Integration tests
./mvnw verify -P integration

# Skip tests (local debugging only)
./mvnw test -DskipTests
```

### 4.4 Building
```bash
# Clean build
./mvnw clean package -DskipTests

# With tests
./mvnw clean verify
```

## 5. Frontend Development (React + TypeScript)

### 5.1 Running the Dev Server
```bash
cd frontend
npm run dev
```

Available at `http://localhost:3000`.

### 5.2 Development Commands
```bash
# Start dev server (HMR enabled)
npm run dev

# Run tests in watch mode
npm run test:watch

# Run tests once
npm run test

# Build for production
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
```

### 5.3 Testing Frontend
```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests (future)
npm run e2e
```

## 6. Database Workflow

### 6.1 Local Development Database
- Backend uses SQLite by default in development.
- Database auto-created at `%APPDATA%\SystemHealer\systemhealer.db`.

### 6.2 Schema Changes
1. Create migration in `backend/src/main/resources/db/migration/`:
   ```
   V002__add_repair_columns.sql
   ```
2. Run `./mvnw spring-boot:run` to apply migration.
3. Update `docs/database/DATABASE_DESIGN.md`.

### 6.3 Testing Database Access
```java
@SpringBootTest
@Testcontainers
class MyRepositoryTest {
    // Tests use H2 in-memory by default
}
```

## 7. API Development

### 7.1 Adding an Endpoint
1. Define contract in `docs/api/API_CONTRACT.md`.
2. Create DTOs in `backend/src/main/java/com/kingrosez/dto/`.
3. Update service layer in `backend/src/main/java/com/kingrosez/service/`.
4. Add controller in `backend/src/main/java/com/kingrosez/api/`.
5. Write tests.

### 7.2 Testing APIs
```bash
# API tests
npm run test:api  # Frontend tests

# Or use curl/Postman for manual testing
curl http://localhost:8080/api/health
```

## 8. Git Workflow

### 8.1 Creating a Branch
```bash
# Always start from updated main
git checkout main
git pull origin main

# Create branch with type prefix
git checkout -b feature/my-new-feature
```

### 8.2 Making Commits
Use Conventional Commits:
```bash
git add .
git commit -m "feat(repair-service): add SFC scan endpoint"
```

Commit message format: `<type>(<scope>): <description>`

### 8.3 Pull Request Process
1. Push branch: `git push -u origin feature/my-new-feature`
2. Create PR via GitHub web UI
3. Address review comments
4. Merge with "Squash and merge" (maintains linear history)

## 9. Code Review Process

### 9.1 PR Checklist
- [ ] Code follows `docs/engineering/CODING_STANDARDS.md`
- [ ] Tests written/updated
- [ ] Documentation updated (CHANGELOG, README)
- [ ] No hardcoded secrets
- [ ] Build passes locally
- [ ] All tests pass
- [ ] Integration tests added for new endpoints

### 9.2 Review Timeline
- Target: review within 24 hours
- Complex changes: schedule design discussion

## 10. Release Process

See `docs/governance/RELEASE_STRATEGY.md` for detailed release workflow.

## 11. Common Tasks

### 11.1 Clean Everything
```bash
# Frontend
npm run clean  # rm -rf node_modules dist

# Backend
./mvnw clean

# Full clean
./mvnw clean verify
npm run build
```

### 11.2 IDE Reset
- Invalidate caches (Help → Invalidate Caches)
- Re-import Maven project
- Restart TypeScript server (Cmd+Shift+P → TypeScript: Restart TS Server)

### 11.3 Troubleshooting
1. Check logs at `backend/logs/` (if configured)
2. Run relevant tests locally
3. Search for related code or issues
4. Check `docs/operations/DEPLOYMENT.md` for environment-specific info

## 12. Environment Configuration

### 12.1 Local Profiles
Create `backend/application-local.yml`:
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:sqlite:/path/to/local.db
```

### 12.2 IDE Configuration
- Use IDE formatter (Spotless for Java, Prettier for TypeScript)
- Enable file watching for hot reload
- Configure ESLint plugin for inline linting

## 13. Deployment Workflow

### 13.1 Build for Release
```bash
# From project root
./mvnw clean package -P production
```

Output: `backend/target/systemhealer-*.jar`

### 13.2 Creating an Installer (Future)
See `docs/operations/DEPLOYMENT.md` for MSI generation workflow.

## 14. Issue Workflow

### 14.1 From GitHub Issue
1. Comment "I'm working on this" to claim
2. Create branch: `fix/123-brief-description`
3. Reference issue in commit: `fix(health): resolve timeout (#123)`

### 14.2 Closing an Issue
- PRs with `fixes #123` or `closes #123` auto-close the issue
- Include summary of changes in PR description

## 15. Documentation Updates

After code changes:
- Update `CHANGELOG.md` for user-facing changes
- Update API docs in `docs/api/API_CONTRACT.md`
- Update architecture docs in `docs/architecture/` if needed