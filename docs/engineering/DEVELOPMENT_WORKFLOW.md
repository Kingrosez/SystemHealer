# Development Workflow

## 1. Purpose
This document describes the development workflow for SystemHealer contributors.

## 2. Local Development Setup

### 2.1 Prerequisites
- Java 17 JDK (OpenJDK or Oracle)
- Node.js 18+ and npm
- Git 2.40+
- Windows 10/11 (for Windows integration testing)

### 2.2 Repository Setup
```bash
# Clone the repository
git clone https://github.com/Kingrosez/SystemHealer.git
cd SystemHealer

# Checkout the latest main branch
git checkout main
git pull origin main
```

## 3. Backend Development

### 3.1 Starting the Backend
```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`.

### 3.2 Running Tests
```bash
# Unit tests only
./mvnw test

# With detailed output
./mvnw test -Dverbose

# Skip tests (not recommended for commits)
./mvnw test -DskipTests
```

### 3.3 Building the JAR
```bash
./mvnw clean package
```

The JAR is created at `backend/target/systemhealer-*.jar`.

## 4. Frontend Development

### 4.1 Installing Dependencies
```bash
cd frontend
npm install
```

### 4.2 Starting the Dev Server
```bash
npm run dev
```

The frontend starts on `http://localhost:3000`.

### 4.3 Building for Production
```bash
npm run build
```

The build output is at `frontend/dist/`.

### 4.4 Running Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 5. Database Development

### 5.1 Initial Setup
The backend auto-initializes the database using Flyway migrations.

### 5.2 Modifying the Schema
1. Create a new migration file in `backend/src/main/resources/db/migration/`:
   - `V<N+1>__<description>.sql` (where N is the last migration number)
2. Run migrations: `./mvnw spring-boot:run`
3. Update `docs/architecture/DATABASE_DESIGN.md` with schema changes.

### 5.3 Testing Schema Changes
- Use H2 in-memory database for tests.
- Ensure H2 compatibility for in-memory tests.
- SQLite for production.

## 6. API Development

### 6.1 Adding a New Endpoint
1. Define the API contract in `docs/api/API_CONTRACT.md`.
2. Create DTOs in `backend/src/main/java/com/kingrosez/systemhealer/model/`.
3. Update or create Controller in `api/`.
4. Implement service logic in `service/`.

### 6.2 Testing API Endpoints
- Use `@WebMvcTest` for controller unit tests.
- Use `@SpringBootTest` with `@AutoConfigureMockMvc` for integration tests.

## 7. Git Workflow

### 7.1 Branch Creation
```bash
git checkout main
git pull origin main
git checkout -b type/short-name
```

Branch types:
- `feature/` — New feature
- `fix/` — Bug fix
- `docs/` — Documentation only
- `test/` — Adding tests
- `refactor/` — Code restructure

### 7.2 Committing
Follow Conventional Commits:
```bash
git add .
git commit -m "feat(repair): add SFC scan endpoint"
```

### 7.3 Pull Request Process
1. Push branch to remote: `git push -u origin type/short-name`
2. Create PR via GitHub web UI
3. Address review comments
4. Merge via "Squash and merge" (maintains linear history)

## 8. Code Review Process

### 8.1 PR Checklist
- [ ] Code follows coding standards
- [ ] Tests written/updated
- [ ] Documentation updated (CHANGELOG, README, API docs)
- [ ] No hardcoded secrets
- [ ] Build passes locally
- [ ] Tests pass

### 8.2 Review Time
- Aim for review within 24 hours
- Complex changes may require discussion

## 9. Release Process

See `docs/operations/RELEASE_STRATEGY.md` for detailed release workflow.

## 10. Common Tasks

### 10.1 Clean Build
```bash
# Frontend
npm run clean  # if available, otherwise rm -rf node_modules dist

# Backend
./mvnw clean
```

### 10.2 Reset IDE
- Invalidate caches and restart (IDE-specific)
- Re-import Maven project

### 10.3 Debug Issues
1. Check logs at `backend/logs/` (if configured)
2. Run tests locally to isolate issues
3. Search for related code or issues

## 11. Environment Configuration

### 11.1 Local Environment Variables
Create `backend/.env` for local secrets (git-ignored):
```
DB_URL=jdbc:sqlite:/path/to/local.db
```

### 11.2 IDE Configuration
- Use IDE formatter matching the project style
- Enable file watching for hot reload (Spring Boot DevTools)
- Configure TypeScript/JavaScript linting plugins