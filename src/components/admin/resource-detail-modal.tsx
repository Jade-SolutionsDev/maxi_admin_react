import type { ReactNode } from "react";

import { FormInputIcon } from "@/components/admin/form-input-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ResourceDetailModalProps = {
  /** Route-driven modals omit this (always open while routed). */
  open?: boolean;
  onClose: () => void;

  /** Header medallion icon. */
  icon: ReactNode;
  /** Already-translated header title and subtitle. */
  title: string;
  subtitle?: string;

  /** Shows the skeleton instead of the body. */
  isLoading?: boolean;
  /** Footer actions (Edit / Delete / …). Omitted → no footer. */
  footer?: ReactNode;

  children: ReactNode;
};

/**
 * Read-only counterpart of `ResourceFormModal`. It deliberately reuses the same
 * chrome — width, header medallion + blobs, scroll chain, footer — so that
 * moving from a detail view to its edit form doesn't resize or reflow the
 * dialog. Pair it with `DetailField` (which mirrors a form field's geometry)
 * and `FormSection` (the same section headers the forms use).
 */
export function ResourceDetailModal({
  open = true,
  onClose,
  icon,
  title,
  subtitle,
  isLoading,
  footer,
  children,
}: ResourceDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex flex-col w-full sm:max-w-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="relative shrink-0 overflow-hidden border-b px-6 py-5 text-left">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-primary opacity-10" />
            <div className="absolute -bottom-20 -left-16 h-32 w-32 rounded-full bg-primary/70 opacity-10" />
          </div>
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </span>
            <div className="space-y-1">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              {subtitle && (
                <DialogDescription className="text-sm text-muted-foreground">
                  {subtitle}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {isLoading ? <DetailSkeleton /> : children}
        </div>

        {footer && (
          <div className="flex shrink-0 flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:shrink-0 sm:flex-row">
              {footer}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * One read-only value, laid out exactly like a form field: label on top, then a
 * control-sized box with the same border, radius and (optional) tinted icon
 * tile. The muted background is the only thing marking it read-only, so a
 * detail → edit switch reads as the values becoming editable in place.
 */
export function DetailField({
  label,
  icon,
  className,
  children,
}: {
  label: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Falsy renders an em dash. */
  children?: ReactNode;
}) {
  const isEmpty =
    children === null || children === undefined || children === "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="relative">
        {icon && <FormInputIcon>{icon}</FormInputIcon>}
        <div
          className={cn(
            "flex min-h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-1.5 text-sm",
            isEmpty ? "text-muted-foreground" : "text-foreground",
            icon && "pl-12",
          )}
        >
          <span className="wrap-break-word">{isEmpty ? "—" : children}</span>
        </div>
      </div>
    </div>
  );
}

/** Multi-line value (descriptions): same box, free height. */
export function DetailTextBlock({
  label,
  icon,
  children,
}: {
  label: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  const isEmpty =
    children === null || children === undefined || children === "";

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="relative">
        {icon && (
          <FormInputIcon className="inset-y-px items-start pt-2.5">
            {icon}
          </FormInputIcon>
        )}
        <div
          className={cn(
            "min-h-16 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm whitespace-pre-wrap",
            isEmpty ? "text-muted-foreground" : "text-foreground",
            icon && "pl-12",
          )}
        >
          {isEmpty ? "—" : children}
        </div>
      </div>
    </div>
  );
}

/** Image preview card, matching the form's image upload cards. */
export function DetailImageCard({
  label,
  url,
  emptyIcon,
}: {
  label: ReactNode;
  url?: string | null;
  emptyIcon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="space-y-1.5">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          {label}
        </span>
        <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
          {url ? (
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground [&_svg]:size-6">
              {emptyIcon}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}
