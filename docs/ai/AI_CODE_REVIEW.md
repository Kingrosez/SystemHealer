# AI Code Review

## 1. Purpose
This document defines the AI-assisted code review process for SystemHealer, including review criteria, automated checks, and feedback handling.

## 2. Code Review Criteria

### 2.1 Correctness
- [ ] Logic is correct for all branches
- [ ] Edge cases are handled
- [ ] Error conditions are properly caught
- [ ] No off-by-one errors

### 2.2 Quality
- [ ] Code follows project conventions
- [ ] Meaningful variable and method names
- [ ] Methods are appropriately sized (< 50 lines)
- [ ] No code duplication
- [ ] Single responsibility principle

### 2.3 Maintainability
- [ ] Clear comments for complex logic
- [ ] Documentation updated
- [ ] Type safety maintained
- [ ] No TODOs or FIXMEs

### 2.4 Security
- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] SQL injection prevented
- [ ] Command injection prevented
- [ ] Authentication checked for sensitive operations

### 2.5 Performance
- [ ] No N+1 query patterns
- [ ] Efficient data structures
- [ ] Appropriate caching
- [ ] No memory leaks

## 3. Review Process

### 3.1 AI Pre-Review
1. AI analyzes code changes against checklist
2. AI suggests improvements
3. AI flags potential issues

### 3.2 Human Review
1. Validate AI findings
2. Review suggested changes
3. Apply or refine recommendations
4. Verify test coverage

### 3.3 Review Stages
| Stage | Focus |
|-------|-------|
| Pre-check | Build failures, compile errors |
| Structural | Architecture, design patterns |
| Detail | Logic, edge cases, tests |
| Security | Vulnerabilities, access control |
| Documentation | Comments, README updates |

## 4. Automated Review Tools

### 4.1 Static Analysis
| Tool | Language | Rules |
|------|----------|-------|
| SpotBugs | Java | Bug patterns, null dereferences |
| ESLint | TypeScript | Code style, best practices |
| SonarQube | Multiple | Code quality, security |

### 4.2 Security Scanning
| Tool | Checks |
|------|--------|
| OWASP Dependency-Check | Vulnerable dependencies |
| Snyk | Security vulnerabilities |
| Trivy | Container image scanning |

### 4.3 Code Quality
| Tool | Metrics |
|------|---------|
| Checkstyle | Code style |
| PMD | Code smells |
| JaCoCo | Test coverage |

## 5. AI Review Prompts

### 5.1 Standard Review Prompt
```markdown
Review this code change:

## Files Changed
[diff content]

## Review Checklist
- Correctness: Any logic errors?
- Security: Any vulnerabilities?
- Performance: Any issues?
- Style: Does it match project conventions?
- Tests: Are tests adequate?
- Documentation: Is it documented?

## Project Conventions
- File: [path to style guide]
- Patterns: [relevant patterns]
```

### 5.2 Security-Focused Review Prompt
```markdown
Conduct a security review of this code change:

[code diff]

Focus on:
- Input validation
- Command injection
- SQL injection
- Authentication/authorization
- Data exposure
- Privilege escalation

Flag any security concerns with severity (Critical/High/Medium/Low).
```

## 6. Review Findings Categories

### 6.1 Critical Issues
Must be fixed before merge:
- Security vulnerabilities
- Data corruption risk
- Critical bugs affecting users

### 6.2 High Priority Issues
Should be fixed in current PR:
- Performance problems
- Code quality issues
- Missing tests

### 6.3 Medium Priority Issues
Can be addressed later:
- Minor style violations
- Suggestion for improvement
- Documentation gaps

### 6.4 Low Priority Issues
Nice to have:
- Minor optimizations
- Alternative approaches

## 7. Review Response Format

### 7.1 Summary
```
Review Summary
==============
Critical: 0
High: 2
Medium: 1
Low: 3

Overall: Code is ready with minor fixes
```

### 7.2 Detailed Findings
```markdown
### Critical
None

### High
1. **SECURITY**: Command injection risk in RepairService.java:45
   - User input not sanitized before passing to ProcessBuilder
   - Fix: Use validation whitelist or escape special characters

2. **PERFORMANCE**: N+1 query in HistoryController.java:32
   - Database load inside loop
   - Fix: Use JOIN or batch fetch

### Medium
1. **TESTING**: Missing test for null input validation
   - Add unit test for null handling

### Low
1. **STYLE**: Inconsistent naming in DTO
   - Use camelCase for field names
```

## 8. Review Tools Interface

### 8.1 CLI Review
```bash
# Generate diff for review
git diff HEAD~1 HEAD | ai-review --format=markdown
```

### 8.2 IDE Integration
- Right-click: "Review with AI"
- Inline suggestions for improvements
- Batch review for changed files

## 9. Review Escalation

### 9.1 When to Escalate
- Security vulnerabilities found
- Architectural concerns
- Conflicts between team members
- Unclear requirements

### 9.2 Escalation Process
1. Document issue with AI findings
2. Notify tech lead or security team
3. Schedule discussion
4. Document decision

## 10. Review Metrics

### 10.1 Track These Metrics
| Metric | Target |
|--------|--------|
| Reviews completed | 100% of PRs |
| Critical issues caught pre-merge | 100% |
| Review time | < 2 hours |
| Review comments per PR | 2-5 |

### 10.2 Review Quality Score
```
Score = (issues_found * 10) - (issues_missed * 20) - (false_positives * 5)
```

## 11. AI Review Limitations

### 11.1 Can Not Detect
- Business logic correctness
- User experience issues
- Architectural fitness
- Future maintainability impact

### 11.2 Requires Human Judgment For
- Trade-off decisions
- Risk assessment
- Context-dependent requirements
- Stakeholder impact

## 12. Review Training

### 12.1 Sample Reviews
Review AI review outputs from:
- High-quality PRs
- PRs with issues
- Security-sensitive changes

### 12.2 Continuous Improvement
- Refine prompts based on findings
- Update checklist with new concerns
- Share effective review patterns

## 13. Post-Review Actions

### 13.1 Apply Changes
```bash
# AI applies suggestions
ai-apply-suggestions

# Or manual review and apply
git commit -am "review: address AI suggestions"
```

### 13.2 Document Decisions
```markdown
Review Decisions
================
- Kept existing pattern for backward compatibility
- Deferred security fix to next sprint
- Added documentation as suggested
```

## 14. Review Templates

### 14.1 New File Review
- Architecture fit
- Dependency justification
- Test coverage
- Documentation

### 14.2 Bug Fix Review
- Root cause identified
- Fix addresses cause, not symptom
- Regression test added
- No unintended side effects

### 14.3 Feature Review
- Requirements met
- Edge cases handled
- Error messages clear
- Performance acceptable