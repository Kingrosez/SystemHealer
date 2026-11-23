# Design System

## 1. Purpose
This document defines the design system for the SystemHealer frontend, ensuring visual consistency and usability across all components.

## 2. Color Palette

### 2.1 Primary Colors
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| --background | #ffffff | #0a0a0a | Page background |
| --foreground | #0a0a0a | #ffffff | Primary text |
| --primary | #3b82f6 | #60a5fa | Interactive elements |
| --primary-foreground | #ffffff | #0a0a0a | Primary text on primary |

### 2.2 Status Colors
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| --success | #10b981 | #34d399 | Success messages |
| --warning | #f59e0b | #fbbf24 | Warnings |
| --destructive | #ef4444 | #f87171 | Errors, destructive |
| --border | #e5e7eb | #383838 | Borders, dividers |

## 3. Typography

### 3.1 Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 3.2 Scale
| Size | px | rem | Usage |
|------|-----|-----|-------|
| h1 | 32 | 2.0 | Page titles |
| h2 | 28 | 1.75 | Section headers |
| h3 | 24 | 1.5 | Card headers |
| body | 16 | 1.0 | Body text |
| small | 14 | 0.875 | Secondary text |

### 3.3 Font Weights
- Regular: 400 (body, labels)
- Medium: 500 (sub-headers, buttons)
- Semibold: 600 (headers, important labels)

## 4. Spacing

### 4.1 Spacing Scale
```css
--spacing-0: 0;
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-3: 0.75rem;
--spacing-4: 1rem;
--spacing-5: 1.25rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-10: 2.5rem;
--spacing-12: 3rem;
--spacing-16: 4rem;
```

### 4.2 Common Patterns
- Element padding: `var(--spacing-4)`
- Component gap: `var(--spacing-6)`
- Section margin: `var(--spacing-12)`

## 5. Components

### 5.1 Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <CardContent>
    {children}
  </CardContent>
</Card>
```

### 5.2 Button
```tsx
<Button variant="default" size="default">
  <ButtonIcon>Caption</ButtonIcon>
</Button>
```

Variants:
- `default`: Primary action
- `destructive`: Destructive action (SFC, DISM, etc.)
- `outline`: Secondary action
- `ghost`: Minimal action

Sizes:
- `default`: Standard button
- `sm`: Small button
- `lg`: Large button

### 5.3 Dialog
```tsx
<Dialog>
  <DialogTrigger>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <DialogDescription>
      Are you sure you want to run System File Checker?
    </DialogDescription>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 5.4 Progress Bar
```tsx
<Progress value={progress} max={100} className="w-full" />
```

### 5.5 Table
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Operation</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Date</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.type}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell>{row.date}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 6. Layout

### 6.1 Page Structure
```tsx
<div className="flex flex-col min-h-screen">
  <header className="flex h-14 items-center border-b">
    {/* Navigation */}
  </header>
  <main className="flex-1 p-8">
    <PageHeader />
    <Section />
  </main>
  <footer className="flex h-14 items-center border-t">
    {/* Footer */}
  </footer>
</div>
```

### 6.2 Grid
- Single column on mobile
- Two columns on tablet (min-width: 768px)
- Three columns on desktop (min-width: 1024px)

## 7. Animations

### 7.1 Transitions
```css
transition: all 150ms ease-in-out;
```

### 7.2 Page Transitions
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

## 8. Iconography

### 8.1 Icon Library
- Lucide React icons
- Inline SVG for performance
- Consistent 16px base size

### 8.2 Usage
```tsx
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

<AlertCircle className="h-4 w-4 text-warning" />
```

## 9. Forms

### 9.1 Input Field
```tsx
<Input
  type="text"
  placeholder="Enter description"
  className={cn(
    "border border-input bg-background",
    focused && "ring-2 ring-ring ring-offset-2"
  )}
/>
```

### 9.2 Form Validation
- Inline error messages below fields
- Red border for invalid fields
- Clear error on focus

## 10. Toast Notifications

### 10.1 Usage
```tsx
const toast = useToast();

toast({
  title: "Operation started",
  description: "System File Checker is now running",
});

toast({
  title: "Operation failed",
  description: "See logs for details",
  variant: "destructive",
});
```

### 10.2 Position
- Top-right corner
- Auto-dismiss after 5 seconds
- Pause on hover

## 11. Accessibility

- All interactive elements must be keyboard focusable
- Use semantic HTML elements
- Provide aria-labels for icon-only buttons
- Color contrast minimum 4.5:1
- Focus indicators visible