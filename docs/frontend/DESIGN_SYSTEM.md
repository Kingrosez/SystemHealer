# Design System

## 1. Purpose
This document defines the visual language of SystemHealer: color tokens, typography, spacing, component inventory, and styling conventions. It is the reference for all frontend work and is implemented with Tailwind CSS + shadcn/ui.

## 2. Design Tokens

### 2.1 Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `#FFFFFF` | `#0B0F17` | Page background |
| `--foreground` | `#0F172A` | `#E5E7EB` | Primary text |
| `--muted` | `#F1F5F9` | `#1E293B` | Secondary background |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Secondary text |
| `--primary` | `#0EA5A4` | `#2DD4BF` | Primary actions (teal) |
| `--primary-foreground` | `#FFFFFF` | `#0B0F17` | Text on primary |
| `--secondary` | `#E2E8F0` | `#1E293B` | Secondary actions |
| `--destructive` | `#DC2626` | `#F87171` | Dangerous actions |
| `--destructive-foreground` | `#FFFFFF` | `#0B0F17` | Text on destructive |
| `--success` | `#16A34A` | `#4ADE80` | Success states |
| `--warning` | `#D97706` | `#FBBF24` | Warning states |
| `--border` | `#E2E8F0` | `#1F2937` | Borders and dividers |
| `--ring` | `#0EA5A4` | `#2DD4BF` | Focus rings |

Rationale: teal primary conveys "healing/medical" trust; red reserved for destructive actions only; green for success; amber for warnings.

### 2.2 Typography

| Token | Size | Line height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400 | Helper text, badges |
| `text-sm` | 14px | 20px | 400 | Body, table cells |
| `text-base` | 16px | 24px | 400 | Default body |
| `text-lg` | 18px | 28px | 500 | Section headers |
| `text-xl` | 20px | 28px | 600 | Page subtitles |
| `text-2xl` | 24px | 32px | 600 | Page titles |
| `text-3xl` | 30px | 36px | 700 | Dashboard hero |

Font family: system UI stack (`ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`). Mono: `ui-monospace, SFMono-Regular, Menlo, monospace` for logs and code.

### 2.3 Spacing

8px base grid: `0, 4, 8, 12, 16, 24, 32, 40, 48, 64` (Tailwind `space-*`).

Rules:
- Section spacing: 24–32px.
- Card padding: 16–24px.
- Inline gaps: 8–12px.

### 2.4 Radius & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Inputs, badges |
| `--radius-md` | 10px | Buttons, cards |
| `--radius-lg` | 14px | Modals, panels |

Shadows (Tailwind):
- `shadow-sm`: cards
- `shadow-md`: dropdowns
- `shadow-lg`: modals

## 3. Component Inventory (shadcn/ui)

| Component | Source | Usage |
|-----------|--------|-------|
| Button | shadcn | Primary, secondary, destructive, ghost variants |
| Input / Textarea | shadcn | Forms |
| Select | shadcn | Dropdowns |
| Checkbox / Radio | shadcn | Lists, options |
| Switch | shadcn | Settings toggles |
| Dialog / AlertDialog | shadcn | Confirmations, previews |
| Sheet | shadcn | Side panels |
| Tabs | shadcn | Section switching within a page |
| Table | shadcn | Program lists, history |
| Card | shadcn | Dashboard widgets |
| Badge | shadcn | Status indicators |
| Toast / Sonner | shadcn | Quick feedback |
| Progress | shadcn | Long operations |
| Skeleton | shadcn | Loading states |
| Tooltip | shadcn | Hover hints |
| Accordion | shadcn | Log panels, advanced sections |

## 4. Component Usage Rules

### 4.1 Buttons
- One primary button per view.
- Destructive buttons use `variant="destructive"` and require confirmation.
- Icon-only buttons must have `aria-label`.

```tsx
<Button variant="default">Start Repair</Button>
<Button variant="destructive">Delete Files</Button>
<Button variant="ghost" aria-label="Refresh">…</Button>
```

### 4.2 Status Badges

| Status | Variant | Example |
|--------|---------|---------|
| Running | `secondary` + spinner | Repairing… |
| Success | `success` | Completed |
| Failed | `destructive` | Failed |
| Warning | `warning` | Restore point skipped |
| Info | `outline` | Update available |

### 4.3 Tables
- Sticky header.
- Zebra striping via `even:bg-muted/40`.
- Row actions on hover (edit/delete) with tooltips.
- Virtualize when > 100 rows.

### 4.4 Dialogs
- Preview dialogs: title, summary, item list, Cancel + Confirm.
- High-risk dialogs: require typing a word to enable Confirm.
- Focus trap; Esc closes (except during an active operation).

### 4.5 Log Panel
- Monospace font, `text-sm`.
- Color-coded levels: INFO default, WARN amber, ERROR red, DEBUG muted.
- Auto-scroll with pause toggle.
- Cap rendered lines (e.g., 5,000).

## 5. Layout Components

| Component | Responsibility |
|-----------|----------------|
| `AppShell` | Sidebar + top bar + content area |
| `Sidebar` | Navigation; collapsible |
| `TopBar` | App name, admin badge, settings |
| `PageHeader` | Title, description, primary action |
| `ContentCard` | White card with padding and border |
| `LogPanel` | Docked log viewer |
| `EmptyState` | Illustration + message + action |
| `ErrorPanel` | Message + retry |

## 6. Tailwind Conventions

- Use utility classes only; no custom CSS files except `index.css` tokens.
- Use the `cn()` helper for conditional classes.
- Avoid arbitrary values (`[13px]`) unless unavoidable.
- Prefer semantic tokens (`bg-background`, `text-foreground`) over raw colors.

```tsx
import { cn } from '@/lib/utils';

<div className={cn('rounded-md border p-4', isActive && 'ring-2 ring-primary')} />
```

## 7. Icons

- Library: `lucide-react`.
- Sizes: 16px inline, 20px buttons, 24px headers.
- Icons never replace text labels in primary actions.

## 8. Theming Implementation

- CSS variables in `index.css` for light/dark.
- Tailwind `darkMode: 'class'`.
- Theme toggle in Settings; persists to `localStorage`.
- Default: follow OS (`prefers-color-scheme`).

## 9. Do / Don't

| Do | Don't |
|----|-------|
| Use teal for primary actions | Use red for non-destructive actions |
| Show plain-language status | Show raw exit codes |
| Use skeleton loaders | Use blank screens during loading |
| Keep one primary action per view | Compete multiple primary buttons |

## 10. Related Documents
- `docs/frontend/UI_UX_GUIDELINES.md`
- `docs/frontend/ACCESSIBILITY.md`
- `docs/architecture/TECH_STACK.md`

## 11. Status
Draft — v0.1