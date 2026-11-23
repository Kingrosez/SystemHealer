# AI Code Review

## 1. Purpose
This document defines how to review code and documentation produced by AI agents
on SystemHealer. AI output is fast but can be subtly wrong, over-broad, or
unsafe. The review process treats agent output like any external contribution:
verify, don't assume.

## 2. Review Principles

- **Trust, but verify**: check the diff, not just the summary.
- **Scope discipline**: only intended files should change.
- **Safety first**: no destructive commands, no secrets, no main pushes.
- **Consistency**: follow `CODING_STANDARDS.md` and the doc conventions.
- **Reproducibility**: the agent's report must match what actually changed.

## 3. Pre-Review Checks (Agent's Own Report)

Before reading the diff, confirm the agent reported:

- [ ] Branch name
- [ ] Commit hash(es)
- [ ] Files changed (should match the task)
- [ ] Push confirmation
- [ ] Explicit statement that `main` was not touched
- [ ] No PR created (unless requested)

If any are missing, ask the agent to re-report before reviewing.

## 4. Diff Review Checklist

### 4.1 Scope
- [ ] Only the files specified in the prompt changed
- [ ] No unrelated refactors or reformatting
- [ ] No deleted files unless requested
- [ ] No new dependencies without doc updates

### 4.2 Correctness
- [ ] Content/logic matches the prompt
- [ ] Tables, code blocks, and diagrams are intact
- [ ] No truncated or placeholder content left behind
- [ ] Links point to real files

### 4.3 Safety
- [ ] No secrets, tokens, or `.env` contents
- [ ] No destructive system commands (e.g., `rm -rf`, registry deletes)
- [ ] No `git push` to `main`
- [ ] No force-push
- [ ] No changes to `LICENSE`, `README.md`, `.gitignore` unless requested

### 4.4 Conventions
- [ ] Branch name follows `feature/`, `docs/`, `fix/`, `chore/`, etc.
- [ ] Commit message follows Conventional Commits
- [ ] Code follows `CODING_STANDARDS.md` (for code tasks)
- [ ] Docs follow the structure used in other `.md` files

### 4.5 Tests (Code Tasks)
- [ ] Tests added/updated for new behavior
- [ ] Tests pass locally or in CI
- [ ] No real system commands in tests

## 5. Common Agent Failure Modes

| Failure | How to spot | Fix |
|---------|-------------|-----|
| Scope creep | Extra files in the diff | Ask agent to revert unrelated changes |
| Truncated content | Missing sections/tables | Re-issue with full content |
| Nested code-fence breakage | Fragmented blocks | Use indented blocks in prompts |
| Silent workaround | Agent reports success but diff differs | Compare commit hash + files |
| Wrong branch | Commit on `main` or old branch | Stop; reset; re-issue |
| Hallucinated file | Agent edits a non-existent path | Verify file exists first |
| Placeholder code | `// TODO` left in committed code | Reject; require completion |
| Secrets in diff | API keys, tokens | Reject; rotate; remove from history |

## 6. Documentation Review (`.md` Tasks)

- [ ] Title matches filename
- [ ] Numbered sections consistent with sibling docs
- [ ] Tables render correctly (pipes aligned, headers present)
- [ ] Code blocks have language tags
- [ ] Related Documents section present and accurate
- [ ] Status section present (`Draft — v0.1`)
- [ ] No lorem ipsum or empty sections

## 7. Code Review (Code Tasks)

- [ ] Follows package-by-feature (`PROJECT_STRUCTURE.md`)
- [ ] No business logic in controllers/components
- [ ] OS commands only via `exec/CommandRunner`
- [ ] Errors use the standard envelope
- [ ] Destructive endpoints use preview + confirm token
- [ ] Logging uses SLF4J / no `console.log`
- [ ] No `any` (frontend) or raw types (backend)

## 8. Approval and Merge

- Human (or Review Agent) approves only when all checks pass.
- Merge via **Squash and merge**.
- Delete the branch after merge.
- If issues found: request changes; agent fixes on the same branch; re-review.

## 9. Post-Merge Verification

- [ ] `main` builds
- [ ] Tests pass on `main`
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] Docs links valid

## 10. Related Documents
- `AGENTS.md`
- `docs/ai/AI_WORKFLOW.md`
- `docs/ai/PROMPT_STANDARDS.md`
- `docs/engineering/CODING_STANDARDS.md`
- `CONTRIBUTING.md`

## 11. Status
Draft — v0.1