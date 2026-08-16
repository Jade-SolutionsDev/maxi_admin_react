import type { InputProps } from "ra-core";
import { FieldTitle, useInput, useResourceContext } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";
import { SERVICE_ICON_COMPONENTS, SERVICE_ICON_NAMES } from "./service-icons";

export type IconPickerInputProps = InputProps & {
  className?: string;
};

/**
 * Visual icon selector for service cards: a responsive grid of the allowlisted
 * lucide icons instead of a name-only dropdown. The stored value stays the
 * icon NAME (string) — the storefront resolves it through its own mirror of
 * this allowlist.
 */
export const IconPickerInput = (props: IconPickerInputProps) => {
  const resource = useResourceContext(props);
  const { label, source, className, helperText } = props;
  const { id, field, isRequired } = useInput(props);

  const value = field.value as string | undefined;

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <div
          role="radiogroup"
          aria-labelledby={label !== false ? undefined : id}
          className="grid grid-cols-4 gap-2 sm:grid-cols-6"
        >
          {SERVICE_ICON_NAMES.map((name) => {
            const Icon = SERVICE_ICON_COMPONENTS[name];
            const selected = value === name;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={name}
                title={name}
                onClick={() => field.onChange(name)}
                onBlur={field.onBlur}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl border transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};
