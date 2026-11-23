# Risk Register

## 1. Purpose
This document tracks known risks to SystemHealer — technical, operational,
security, and project-related — with likelihood, impact, mitigation, and owner.
It is reviewed at each release.

## 2. Scoring

- **Likelihood**: Low / Medium / High
- **Impact**: Low / Medium / High / Critical
- **Priority** = Likelihood × Impact (qualitative)
- **Status**: Open / Mitigated / Accepted / Closed

## 3. Technical Risks

| ID | Risk | Likelihood | Impact | Mitigation | Status | Owner |
|----|------|------------|--------|------------|--------|-------|
| R-T1 | A repair command (SFC/DISM) leaves system in worse state | Medium | High | Restore point before high-risk ops; rollback path; clear warnings | Mitigated | Backend |
| R-T2 | Registry cleanup deletes a needed key | Medium | High | Preview + confirm token; export `.reg` before deletion | Mitigated | Backend |
| R-T3 | Duplicate finder deletes all copies of a file | Low | Critical | Server rejects `WOULD_DELETE_ALL_COPIES`; retain at least one | Mitigated | Backend |
| R-T4 | Command injection via user path input | Low | Critical | Allowlist commands; ProcessBuilder arg lists; path validation | Mitigated | Backend |
| R-T5 | Long scans exhaust memory/CPU | Medium | Medium | Streaming walks; bounded thread pool; limits in config | Mitigated | Backend |
| R-T6 | SSE log stream blocks UI on slow clients | Low | Medium | Bounded queue; drop-oldest with marker | Mitigated | Backend |
| R-T7 | SQLite corruption on crash | Low | High | Integrity check; automatic backups; recovery flow | Mitigated | Backend |
| R-T8 | Flyway migration fails on user DB | Low | High | Pre-migration backup; auto-restore on failure | Mitigated | Backend |
| R-T9 | Windows restore point 24h limit blocks safety | Medium | Medium | Detect limit; warn user; require explicit opt-in | Mitigated | Backend |
| R-T10 | Admin elevation not granted | Medium | Medium | `ADMIN_REQUIRED` error; clear UI prompt | Mitigated | Frontend/Backend |

## 4. Security Risks

| ID | Risk | Likelihood | Impact | Mitigation | Status | Owner |
|----|------|------------|--------|------------|--------|-------|
| R-S1 | Another local process calls the API | Low | High | Localhost-only; session token planned for v1.1 | Accepted (v1) | Backend |
| R-S2 | Command injection | Low | Critical | Allowlist + arg lists + validation | Mitigated | Backend |
| R-S3 | Secrets committed to repo | Low | High | `.env` gitignored; review checklist; agents forbidden | Mitigated | All |
| R-S4 | Malicious dependency | Low | High | Pinned versions; review before adding; future scanning | Accepted (v1) | All |
| R-S5 | Data leakage via logs | Medium | Medium | No telemetry; logs local; export manual | Mitigated | Backend |

## 5. Operational Risks

| ID | Risk | Likelihood | Impact | Mitigation | Status | Owner |
|----|------|------------|--------|------------|--------|-------|
| R-O1 | Installer blocked by SmartScreen | High | Medium | Documentation; future code signing | Open | Maintainer |
| R-O2 | Missing Java on user machine | High | Medium | Bundle JRE via jlink | Mitigated | Maintainer |
| R-O3 | User runs non-admin | Medium | Medium | Clear admin badge; prompts; non-admin features still work | Mitigated | Frontend |
| R-O4 | Windows version incompatibility | Low | Medium | Support matrix; min build 19041 | Accepted | Maintainer |
| R-O5 | BitLocker blocks recovery | Medium | High | Detect + warn + require acknowledgment | Mitigated | Backend |

## 6. Project Risks

| ID | Risk | Likelihood | Impact | Mitigation | Status | Owner |
|----|------|------------|--------|------------|--------|-------|
| R-P1 | Scope creep delays v1 | High | Medium | MoSCoW in PRD; defer Could/Won't items | Open | Maintainer |
| R-P2 | Solo developer bottleneck | High | Medium | AI agents; clear docs; small PRs | Accepted | Maintainer |
| R-P3 | Documentation drifts from code | Medium | Medium | Docs updated in same PR as behavior changes | Mitigated | All |
| R-P4 | Agent introduces regressions | Medium | Medium | AGENTS.md rules; review diffs; tests | Mitigated | Maintainer |
| R-P5 | Naming/brand confusion (old WinToolbox) | Low | Medium | Renamed to SystemHealer; clear README | Mitigated | Maintainer |

## 7. Review Process

- Review at each release (see `RELEASE_STRATEGY.md`).
- Add new risks as they surface.
- Move mitigated risks to `Mitigated` with a short note.
- Closed risks remain for history.

## 8. Escalation

Critical-impact risks that are Open block release. Medium risks require a
documented decision to accept before shipping.

## 9. Related Documents
- `docs/security/SECURITY.md`
- `docs/engineering/ERROR_HANDLING.md`
- `docs/operations/BACKUP_AND_RECOVERY.md`
- `docs/governance/RELEASE_STRATEGY.md`

## 10. Status
Draft — v0.1