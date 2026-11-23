# UI/UX Brief

## 1. Purpose
This document is the design brief for SystemHealer's user interface. It defines
the screen inventory, layout structure, key flows, component mapping, and Figma
setup conventions. Designers use it to build the Figma file; the frontend agent
uses it to implement the React UI.

## 2. Design Principles (From UI_UX_GUIDELINES.md)

- **Safety first**: destructive actions previewed and confirmed.
- **Plain language**: no jargon in the main UI.
- **Show progress**: never leave the user guessing.
- **Reversible by default**: rollback path for risky actions.
- **Consistent patterns**: same layout, same confirmation flow everywhere.
- **Calm, not alarming**: warnings clear but not scary.

## 3. App Shell

### 3.1 Structure

```
┌────────────────────────────────────────────────────────┐
│ TopBar: [logo] SystemHealer    [Admin badge] [⚙]       │
├──────────┬─────────────────────────────────────────────┤
│ Sidebar  │  PageHeader (title + description + action)  │
│          │  ─────────────────────────────────────────  │
│ Dashboard│                                             │
│ Repair   │  Content area (cards, tables, forms)        │
│ Uninstall│                                             │
│ Cleaner  │                                             │
│ Updater  │                                             │
│ Recovery │                                             │
│ History  │                                             │
│ Settings │                                             │
│          ├─────────────────────────────────────────────┤
│          │  LogPanel (collapsible, docked bottom)      │
└──────────┴─────────────────────────────────────────────┘
```

### 3.2 Dimensions

| Element | Width | Behavior |
|---------|-------|----------|
| Sidebar (expanded) | 240px | Default on screens ≥1280px |
| Sidebar (collapsed) | 64px | Below 1280px; icons only |
| Top bar | Full width, 56px tall | Sticky |
| Content area | Max 1200px centered | Scrolls |
| Log panel | Full width, 200px tall | Collapsible, docked bottom |

### 3.3 Top Bar Contents

- App logo + name (left)
- Admin status badge: "Administrator" (green) or "Standard User" (amber)
- Global search (future, disabled placeholder)
- Settings icon (right)

## 4. Screen Inventory

### 4.1 Pages (8)

| # | Screen | Priority | Purpose |
|---|--------|----------|---------|
| 1 | Dashboard | MVP | System overview, quick actions, health summary |
| 2 | Repair | MVP | Run SFC, DISM, network reset, Windows Update repair |
| 3 | Uninstaller | MVP | List programs, uninstall, remove leftovers |
| 4 | Cleaner | MVP | Junk/cache cleaner + duplicate finder (two tabs) |
| 5 | Updater | Should | Scan outdated software, bulk update |
| 6 | Recovery | MVP | Restore points, rollback, history |
| 7 | History | Should | Past repair/cleanup/uninstall/update runs |
| 8 | Settings | MVP | Preferences, retention, theme |

### 4.2 Modals & Dialogs (7)

| # | Dialog | Trigger | Components |
|---|--------|---------|------------|
| D1 | Confirm Repair | Click "Start Repair" | Title, summary, risk note, Cancel + Confirm |
| D2 | Restore Point Warning | Repair start (if creation fails) | Warning icon, explanation, Continue + Cancel |
| D3 | Uninstall Confirmation | Click uninstall on a program | Program info, warning, Cancel + Uninstall |
| D4 | Leftovers Preview | After uninstall completes | File/folder/registry list with sizes, Cancel + Delete |
| D5 | Cleanup Preview | Click "Clean" on cleaner tab | Category summary, total size, Cancel + Clean |
| D6 | Duplicate Deletion | Select duplicates and click delete | File list, "keep at least one" note, Cancel + Delete |
| D7 | High-Risk Confirmation | Recovery, registry cleanup | Type "DELETE" to enable Confirm |

### 4.3 Empty / Error / Loading States (per page)

Every data-driven page must have designs for:
- **Loading**: skeleton loader (lists, cards)
- **Empty**: friendly message + illustration + primary action
- **Error**: plain-language message + Retry button + optional "View logs"
- **Success**: normal render (no special state)

