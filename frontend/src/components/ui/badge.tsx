"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

const badgeVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90",
  outline: "text-foreground border border-border bg-background hover:bg-accent/50 dark:hover:bg-accent/50",
  success: "bg-success text-success-foreground hover:bg-success/90 dark:bg-success dark:text-success-foreground dark:hover:bg-success/90",
  warning: "bg-warning text-warning-foreground hover:bg-warning/90 dark:bg-warning dark:text-warning-foreground dark:hover:bg-warning/90",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };