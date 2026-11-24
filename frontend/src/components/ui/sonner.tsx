"use client";

import { Toaster as SonnerToaster } from "sonner";
import { cn } from "@/lib/cn";

export interface ToasterProps {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function Toaster({ className, position = "top-right" }: ToasterProps) {
  return (
    <SonnerToaster
      className={cn("z-50", className)}
      toastOptions={{
        className: "toast",
        style: {
          background: "var(--color-background)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
        },
      }}
      position={position}
    />
  );
}