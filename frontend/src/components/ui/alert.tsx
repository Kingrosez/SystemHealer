"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

const alertVariants = {
  default: "bg-background text-foreground border-border",
  destructive: "bg-destructive/10 border-destructive text-destructive",
  success: "bg-success/10 border-success text-success",
  warning: "bg-warning/10 border-warning text-warning",
  info: "bg-info/10 border-info text-info",
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertVariants;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        "flex items-start gap-3",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Alert.displayName = "Alert";

const AlertTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <h5
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };