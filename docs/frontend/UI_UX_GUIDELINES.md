# UI/UX Guidelines

## 1. Purpose
This document defines the user experience principles, navigation structure,
interaction patterns, and tone of voice for SystemHealer. It ensures the app feels
safe, clear, and trustworthy for non-technical and technical users alike.

## 2. UX Principles

- **Safety first**: destructive actions are always previewed and confirmed.
- **Plain language**: no jargon in the main UI. Translate technical terms.
- **Show progress**: never leave the user guessing during long operations.
- **Reversible by default**: every risky action has a rollback path.
- **Consistent patterns**: same layout, same confirmation flow, same feedback everywhere.
- **Calm, not alarming**: warnings are clear but not scary; errors are actionable.

## 3. Navigation Structure

Left sidebar with these sections (top to bottom):

| Section | Purpose |
|---------|---------|
| Dashboard | System overview, quick actions, health summary |
| Repair | System file, network, Windows Update repair |
| Uninstaller | Installed programs, deep uninstall |
| Cleaner | Junk/cache cleaning, duplicate finder |
| Updater | Outdated software scan and update |
| Recovery | Restore points, rollback, history |
| History | Past repair/cleanup/uninstall runs |
| Settings | Preferences, retention, theme |

Rules:
- Sidebar collapses to icons on narrow windows.
- Active section is highlighted.
- No nested menus deeper than two levels.

## 4. Layout Rules

- **Top bar**: app name, admin status badge, global search (future), settings icon.
- **Content area**: page title, short description, primary action, then content.
- **Log panel**: docked at the bottom for long-running operations; collapsible.
- **Max content width**: 1200px, centered on large screens.
- **Spacing**: consistent 8px grid (4/8/16/24/32).

## 5. Tone of Voice

| Do | Don't |
|----|-------|
| "System File Checker could not complete. Try running as administrator." | "CommandExecutionException: exit 1" |
| "We'll create a restore point before repairing." | "Checkpoint-Computer will be invoked." |
| "This will delete 42 files (1.2 GB)." | "Destructive operation pending." |
| "Nothing to clean here — your PC looks good!" | "0 items found." |

Rules:
- Use "you" and "we" sparingly.
- Avoid passive voice.
- Never blame the user.
- Always say what happens next.

## 6. Feedback Patterns

### 6.1 Loading States
- Skeleton loaders for lists and cards.
- Spinner for short operations (< 2 s).
- Progress bar + live log for long operations.

### 6.2 Empty States
- Friendly message + illustration (optional) + primary action.
- Example: "No outdated software found. You're up to date!"

### 6.3 Error States
- Plain-language message (from `userMessage`).
- "Retry" button.
- Link to logs (collapsible) for technical users.

### 6.4 Success States
- Toast notification for quick actions.
- Summary panel for long operations (e.g., "Repaired 3 items, 0 failed").
- Option to view details or roll back.

## 7. Confirmation Patterns

Destructive actions use a two-step flow:

1. **Preview dialog**: shows what will be affected, sizes, and a summary.
2. **Confirm button**: explicit, primary-colored, with the action verb.

Rules:
- Never auto-confirm.
- For high-risk actions (registry, recovery), require typing a word (e.g., "DELETE").
- Show a warning icon and a short risk explanation.
- Provide a "Cancel" option that is equally prominent.

## 8. Long-Running Operations

- Show a dedicated operation panel with:
  - Task name and status
  - Progress bar (if measurable)
  - Live log (auto-scroll, with pause)
  - Cancel button
- Do not block navigation entirely; allow the user to switch tabs.
- Show a persistent indicator (e.g., in the top bar) if an operation is running in the background.

## 9. Accessibility Basics

Full details in `ACCESSIBILITY.md`. Quick rules:

- All interactive elements are keyboard reachable.
- Focus states are visible.
- Color is never the only indicator (use icons + text).
- Minimum contrast ratio 4.5:1 for text.
- Respect `prefers-reduced-motion`.

## 10. Responsive Behavior

- Target minimum width: 1024px (desktop app).
- Sidebar collapses below 1280px.
- Tables become scrollable horizontally below 1024px.
- Log panel collapses below 1280px.

## 11. Theming

- Light and dark mode; default follows OS (`prefers-color-scheme`).
- Theme toggle in Settings.
- Tokens defined in `DESIGN_SYSTEM.md`.

## 12. Microcopy Guidelines

- Buttons: verb-first ("Start Repair", "Delete Files", "Create Restore Point").
- Labels: sentence case ("Restore points", not "Restore Points").
- Placeholders: helpful examples, not instructions.
- Tooltips: short, explain unfamiliar terms.

## 13. Related Documents
- `docs/frontend/DESIGN_SYSTEM.md`
- `docs/frontend/ACCESSIBILITY.md`
- `docs/api/INTEGRATION_GUIDE.md`
- `docs/security/SECURITY.md`

## 14. Status
Draft — v0.1