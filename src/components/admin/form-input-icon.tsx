import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Tinted leading tile for a form control, used by the `icon` prop of
 * TextInput / NumberInput / SelectInput / AutocompleteInput.
 *
 * It is an absolutely positioned overlay inset by the control's 1px border
 * (`inset-y-px left-px`) rather than a flex sibling, so the control keeps its
 * own border, radius, focus ring and `aria-invalid` styling untouched.
 * `pointer-events-none` lets clicks fall through to the control beneath — which
 * is what keeps a SelectTrigger / PopoverTrigger clickable across its full
 * width. The control pairs this with `pl-12`.
 *
 * Lives in its own file (not form.tsx) so re-installing the shadcn registry's
 * form component can't quietly delete it.
 */
export function FormInputIcon({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-px left-px flex w-9 items-center justify-center",
        "rounded-l-md bg-primary/10 text-primary [&_svg]:size-4",
        className,
      )}
    >
      {children}
    </span>
  );
}
