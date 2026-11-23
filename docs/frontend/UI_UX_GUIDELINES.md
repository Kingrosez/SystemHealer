# UI/UX Guidelines

## 1. Purpose
This document defines the user interface and user experience guidelines for SystemHealer.

## 2. User Personas

### 2.1 Primary User
- **Name**: Tech-Savvy User
- **Goal**: Maintain and repair their Windows system
- **Skills**: Basic to intermediate Windows knowledge
- **Context**: Personal computer, occasional maintenance needed

### 2.2 Secondary User
- **Name**: IT Professional
- **Goal**: Quick system diagnostics and repair
- **Skills**: Advanced Windows knowledge
- **Context**: Client troubleshooting, support requests

## 3. Design Principles

### 3.1 Safety First
- All destructive operations require explicit confirmation
- Restore points created before high-risk operations
- Clear indication of admin privilege requirements

### 3.2 Progressive Disclosure
- Show only essential information initially
- Advanced options hidden by default
- Detailed logs accessible but not intrusive

### 3.3 Visual Hierarchy
- Primary actions prominent (destructive, colored)
- Secondary actions subdued (outline, gray)
- Status clearly indicated with color and icon

## 4. User Flows

### 4.1 Run SFC Scan
```
Dashboard → [Run SFC] → Preview Dialog → [Create Restore Point] → Progress → Results
```

### 4.2 View History
```
Dashboard → [History Tab] → List (paginated) → [Click Item] → Detail View
```

### 4.3 System Cleanup
```
Tools → [Cleanup] → Scan for Issues → Preview List → [Clean Files] → Confirm
```

## 5. Interaction Patterns

### 5.1 Two-Step Pattern for Destructive Actions
1. Preview step: Show what will be affected
2. Confirmation step: Require explicit user action

```tsx
function DestructiveAction() {
  const [preview, setPreview] = useState(null);

  const handlePreview = async () => {
    const data = await fetchPreview();
    setPreview(data);
  };

  return (
    <Button onClick={handlePreview}>Action</Button>
  );
}
```

### 5.2 Status Indicators
| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| `PENDING` | gray | Clock | Waiting for user |
| `IN_PROGRESS` | blue | Loader | Running |
| `COMPLETED` | green | Check | Success |
| `FAILED` | red | X | Error |
| `CANCELLED` | yellow | Alert | User stopped |

### 5.3 Error Recovery
- Provide clear next steps
- Link to documentation if helpful
- Suggest alternative actions

## 6. Information Architecture

### 6.1 Navigation
```
[Dashboard] [History] [Tools] [Settings]
```

### 6.2 Dashboard Sections
- Quick Actions (SFC, DISM, Network)
- Recent History (last 5 operations)
- System Status
- Restore Point Status

### 6.3 Tools Section
- System File Checker
- DISM Repair
- Network Reset
- Temporary Files Cleanup
- Duplicate File Finder

## 7. Content Guidelines

### 7.1 Error Messages
- Clear title: "Permission Denied"
- Helpful description: "Run SystemHealer as administrator"
- Action: "Restart as Admin" button
- No technical jargon

### 7.2 Success Messages
- Brief confirmation: "Scan completed"
- Key result: "No integrity violations found"
- Next step: "View full report"

### 7.3 Status Messages
- Real-time during operations
- Progress percentage
- Current step description
- Allow user to cancel

## 8. Empty States

### 8.1 No History
```tsx
<div className="text-center py-12">
  <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-semibold">No repair history</h3>
  <p className="text-muted-foreground">
    Run your first system repair to see history here.
  </p>
</div>
```

### 8.2 No Search Results
```tsx
<div className="text-center py-12">
  <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-semibold">No results found</h3>
  <p className="text-muted-foreground">
    Try adjusting your search terms.
  </p>
</div>
```

## 9. Modals & Dialogs

### 9.1 Confirmation Dialog
- Title: Action name
- Description: What will happen
- Risk level: Clear indication
- Buttons: Cancel (secondary), Confirm (primary)

### 9.2 Form Dialog
- Title at top
- Description below title
- Form fields in content area
- Actions in footer

## 10. Data Display

### 10.1 Tables
- Sortable columns
- Pagination (50 items per page)
- Select rows for bulk actions
- Show item count

### 10.2 Cards
- Consistent padding
- Clear header with title
- Visual separation of content
- Action buttons at bottom

### 10.3 Lists
- Item title + subtitle
- Status indicator
- Timestamp
- Expand for details

## 11. Responsive Design

### 11.1 Breakpoints
| Width | Layout |
|-------|--------|
| < 768px | Single column, mobile nav |
| 768-1024px | Two columns, tablet nav |
| > 1024px | Three columns, full nav |

### 11.2 Mobile Considerations
- Touch targets: 44px minimum
- Gestures: Swipe to delete (history)
- Overflow menus for actions
- Keyboard shortcuts documented

## 12. Visual Design

### 12.1 Shadows
- Level 0: None
- Level 1: `shadow-sm`
- Level 2: `shadow-md`
- Level 3: `shadow-lg`

### 12.2 Rounded Corners
- Cards: `rounded-lg`
- Buttons: `rounded-md`
- Inputs: `rounded-md`

### 12.3 Borders
- Standard: `border` (1px)
- Subtle: `border-dashed`
- Accent: Colored border on hover

## 13. Performance UX

### 13.1 Loading States
- Skeleton screens for data
- Progress bars for operations
- Spinners for indeterminate waits
- Optimistic updates where possible

### 13.2 Feedback Timing
- Instant: < 100ms (no feedback)
- Noticeable: 100ms-1s (subtle indicator)
- Interactive: 1s-10s (spinner + progress)
- Long: > 10s (cancel option, estimated time)

## 14. Accessibility Checklist

- [ ] All interactive elements keyboard focusable
- [ ] Color is not the only indicator
- [ ] Alt text for images (none in v1)
- [ ] Focus order follows visual order
- [ ] Labels associated with inputs
- [ ] Sufficient color contrast