# Documentation Dependency Map

**Generated:** 2026-11-23
**Repository:** SystemHealer

---

## Overview

This document establishes the hierarchy and dependencies between SystemHealer documentation files, showing which documents reference others and the direction of information flow.

---

## 1. Core Foundation Documents

These documents form the foundational knowledge base:

```
PRD.md → Defines what SystemHealer is
SRS.md → Defines what SystemHealer must do
README.md → Entry point, references PRD/SRS
```

**Status:** PRD.md (113 lines) and SRS.md (165 lines) both exist in the repo
root. The "missing" status in earlier versions of this map was incorrect; both
are present and listed in `DOCUMENTATION_INVENTORY.md`.

---

## 2. Architecture Layer

### 2.1 Primary Architecture Documents

```
ARCHITECTURE.md
├── TECH_STACK.md (references)
├── DATABASE_DESIGN.md (arch) (references)
├── PROJECT_STRUCTURE.md (references)
└── ARCHITECTURE_DECISIONS.md (references)
```

### 2.2 Database Design Hierarchy

```
docs/architecture/DATABASE_DESIGN.md (ARCHITECTURE OVERVIEW)
├── docs/database/DATABASE_DESIGN.md (CANONICAL SCHEMA) ← SOURCE OF TRUTH
│   ├── Migration SQL (referenced in text)
│   └── JPA Entity examples (referenced in text)
└── ARCHITECTURE.md (references)
```

**Dependency Flow:**
- Architecture overview → references architecture database design → references canonical schema
- Changes to schema must be made in `docs/database/DATABASE_DESIGN.md`
- Architecture overview should be updated if entity relationships change

---

## 3. Database → Architecture → API Chain

```
DATABASE_DESIGN.md (database)
↓ (schema informs)
API_CONTRACT.md (tables: repair_history, cleanup_items, etc.)
↓ (entities drive)
INTEGRATION_GUIDE.md (data models, SSE patterns)
↓ (implementation drives)
docs/database/migrations/ (referenced but not in docs/)
```

**Key Tables Referenced:**
- `repair_history` → SSE streaming endpoints (repair history + logs)
- `duplicate_groups` / `duplicate_files` → Duplicate finder feature
- `cleanup_items` / `cleanup_executions` → Cleaner feature
- `settings` → Configuration persistence (`log_retention_days`, `theme`, etc.)

**Correction:** The earlier `repair_log_line`, `duplicate_group`,
`duplicate_file`, `uninstall_record`, and `app_setting` table names were
fabricated. The canonical schema (`docs/database/DATABASE_DESIGN.md`) defines
11 tables with the names listed above; those names are the ones actually
present in Flyway migrations V1–V6.

---

## 4. API Layer Dependencies

```
API_CONTRACT.md
├── INTEGRATION_GUIDE.md (references, implementation guidance)
├── ARCHITECTURE.md (backend components)
├── TECH_STACK.md (Spring Boot context)
└── SECURITY.md (CORS, authentication)

INTEGRATION_GUIDE.md
├── DESIGN_SYSTEM.md (for SSE progress indicators)
├── ACCESSIBILITY.md (for error states, live regions)
└── UI_UX_BRIEF.md (for component interactions)
```

**SSE Streaming Endpoint Chain:**
```
Frontend (UI_UX_BRIEF.md)
  → INTEGRATION_GUIDE.md (SSE implementation)
    → API_CONTRACT.md (/api/repair/stream/{taskId})
      → Backend service (Spring Boot)
        → Database (repair_history table)
```

---

## 5. Frontend Layer

```
UI_UX_BRIEF.md
├── DESIGN_SYSTEM.md (tokens, components)
├── ACCESSIBILITY.md (constraints, patterns)
├── UI_UX_GUIDELINES.md (principles)
└── API_CONTRACT.md (endpoint references)
```

**Component Mapping Flow:**
```
UI_UX_BRIEF.md (component assignments)
  → DESIGN_SYSTEM.md (shadcn/ui components)
    → Frontend code (to be implemented)
```

---

## 6. Security Dependencies

```
SECURITY.md
├── docs/engineering/CODING_STANDARDS.md (references)
├── TECH_STACK.md (Spring Security context)
├── ARCHITECTURE.md (security boundaries)
└── DEPLOYMENT.md (elevation requirements)
```

**Key Cross-References:**
- SECURITY.md:153 → docs/architecture/ARCHITECTURE.md, docs/architecture/ARCHITECTURE_DECISIONS.md (NOT CODING_STANDARDS.md)
- ACCESSIBILITY.md → DESIGN_SYSTEM.md (focus indicators, color contrast)

---

## 7. Operations Layer

```
DEPLOYMENT.md
├── CONFIGURATION.md (references)
├── OBSERVABILITY.md (references)
├── BACKUP_AND_RECOVERY.md (references)
└── TECH_STACK.md (JDK bundling)

OBSERVABILITY.md
├── ARCHITECTURE.md (component logs)
└── SECURITY.md (audit logs)
```

---

## 8. Engineering Standards

