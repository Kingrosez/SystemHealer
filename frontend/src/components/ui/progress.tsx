"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full transition-all duration-300"
        style={{ transform: `translateX(-${100 - value}%)`, width: `${value}%` }}
      >
        <div className="h-full bg-primary text-primary-foreground transition-all duration-300" />
      </div>
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };