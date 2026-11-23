# AI Workflow

## 1. Purpose
This document defines the workflow for using AI assistance in SystemHealer development, including when to engage AI, how to structure requests, and how to integrate AI-generated code safely.

## 2. AI Usage Principles

### 2.1 When to Use AI
- Code generation for boilerplate and scaffolding
- Code review and quality suggestions
- Documentation writing and updating
- Test case generation
- Architecture discussion and design exploration
- Debugging assistance

### 2.2 When NOT to Use AI
- Critical system modifications without review
- Security-sensitive code paths
- Database schema changes without validation
- Windows system commands without thorough testing
- Production deployment decisions

## 3. AI Development Workflow

### 3.1 Request Process
```
1. Define clear task description
2. Include relevant context (file paths, error messages)
3. Specify constraints and requirements
4. Request incremental changes, not full rewrites
5. Review AI output before acceptance
6. Test changes thoroughly
```

### 3.2 Task Request Template
```markdown
## Task: Fix SFC timeout handling

### Context
File: backend/src/main/java/com/kingrosez/service/RepairService.java
Issue: SFC operations timeout after 30 seconds, but some require more time

### Requirements
- Preserve existing behavior for fast operations
- Allow configurable timeout via properties file
- Log timeout events for debugging

### Constraints
- Do not modify the React frontend
- Keep changes backward compatible
- Add unit tests
```

## 4. AI Code Integration Process

### 4.1 Code Review Steps
1. **Understand** the AI-generated code
   - Read through all changes
   - Identify new patterns and dependencies

2. **Verify** correctness
   - Check business logic
   - Validate edge cases
   - Ensure error handling

3. **Compare** with existing code
   - Check naming conventions
   - Verify style consistency
   - Look for duplication

4. **Test** integration
   - Run relevant unit tests
   - Run integration tests
   - Manual verification if needed

### 4.2 Acceptance Checklist
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No new security vulnerabilities
- [ ] No unused dependencies added
- [ ] Follows project conventions
- [ ] Adequate test coverage
- [ ] Documentation updated

## 5. AI Tools in Use

### 5.1 Claude Code
- Primary AI coding assistant
- Handles code generation, refactoring, and review
- Integrated with git workflow

### 5.2 Usage Guidelines
- Provide complete context for best results
- Use incremental prompts for multi-step changes
- Always verify before committing

## 6. Prompt Engineering Best Practices

### 6.1 Effective Prompts
```markdown
Good:
"Add a new endpoint GET /api/system/status that returns CPU and memory usage"

Bad:
"Add system monitoring"
```

### 6.2 Include This Information
- File or files to modify
- Existing patterns and conventions
- Test requirements
- Output format expected

## 7. AI-Augmented Testing

### 7.1 Test Generation
AI can generate test cases for:
- Unit tests for new functions
- Edge case exploration
- Integration test scenarios

### 7.2 Test Review Process
1. AI generates test skeleton
2. Developer fills in test data
3. Review test correctness
4. Verify test coverage

## 8. AI-Assisted Refactoring

### 8.1 When to Refactor with AI
- Large code cleanup efforts
- Pattern standardization
- Removing code smells
- Modernizing deprecated patterns

### 8.2 Refactoring Checklist
- [ ] Create restore point
- [ ] Run tests before refactoring
- [ ] Refactor one component at a time
- [ ] Verify tests after each change
- [ ] Update documentation if needed

## 9. Knowledge Base Integration

### 9.1 Documentation as Context
When asking AI about:
- System architecture: Reference docs/architecture/*.md
- API contracts: Reference docs/api/API_CONTRACT.md
- Security model: Reference docs/security/SECURITY.md

### 9.2 Code References
- Point to specific file:line
- Include relevant classes/methods
- Show existing patterns to follow

## 10. AI Limitations and Known Issues

### 10.1 Common AI Mistakes
- Incorrect API signatures
- Missing error handling
- Security vulnerabilities
- Performance issues
- Type mismatches

### 10.2 Mitigation Strategies
- Always test in development first
- Use CI/CD as safety net
- Peer review for critical changes
- Security scan before merge

## 11. AI Collaboration Patterns

### 11.1 Pair Programming Mode
1. Human writes initial code
2. AI suggests improvements
3. Human applies and refines
4. Repeat

### 11.2 Review Mode
1. AI performs initial code review
2. Human validates findings
3. Address issues together
4. Document decisions

### 11.3 Learning Mode
1. AI explains concepts
2. Human tests understanding
3. Apply knowledge to code
4. Verify results

## 12. Metrics and Feedback

### 12.1 Track These Metrics
| Metric | Target |
|--------|--------|
| AI-generated code review time | < 10 min/change |
| AI-assisted PR size | < 200 lines |
| Issues introduced by AI | < 1 per month |

### 12.2 Feedback Loop
1. Mark effective AI suggestions
2. Report incorrect suggestions
3. Provide context improvement hints
4. Update internal knowledge

## 13. Security Considerations

### 13.1 Code Security
- Never let AI write security-critical code without review
- Validate all system command executions
- Review permission-related changes

### 13.2 Data Security
- Do not include sensitive data in prompts
- Review AI-generated configuration for security defaults
- Validate credential handling

## 14. Team Process

### 14.1 AI Review Integration
- AI feedback appears as code suggestions
- Developers decide acceptance
- Document AI-assisted changes in commit messages

### 14.2 Training and Onboarding
- New developers learn patterns from AI
- AI helps understand existing codebase
- Knowledge transfer through AI