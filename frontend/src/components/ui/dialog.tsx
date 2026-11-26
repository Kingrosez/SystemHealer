"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

// Custom Dialog implementation without Radix UI dependencies
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  const titleId = React.useId();
  const descriptionId = React.useId();

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange, titleId, descriptionId }}>
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
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-dialog-overlay-in",
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
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const open = Boolean(ctx?.open);

  React.useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.offsetParent !== null
      );

    const firstFocusable = getFocusable()[0] ?? dialog;
    firstFocusable.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!ctx || !ctx.open) return null;

  return (
    <DialogPortal>
      <DialogOverlay onClick={() => ctx.onOpenChange(false)} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ctx.titleId}
        aria-describedby={ctx.descriptionId}
        tabIndex={-1}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg animate-dialog-content-in focus:outline-none",
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
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  const ctx = React.useContext(DialogContext);
  return (
    <h2
      id={ctx?.titleId}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
};

const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  const ctx = React.useContext(DialogContext);
  return (
    <p
      id={ctx?.descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
};

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