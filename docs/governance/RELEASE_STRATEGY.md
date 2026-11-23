# Release Strategy

## 1. Purpose
This document defines the release strategy, process, and procedures for SystemHealer.

## 2. Release Types

### 2.1 Major Release
- **Version format**: `X.0.0`
- **Scope**: Breaking changes, major new features
- **Review**: Architecture review required
- **Testing**: Full regression suite
- **Downtime**: May require database migration

### 2.2 Minor Release
- **Version format**: `X.Y.0`
- **Scope**: New features, non-breaking enhancements
- **Review**: Feature review required
- **Testing**: Feature and regression tests
- **Downtime**: None expected

### 2.3 Patch Release
- **Version format**: `X.Y.Z`
- **Scope**: Bug fixes, security patches
- **Review**: Code review required
- **Testing**: Unit tests for fixes
- **Downtime**: None expected

## 3. Release Schedule

### 3.1 Development Releases
| Frequency | Type | Target |
|-----------|------|--------|
| Daily | Feature branch | Continuous integration |
| Weekly | Main branch | Internal testing |
| Monthly | Tagged release | Beta users |

### 3.2 Production Releases
| Cadence | Criteria |
|---------|----------|
| On-demand | Critical fixes |
| Bi-weekly | Feature completion |
| Quarterly | Major/minor versions |

## 4. Branching Strategy

### 4.1 Git Workflow
```
main (stable releases)
├── develop (integration)
│   ├── feature/user-authentication
│   ├── feature/reporting
│   └── hotfix/security-patch
└── release/v1.0.0
```

### 4.2 Branch Naming
| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<short-name>` | `feature/sfc-enhancement` |
| Hotfix | `hotfix/<issue>` | `hotfix/critical-bug` |
| Release | `release/v<major>.<minor>` | `release/v1.2.0` |
| Maintenance | `maintenance/<type>` | `maintenance/dependency-update` |

### 4.3 Branch Protection
- `main`: Requires PR review, status checks
- `develop`: Requires PR review, status checks

## 5. Release Process

### 5.1 Pre-Release Checklist

#### 5.1.1 Code Freeze
- [ ] All features merged to `develop`
- [ ] No open critical bugs
- [ ] All tests passing

#### 5.1.2 Version Bump
```bash
# Update version in pom.xml
mvn versions:set -DnewVersion=1.2.0
# Commit version bump
git commit -am "chore: bump version to 1.2.0"
```

#### 5.1.3 Changelog Update
Review and update `CHANGELOG.md` with all changes since last release.

#### 5.1.4 Documentation Sync
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Release notes drafted

### 5.2 Release Build

```bash
# Create release branch
git checkout -b release/v1.2.0 develop

# Run full build and test suite
./mvnw clean verify -Pproduction

# Run integration tests
./mvnw verify -Pintegration

# Run security scan
./mvnw dependency-check:check
```

### 5.3 Release Candidate
```bash
# Tag release candidate
git tag -a v1.2.0-rc.1 -m "Release candidate 1"
git push origin v1.2.0-rc.1

# Deploy to beta channel
# Notify beta testers
```

### 5.4 Final Release
```bash
# Create Git tag
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# Publish to distribution
# Update GitHub release
```

### 5.5 Post-Release
- [ ] Merge release branch to `main`
- [ ] Merge release branch to `develop`
- [ ] Deploy to production
- [ ] Close associated issues
- [ ] Update documentation

## 6. Versioning

### 6.1 Semantic Versioning
Format: `MAJOR.MINOR.PATCH`

| Component | Increment When |
|-----------|-----------------|
| MAJOR | Incompatible API changes |
| MINOR | Backward-compatible feature additions |
| PATCH | Backward-compatible bug fixes |

### 6.2 Pre-release Identifiers
| Suffix | Meaning |
|--------|---------|
| `-alpha.1` | Early testing, unstable |
| `-beta.1` | Feature complete, testing |
| `-rc.1` | Release candidate, feature freeze |

### 6.3 Version Display
- UI: Display major.minor in About dialog
- API: Header `X-Version: 1.2.0`
- Changelog: Grouped by version

## 7. Quality Gates

### 7.1 Code Coverage
| Code Type | Minimum Coverage |
|-----------|------------------|
| Backend | 80% line coverage |
| Frontend | 70% line coverage |
| New features | 70% branch coverage |

### 7.2 Test Results
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks meet thresholds

### 7.3 Performance Thresholds
| Metric | Threshold | Test |
|--------|-----------|------|
| App startup | < 3 seconds | Manual |
| API response | < 100ms avg | Load test |
| Memory usage | < 500MB | Stress test |

## 8. Release Approval

### 8.1 Approval Matrix
| Release Type | Reviewer | Approver |
|--------------|----------|----------|
| Patch | Tech Lead | Maintainer |
| Minor | Tech Lead, QA Lead | Maintainer |
| Major | Architecture Review | Maintainer |

### 8.2 Approval Process
1. Create release PR
2. Submit for review
3. Address feedback
4. Obtain approvals
5. Merge to release branch
6. Build and test
7. Tag release

## 9. Distribution

### 9.1 Release Packages
| Package | Contents | Format |
|---------|----------|--------|
| Portable | JAR + Frontend | ZIP |
| Installer | MSI with shortcuts | MSI |
| Portable ZIP | Self-contained | ZIP |

### 9.2 Distribution Channels
- GitHub Releases (primary)
- Direct download (future)
- Microsoft Store (future)

### 9.3 Release Metadata
```json
{
  "version": "1.2.0",
  "buildDate": "2024-01-15T10:00:00Z",
  "changelogUrl": "https://github.com/Kingrosez/SystemHealer/blob/main/CHANGELOG.md",
  "checksum": "sha256:abcd1234..."
}
```

## 10. Rollback Procedures

### 10.1 When to Rollback
- Data corruption detected
- Critical functionality broken
- Security vulnerability discovered

### 10.2 Rollback Steps
1. Stop current version
2. Notify users
3. Deploy previous version
4. Restore database backup (if needed)
5. Validate functionality
6. Resume service

### 10.3 Rollback Commands
```bash
# Stop service
Taskkill /IM java.exe /F

# Restore previous version
xcopy /E /Y "D:\Backups\SystemHealer-v1.1.0" "C:\Program Files\SystemHealer"

# Start service
Start-Process "C:\Program Files\SystemHealer\systemhealer.exe"
```

## 11. Release Notes Template

### 11.1 Format
```markdown
## v1.2.0 (2024-01-15)

### Features
- SFC scan performance improved by 30%
- Native dark mode support added

### Bug Fixes
- Fixed issue where history would not load on first run
- Resolved permission error on Windows 11

### Breaking Changes
- Minimum Windows version increased to 10.0.19041

### Upgrade Notes
- Backup your database before upgrading
- First run after upgrade may take longer (database migration)
```

## 12. Release Metrics

### 12.1 Track These Metrics
| Metric | Target |
|--------|--------|
| Release frequency | Bi-weekly |
| MTTR (Mean Time to Recovery) | < 4 hours |
| Change fail rate | < 5% |
| Lead time for changes | < 1 week |

### 12.2 Retrospective Questions
1. What went well?
2. What could be improved?
3. What did we learn?
4. Action items for next release

## 13. Communication

### 13.1 Release Announcements
- GitHub release
- User notification in-app (future)
- Social media (future)

### 13.2 Support Contacts
- GitHub Issues: https://github.com/Kingrosez/SystemHealer/issues
- Documentation: https://github.com/Kingrosez/SystemHealer#readme