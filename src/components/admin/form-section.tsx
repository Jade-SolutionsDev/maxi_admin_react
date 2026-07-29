import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Titled group of form fields: optional leading icon, a title and an optional
 * subtitle, followed by the fields. Titles are passed already translated, the
 * same way every call site in this app handles labels.
 */
export function FormSection({
  icon,
  title,
  subtitle,
  className,
  children,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start gap-2">
        {icon && (
          <span className="mt-0.5 text-primary [&_svg]:size-4">{icon}</span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
