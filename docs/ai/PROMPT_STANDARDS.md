# Prompt Standards

## 1. Purpose
This document defines how to write prompts for AI agents working on SystemHealer.
Good prompts are specific, scoped, and include constraints and a stop condition.
These standards reduce ambiguity, prevent scope creep, and make agent output
reviewable.

## 2. Prompt Anatomy

Every task prompt should include these sections, in order:

| Section | Purpose |
|---------|---------|
| Context | Repo, path, current state, branching rule |
| Task | One clear objective |
| Steps | Ordered commands/actions |
| Content/Spec | Exact content or reference |
| Commit & Push | How to record and publish |
| Stop & Report | What to output and when to halt |
| Constraints | What NOT to do |

## 3. Template

```
You are working on SystemHealer (React + Spring Boot Windows utility).
Repo: https://github.com/Kingrosez/SystemHealer
Local path: D:\Windows app\SystemHealer
Current state: <branch, what is already done>
Branching: GitHub Flow.

WORKFLOW RULE FOR THIS TASK:
- <branch to use>
- Fill only <file>
- Commit with a separate commit
- Do NOT create a PR
- Do NOT merge into main
- Push the branch after the commit

YOUR TASK:

1. SYNC AND SWITCH TO THE BRANCH
   <git commands>

2. WRITE <file> with EXACTLY the content below.
   Note: indented blocks convert to fenced code blocks in the file.

   ---BEGIN FILE CONTENT---
   <content>
   ---END FILE CONTENT---

3. COMMIT AND PUSH
   <git commands>

4. STOP AND REPORT
   - Commit hash, branch pushed confirmation
   - Files modified
   - Do NOT create a PR
   - Wait for next instruction

CONSTRAINTS:
- Do not modify other files.
- Do not push to main.
- Do not create a PR.
- Use LF line endings and UTF-8.
- Preserve tables/code blocks exactly.
```

## 4. Required Elements

Every prompt must specify:

- **One task** — not multiple unrelated objectives.
- **Exact branch** — reuse or create, named per conventions.
- **Exact file(s)** — avoid "update the docs".
- **Constraints** — what not to touch, no PR, no main push.
- **Stop condition** — when to halt and report.
- **Output format** — commit hash, files, confirmation.

## 5. Writing Good Instructions

| Do | Don't |
|----|-------|
| "Fill only `docs/ai/PROMPT_STANDARDS.md`" | "Update the AI docs" |
| "Commit message: `docs(ai): add prompt standards`" | "Commit your changes" |
| "Stop and report the commit hash" | "Continue until done" |
| "Do not touch other files" | (omit constraints) |
| Provide exact content in a delimited block | "Write something about X" |

## 6. Handling Code Blocks in Prompts

Nested fenced code blocks break prompts. Use one of:

1. **Indented blocks** (4 spaces) with an instruction to convert to fences.
2. **Delimited sections** (`---BEGIN FILE CONTENT---` / `---END---`) with code
   blocks described by language, not fenced inline.

Never nest triple backticks inside a fenced prompt.

## 7. Prompt Anti-Patterns

| Anti-pattern | Problem | Fix |
|--------------|---------|-----|
| Multi-task prompt | Agent mixes scopes | One task per prompt |
| Vague scope | Agent edits extra files | Name exact files |
| No constraints | Agent pushes to main / opens PR | Always include constraints |
| No stop condition | Agent keeps going | Require stop + report |
| Nested fences | Fragmented content | Use indented blocks |
| Huge prompt | Context overflow | Split per file |
| Assuming state | Agent works on wrong branch | State current branch explicitly |

## 8. Example Prompts

### 8.1 Documentation Task

```
Fill ONLY docs/ai/PROMPT_STANDARDS.md on branch docs/fill-documentation.
Content: <delimited block>.
Commit: "docs(ai): add prompt standards".
Do not create a PR. Stop and report the commit hash.
```

### 8.2 Backend Task

```
Create feature/health-check from main.
Add GET /api/health returning {"status":"ok"}.
Add a controller test.
Commit: "feat(common): add health endpoint".
Push branch. Stop and report PR URL. Do not merge.
```

### 8.3 Frontend Task

```
On branch feature/health-check-ui, add a HealthBadge component that
calls GET /api/health via TanStack Query and shows status.
Add a component test. Commit: "feat(frontend): add health badge".
Push. Stop and report. Do not merge.
```

## 9. Reviewing Prompt Quality

Before sending a prompt, check:

- [ ] One task
- [ ] Branch specified
- [ ] Files specified
- [ ] Content or spec provided
- [ ] Constraints listed
- [ ] Stop + report required
- [ ] No nested code fences

## 10. Related Documents
- `AGENTS.md`
- `docs/ai/AI_WORKFLOW.md`
- `docs/ai/AI_CODE_REVIEW.md`
- `docs/engineering/DEVELOPMENT_WORKFLOW.md`

## 11. Status
Draft — v0.1