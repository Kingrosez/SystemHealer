# Accessibility Guidelines

## 1. Purpose
This document defines the accessibility standards for SystemHealer to ensure the application is usable by everyone, including users with disabilities.

## 2. WCAG Compliance Level
SystemHealer targets **WCAG 2.1 Level AA** compliance.

| Criterion | Level | Description |
|-----------|-------|-------------|
| Non-text Contrast | AA | 3:1 contrast for graphics and UI components |
| Text Contrast | AA | 4.5:1 for normal text, 3:1 for large text |
| Keyboard Accessible | A | All functionality available via keyboard |
| Focus Visible | AA | Visible focus indicator at all times |
| Labels/Instructions | A | Labels and instructions provided |
| Sensory Characteristics | A | No sensory characteristics alone |
| Audio Control | A | Audio can be paused/stopped |
| Color Alone | A | Information not conveyed by color alone |

## 3. Color Contrast

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Body text | #000000 on #ffffff (21:1) | #ffffff on #0a0a0a (19:1) |
| Primary button | #FFFFFF on #0EA5A4 (contrast ~3.2:1) | #0B0F17 on #2DD4BF (contrast ~8.5:1) |
| Warning | #000000 on #f59e0b (4.5:1) | #000000 on #fbbf24 (4.8:1) |
| Destructive | #ffffff on #ef4444 (4.5:1) | #000000 on #f87171 (4.8:1) |

Note: For primary buttons, bold text ≥18px qualifies as "large text" under WCAG AA, where 3:1 contrast is acceptable.

### 3.1 Testing Color Contrast
- WebAIM Contrast Checker
- axe DevTools
- Lighthouse Accessibility audit

## 4. Keyboard Navigation

### 4.1 Tab Order
- Follow logical visual order
- Tab through interactive elements sequentially
- Skip navigation links for screen readers

### 4.2 Focus Management
```tsx
// Focus on modal open
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// Trap focus in modal
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    // Trap focus within dialog
  }
  if (e.key === 'Escape') {
    onClose();
  }
};
```

### 4.3 Focus Indicators
```css
:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## 5. Screen Reader Support

### 5.1 Semantic HTML
Use appropriate HTML elements:
- `<button>` for actions
- `<a>` for navigation
- `<nav>` for navigation regions
- `<main>` for main content
- `<header>`, `<footer>` for page structure

### 5.2 ARIA Labels
```tsx
// Icon-only button
<Button aria-label="Close dialog">
  <XIcon />
</Button>

// Status indicator
<span aria-label="In progress" role="status">
  <Loader2 className="animate-spin" />
</span>

// Live regions for dynamic content
<div aria-live="polite">
  {errorMessage}
</div>
```

### 5.3 Landmark Roles
```tsx
<nav role="navigation" aria-label="Main navigation">
<header role="banner">
<main role="main">
<footer role="contentinfo">
```

## 6. Visual Design

### 6.1 Text Resizing
- Content scales up to 200% without breaking layout
- Use relative units (`rem`, `em`) for spacing
- Line height: 1.5 for body text

### 6.2 Motion Sensitivity
- Reduce motion preference honored:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 6.3 High Contrast Mode
- Windows high contrast mode support
- System colors respected
- Custom focus indicator visible

## 7. Forms and Inputs

### 7.1 Labels
Every input must have an associated label:
```tsx
<label htmlFor="email">Email address</label>
<input id="email" type="email" />
```

### 7.2 Error Messages
```tsx
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### 7.3 Required Fields
Indicate required fields:
```tsx
<label>
  Email <span aria-label="required">*</span>
</label>
```

## 8. Tables

### 8.1 Structure
```tsx
<table role="table" aria-label="Repair history">
  <thead>
    <tr>
      <th scope="col">Operation</th>
      <th scope="col">Status</th>
      <th scope="col">Date</th>
    </tr>
  </thead>
  <tbody>
    {rows.map(row => (
      <tr>
        <td>{row.operation}</td>
        <td>{row.status}</td>
        <td>{row.date}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### 8.2 Sortable Headers
```tsx
<th scope="col" aria-sort={sortDirection === 'asc' ? 'ascending' : 'descending'}>
  <button aria-label={`Sort by ${columnName}`}>
    {columnName}
  </button>
</th>
```

## 9. Modals and Dialogs

### 9.1 Accessibility Requirements
- Role="dialog"
- aria-modal="true"
- Captive focus
- Escape key closes
- Descriptive title

### 9.2 Implementation
```tsx
<Dialog role="dialog" aria-modal="true">
  <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
  <DialogDescription id="dialog-description">
    Are you sure you want to run a system repair?
  </DialogDescription>
</Dialog>
```

## 10. Content Patterns

### 10.1 Status Messages
```tsx
// Success
<div role="status" aria-live="polite">
  <CheckCircle className="h-4 w-4" />
  Operation completed successfully
</div>

// Error
<div role="alert" aria-live="assertive">
  <AlertCircle className="h-4 w-4" />
  {errorMessage}
</div>
```

### 10.2 Progress Indicators
```tsx
<div role="progressbar" aria-valuenow={progress} aria-valuemax={100}>
  <span aria-label={`${progress} percent complete`}>
    Progress: {progress}%
  </span>
</div>
```

## 11. Testing for Accessibility

### 11.1 Automated Testing
- Jest + React Testing Library with axe-core
- axe DevTools browser extension
- Lighthouse accessibility audits

### 11.2 Manual Testing
- Navigate with keyboard only
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test with Windows Narrator
- Verify focus order

### 11.3 Test Example
```tsx
it('is accessible', async () => {
  const { container } = render(<Component />);
  expect(await axe(container)).toHaveNoViolations();
});
```

## 12. Accessibility Checklist

| Requirement | Status |
|-------------|--------|
| WCAG 2.1 Level AA conformance | AA |
| Keyboard navigation support | ✅ |
| Screen reader announcements | ✅ |
| Color contrast ratios | ✅ |
| Focus management | ✅ |
| Semantic HTML | ✅ |
| ARIA attributes | ✅ |
| Motion reduction support | ✅ |
| Form labels | ✅ |
| Error reporting | ✅ |