## 5. Key Flows (Wireframe Sequence)

### 5.1 One-Click Repair

```
Dashboard
  → Click "Repair My PC" (primary button)
  → D1 Confirm Repair (preview of actions + restore point note)
  → [Progress] Repair page with operation panel + live log
  → Complete: summary card (repaired / failed / skipped)
  → Options: "View details" | "Roll back" (if restore point exists)
```

### 5.2 Deep Uninstall

```
Uninstaller
  → Programs table (search + filter)
  → Click row → D3 Uninstall Confirmation
  → Standard uninstaller runs (progress in log panel)
  → D4 Leftovers Preview (files + registry keys + sizes)
  → Confirm → delete leftovers (to Recycle Bin by default)
  → Summary toast
```

### 5.3 Safe Cleanup

```
Cleaner tab "Junk"
  → Click "Scan" → progress
  → Results: category cards (temp, logs, cache, recycle bin) with sizes
  → Select categories → D5 Cleanup Preview
  → Confirm → delete → summary ("Freed 1.2 GB")
```

### 5.4 Duplicate Finder

```
Cleaner tab "Duplicates"
  → Select scan root(s) → Click "Scan"
  → Progress via SSE
  → Results: duplicate groups table (hash, size, file count)
  → Expand group → select files to delete (at least one retained)
  → D6 Duplicate Deletion → confirm → delete → summary
```

### 5.5 Recovery

```
Recovery
  → List restore points (description, date, sequence)
  → Click "Restore" → D7 High-Risk Confirmation (type DELETE)
  → System restore runs (app may exit)
  → On return: status message
```

## 6. Component Mapping (shadcn/ui)

| UI Element | shadcn Component | Notes |
|-----------|------------------|-------|
| Primary action | `Button variant="default"` | Teal; one per view |
| Destructive action | `Button variant="destructive"` | Red; requires confirmation |
| Secondary action | `Button variant="secondary"` | |
| Icon button | `Button variant="ghost" size="icon"` | Must have `aria-label` |
| Status badge | `Badge` | Variants: success, destructive, warning, outline |
| Programs table | `Table` | Virtualize > 100 rows |
| History table | `Table` | Paginated, 50/page |
| Repair options | `Card` + `Checkbox` | Multi-select |
| Cleanup categories | `Card` grid | Toggle per category |
| Duplicate groups | `Accordion` or expandable `Table` | |
| Restore points | `Table` or `Card` list | |
| Settings | `Switch`, `Input`, `Select` | |
| Confirm dialogs | `AlertDialog` | Preview + confirm |
| High-risk dialogs | `Dialog` with text input | Type-to-confirm |
| Progress | `Progress` | Determinate where possible |
| Live log | Custom `LogPanel` | Monospace, auto-scroll, pause |
| Toasts | `Sonner` | Success/info only; errors use `Alert` |
| Loading | `Skeleton` | Lists, cards |
| Empty state | Custom component | Illustration + message + action |

## 7. Layout Per Screen

### 7.1 Dashboard
- Hero: system health summary card (green/amber/red indicator)
- Quick action cards (4): Repair, Clean, Uninstall, Update — each with icon, title, short description, "Start" button
- Recent activity: last 5 operations (table or list)
- System info card: OS, CPU, RAM, admin status, BitLocker

### 7.2 Repair
- PageHeader: "Repair" + description
- Card: "What would you like to repair?"
  - Checkboxes: System Files (SFC), System Image (DISM), Network, Windows Update
- Toggle: "Create restore point before repair" (default on)
- Primary button: "Start Repair"
- Operation panel appears below when running: task name, progress, live log, Cancel
- After completion: results summary card (actions run, success/fail, link to History)

### 7.3 Uninstaller
- PageHeader: "Uninstall Programs"
- Search bar + filter dropdown (All / Recently installed / By publisher)
- Table: Name, Publisher, Version, Size, Install Date, Actions (Uninstall)
- Leftovers dialog after uninstall

### 7.4 Cleaner (two tabs)
- Tab 1 "Junk & Cache": category cards (temp, logs, cache, recycle bin) with sizes, "Scan" button, "Clean Selected"
- Tab 2 "Duplicates": scan root selector, "Scan" button, results table grouped by hash