```
CODING_STANDARDS.md
├── ERROR_HANDLING.md (references)
├── TESTING_STRATEGY.md (references)
├── SECURITY.md (references)
└── PERFORMANCE.md (references)
```

---

## 9. Visual Documentation Flow

```
DESIGN_SYSTEM.md (tokens)
  ↓
ACCESSIBILITY.md (contrast requirements from tokens)
  ↓
UI_UX_BRIEF.md (uses tokens in design)
  ↓
Frontend implementation (React code)
```

**Design Token Flow:**
```
DESIGN_SYSTEM.md
  ├── --primary: #0EA5A4 (light) / #2DD4BF (dark)
  ├── ACCESSIBILITY.md: Documents contrast ratios
  └── UI_UX_BRIEF.md: References tokens at §8.3
```

---

## 10. Testing Documentation Flow

```
TESTING_STRATEGY.md
├── ACCEPTANCE_CRITERIA.md (references)
├── API_CONTRACT.md (endpoint test requirements)
├── docs/engineering/CODING_STANDARDS.md (code quality rules)
└── docs/frontend/ACCESSIBILITY.md (accessibility tests)
```

---

## Dependency Matrix

| From → To | Critical | Medium | Low |
|-----------|----------|--------|-----|
| README.md → | PRD.md, SRS.md, ARCHITECTURE.md | TECH_STACK.md | DEPLOYMENT.md |
| ARCHITECTURE.md → | TECH_STACK.md, DATABASE_DESIGN.md | ARCHITECTURE_DECISIONS.md | PROJECT_STRUCTURE.md |
| DATABASE_DESIGN.md (db) → | API_CONTRACT.md | ARCHITECTURE.md |  |
| API_CONTRACT.md → | INTEGRATION_GUIDE.md | SECURITY.md |  |
| UI_UX_BRIEF.md → | DESIGN_SYSTEM.md, ACCESSIBILITY.md | API_CONTRACT.md |  |
| SECURITY.md → | ARCHITECTURE.md | TECH_STACK.md | DEPLOYMENT.md |
| DEPLOYMENT.md → | OBSERVABILITY.md, CONFIGURATION.md | BACKUP_AND_RECOVERY.md |  |

---

## 11. Build and Reference Order

For new team members or documentation consumers:

1. **README.md** → Entry point
2. **SRS.md** (165 lines, present) → Requirements
3. **ARCHITECTURE.md** → System understanding
4. **TECH_STACK.md** → Technology context
5. **DATABASE_DESIGN.md** (database version) → Data model
6. **API_CONTRACT.md** → Interface definition
7. **UI_UX_BRIEF.md** → User interface design
8. **DESIGN_SYSTEM.md** → Visual language
9. **ACCESSIBILITY.md** → Inclusive design constraints
10. **SECURITY.md** → Security requirements
11. **DEPLOYMENT.md** → Operational concerns
12. **CODING_STANDARDS.md** → Development practices

---

## 12. Missing Links

| Missing Document | Referenced By | Should Link To |
|------------------|---------------|----------------|
| (none) | — | — |

PRD.md and SRS.md both exist in the repository root (113 and 165 lines
respectively). They are not missing; the earlier "missing" rows in this table
were incorrect and have been removed.

---

## 13. Data Retention Policy References

```
docs/database/DATABASE_DESIGN.md — Section 9: Data Retention & Cleanup
  ↓ references
settings.log_retention_days (existing column)
```

Actual retention policies are documented in:
- `docs/database/DATABASE_DESIGN.md` Section 9 (Data Retention & Cleanup)
- `docs/architecture/DATABASE_DESIGN.md` Section 6 (Retention and Backup)

**Correction:** The earlier "Section 8.4: Data Retention Policy" reference, the
`DATA_RETENTION` table, and the `CLEANER.md` document were fabricated and have
been removed. No `DATA_RETENTION` table exists in the canonical schema (11
tables, verified), and there is no `docs/cleaner.md` in the repository.
Retention is expressed through the existing `settings.log_retention_days`
column and the policy text in `docs/database/DATABASE_DESIGN.md` §9.

---

## 14. Glossary Cross-References

| Term | Defined In | Referenced By |
|------|------------|-------------|
| SSE (Server-Sent Events) | INTEGRATION_GUIDE.md | API_CONTRACT.md |
| Recovery Point | docs/architecture/DATABASE_DESIGN.md | DEPLOYMENT.md |
| Confirmation Token | INTEGRATION_GUIDE.md, SECURITY.md | API_CONTRACT.md |
| Primary Button | DESIGN_SYSTEM.md | ACCESSIBILITY.md |

---

## Notes

1. The `docs/database/DATABASE_DESIGN.md` is the canonical source for schema changes
2. All frontend design should reference `DESIGN_SYSTEM.md` for tokens
3. `UI_UX_BRIEF.md` should be kept in sync with `DESIGN_SYSTEM.md` for color contrast validation
4. The dependency map should be updated when new features add cross-document references

## 15. Status
Draft — v0.1