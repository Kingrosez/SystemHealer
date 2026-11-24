"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

// Custom Dialog implementation without Radix UI dependencies
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(open);

  React.useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open: internalOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogTrigger = ({ children }: DialogTriggerProps) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;
  const child = React.Children.only(children) as React.ReactElement<any>;
  return React.cloneElement(child, {
    onClick: () => ctx.onOpenChange(true),
  } as React.ButtonHTMLAttributes<HTMLButtonElement>);
};

const DialogClose = ({ children }: { children?: React.ReactNode }) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;
  const child = React.Children.only(children) as React.ReactElement<any>;
  return React.cloneElement(child, {
    onClick: () => ctx.onOpenChange(false),
  } as React.ButtonHTMLAttributes<HTMLButtonElement>);
};

const DialogPortal = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

interface DialogOverlayProps {
  className?: string;
  onClick?: () => void;
}

const DialogOverlay = ({ className, onClick }: DialogOverlayProps) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
      onClick={onClick}
    />
  );
};

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

const DialogContent = ({ className, children }: DialogContentProps) => {
  const ctx = React.useContext(DialogContext);

  if (!ctx || !ctx.open) return null;

  return (
    <DialogPortal>
      <DialogOverlay onClick={() => ctx.onOpenChange(false)} />
      <div
        className={cn(
          "fixed z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className
        )}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => ctx.onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </DialogPortal>
  );
};

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex justify-center gap-3 p-4",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
);

const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};