### 7.5 Updater
- PageHeader: "Software Updates"
- "Scan for Updates" button
- Table: Name, Current Version, Available Version, Action (Update)
- "Update All" button (with restore-point note)

### 7.6 Recovery
- PageHeader: "Recovery"
- Card: "Create Restore Point" (description input + button)
- Table: existing restore points (description, date, action)
- Warning banner if BitLocker is active

### 7.7 History
- PageHeader: "History"
- Filter: type (repair/cleanup/uninstall/update) + status
- Paginated table: timestamp, type, status, summary, actions (view details)

### 7.8 Settings
- Sections: General (theme), Cleanup (retention days, default scan roots), Safety (restore point default), About (version)
- Save button at bottom

## 8. Figma File Setup

### 8.1 Page Structure

```
📄 00 — Cover
📄 01 — Design Tokens (imported from DESIGN_SYSTEM.md)
📄 02 — Components (buttons, badges, tables, dialogs)
📄 03 — App Shell (sidebar, topbar, log panel)
📄 04 — Pages (8 screens, desktop 1440px)
📄 05 — Dialogs (7 modals)
📄 06 — States (empty, error, loading per page)
📄 07 — Flows (wireframe flows from section 5)
📄 08 — Mobile/tablet (not in v1 — reserved)
```

### 8.2 Frame Naming Convention

```
Page / Desktop / 1440 — Dashboard
Page / Desktop / 1440 — Repair
Page / Desktop / 1440 — Uninstaller
...
Dialog / Confirm Repair
Dialog / Leftovers Preview
...
State / Empty / Cleaner
State / Error / Repair
...
```

### 8.3 Breakpoints

| Breakpoint | Width | Notes |
|-----------|-------|-------|
| Desktop | 1440px | Primary design target |
| Laptop | 1280px | Sidebar collapses to icons |
| Minimum | 1024px | Tables scroll horizontally |

### 8.4 Theme

Design both **light** and **dark** for every screen. Tokens from
`DESIGN_SYSTEM.md` §2.1 (teal primary `#0EA5A4` light / `#2DD4BF` dark).

## 9. Design Tokens Reference (from DESIGN_SYSTEM.md)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `#FFFFFF` | `#0B0F17` | Page background |
| `--foreground` | `#0F172A` | `#E5E7EB` | Primary text |
| `--primary` | `#0EA5A4` | `#2DD4BF` | Primary actions |
| `--destructive` | `#DC2626` | `#F87171` | Dangerous actions |
| `--success` | `#16A34A` | `#4ADE80` | Success states |
| `--warning` | `#D97706` | `#FBBF24` | Warnings |
| `--border` | `#E2E8F0` | `#1F2937` | Dividers |

Typography: `text-xs` through `text-3xl` per `DESIGN_SYSTEM.md` §2.2.
Spacing: 8px grid (`0, 4, 8, 12, 16, 24, 32, 40, 48, 64`).

## 10. Accessibility Requirements (per ACCESSIBILITY.md)

- All screens designed with keyboard navigation in mind.
- Focus states visible.
- Color never the only indicator (use icons + text).
- Contrast 4.5:1 for text, 3:1 for UI components.
- Design for text scaling to 200%.

## 11. Handoff Checklist (Figma → React)

Before implementation begins, confirm:

- [ ] All 8 pages designed in light + dark
- [ ] All 7 dialogs designed
- [ ] Empty, error, loading states for every data page
- [ ] Flows from §5 depicted as wireframe sequences
- [ ] Design tokens match `DESIGN_SYSTEM.md`
- [ ] Components mapped to shadcn/ui equivalents
- [ ] Accessibility review passed
- [ ] Figma file shared with frontend agent (link in README or here)

## 12. Related Documents
- `docs/frontend/UI_UX_GUIDELINES.md`
- `docs/frontend/DESIGN_SYSTEM.md`
- `docs/frontend/ACCESSIBILITY.md`
- `PRD.md`
- `docs/api/API_CONTRACT.md`

## 13. Status
Draft — v0.1