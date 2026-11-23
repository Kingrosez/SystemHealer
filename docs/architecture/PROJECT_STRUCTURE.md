# Project Structure

## 1. Purpose
This document defines the folder and file layout of the SystemHealer repository.
All scaffolding and future code must follow this structure. Deviations require
an update to this document first.

## 2. Top-Level Layout

```
SystemHealer/
├── frontend/              # React TypeScript SPA
├── backend/               # Spring Boot REST API
├── docs/                  # Documentation
├── .gitignore
├── LICENSE
└── README.md
```

## 3. Frontend Structure

```
frontend/
├── src/
│   ├── api/               # API client (Axios, React Query hooks)
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and constants
│   ├── pages/             # Route-level components
│   ├── styles/            # Global CSS, Tailwind config
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                # Static assets
│   └── index.html
├── tests/                 # Unit and component tests
├── vite.config.ts         # Vite configuration
├── tsconfig.json
├── package.json
└── postcss.config.js      # PostCSS for Tailwind
```

### Key Frontend Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | React entry point, renders `<App />` |
| `src/App.tsx` | Root component, renders router |
| `src/pages/` | Tab pages: Dashboard, Repair, Uninstaller, Cleaner, Updater, Recovery, History, Settings |
| `src/api/` | Axios instance and query/mutation hooks |
| `src/components/ui/` | shadcn/ui components |
| `src/components/` | Custom components (modals, progress bars, log panels) |

## 4. Backend Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/kingrosez/systemhealer/
│   │   │   ├── SystemHealerApplication.java
│   │   │   ├── api/               # REST controllers
│   │   │   ├── service/           # Business logic
│   │   │   ├── model/             # Domain entities
│   │   │   ├── repository/        # JPA repositories
│   │   │   ├── integration/       # Windows command wrappers
│   │   │   └── config/            # Spring configuration
│   │   └── resources/
│   │       ├── application.yml    # Main config
│   │       ├── db/migration/      # Flyway migrations
│   │       └── logback.xml        # Logging config
│   └── test/
│       └── java/com/kingrosez/systemhealer/
│           └── *Test.java         # Unit and integration tests
├── pom.xml
└── mvnw                           # Maven wrapper (Unix)
├── mvnw.cmd                       # Maven wrapper (Windows)
```

### Key Backend Packages

| Package | Purpose |
|---------|---------|
| `api/` | REST controllers (`RepairController`, `UninstallController`, etc.) |
| `service/` | Business logic (`RepairService`, `CleanupService`, `HistoryService`) |
| `model/` | JPA entities (`RepairJob`, `HistoryEntry`, `FileItem`) |
| `repository/` | Database access (`RepairJobRepository`, etc.) |
| `integration/` | Windows command execution (`SfcExecutor`, `WingetExecutor`) |
| `config/` | Security, CORS, logging configuration |

## 5. Documentation Structure

```
docs/
├── architecture/
│   ├── ARCHITECTURE.md              # High-level component diagram
│   ├── TECH_STACK.md                # Technology list
│   ├── PROJECT_STRUCTURE.md         # This file
│   ├── DATABASE_DESIGN.md           # Data schema and models
│   └── ARCHITECTURE_DECISIONS.md    # ADR index
├── engineering/
│   ├── CODING_STANDARDS.md          # Code style, patterns
│   ├── DEVELOPMENT_WORKFLOW.md      # Dev process
│   ├── ERROR_HANDLING.md            # Error patterns
│   ├── PERFORMANCE.md               # Performance guidelines
│   └── SCALABILITY.md               # Scalability notes
├── api/
│   ├── API_CONTRACT.md              # REST API specification
│   └── INTEGRATION_GUIDE.md         # Client usage
├── database/
│   └── DATABASE_DESIGN.md           # Schema documentation
├── security/
│   └── SECURITY.md                  # Security guidelines
├── frontend/
│   ├── DESIGN_SYSTEM.md             # UI/UX standards
│   ├── UI_UX_GUIDELINES.md          # Design principles
│   └── ACCESSIBILITY.md             # A11y requirements
├── testing/
│   ├── TESTING_STRATEGY.md          # Test approach
│   └── ACCEPTANCE_CRITERIA.md       # QA criteria
├── operations/
│   ├── DEPLOYMENT.md                # Release process
│   ├── OBSERVABILITY.md             # Logging, monitoring
│   ├── CONFIGURATION.md             # App configuration
│   └── BACKUP_AND_RECOVERY.md       # Data recovery
├── governance/
│   ├── RELEASE_STRATEGY.md          # Versioning, releases
│   └── RISK_REGISTER.md             # Risk tracking
└── ai/
    ├── AI_WORKFLOW.md               # AI agent procedures
    ├── AI_CODE_REVIEW.md            # Code review guidelines
    └── PROMPT_STANDARDS.md          # Prompt templates
```

## 6. Root-Level Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start |
| `LICENSE` | MIT License |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CHANGELOG.md` | Version history |
| `PROJECT_REQUIREMENTS.md` | Functional/non-functional requirements |
| `PRD.md` | Product requirements |
| `SRS.md` | Software requirements specification |
| `AGENTS.md` | AI agent operating guidelines |

## 7. Git Ignore Patterns

The `.gitignore` excludes:
- `node_modules/` — Frontend dependencies
- `backend/target/` — Backend build artifacts
- `*.class` — Compiled Java
- `*.log` — Log files
- `dist/` — Frontend production build
- `.env` — Environment variables
- `systemhealer.db` — Local SQLite database

## 8. Naming Conventions

### Files
- **Frontend**: `PascalCase` for components (`RepairCard.tsx`), `camelCase` for utilities
- **Backend**: `PascalCase` for classes (`RepairService.java`)
- **Test files**: `ClassNameTest.java` or `testName.test.ts`

### Directories
- All lowercase with hyphens for multi-word names
- Examples: `api-client`, `system-repair`

### Branches (per CONTRIBUTING.md)
- Feature: `feature/short-name`
- Bug fix: `fix/short-name`
- Documentation: `docs/short-name`
- Test: `test/short-name`

## 9. Change Management

When adding new folders or files:
1. Update this document first
2. Create the files with appropriate headers
3. Commit with `docs: scaffold <file-name>`

## 10. Architecture Status

Draft — v0.1