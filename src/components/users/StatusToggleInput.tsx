import { useCallback } from "react";
import type { RaRecord } from "ra-core";
import { useInput, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

type StatusValue = "" | "active" | "inactive" | "pending";

const options: { value: StatusValue; key: string }[] = [
  { value: "", key: "users.filters.all" },
  { value: "active", key: "users.filters.active" },
  { value: "inactive", key: "users.filters.inactive" },
  { value: "pending", key: "users.filters.pending" },
];

export function StatusToggleInput(props: StatusToggleInputProps) {
  const { source, resource, className } = props;
  const { field } = useInput({ source, resource });
  const translate = useTranslate();

  const current: StatusValue = options.some((o) => o.value === field.value)
    ? (field.value as StatusValue)
    : "";

  const handleChange = useCallback(
    (value: StatusValue) => {
      field.onChange(value);
    },
    [field],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-muted p-1 rounded-[10px] h-10 pointer-events-auto",
        className,
      )}
    >
      {options.map((option) => {
        const active = current === option.value;
        return (
          <button
            key={option.value || "all"}
            type="button"
            onClick={() => handleChange(option.value)}
            className={cn(
              "px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 h-full",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-background/60",
            )}
          >
            {translate(option.key)}
          </button>
        );
      })}
    </div>
  );
}

export interface StatusToggleInputProps {
  source: string;
  resource?: string;
  className?: string;
  alwaysOn?: boolean;
  // Props injected by FilterForm that we accept and ignore
  record?: RaRecord;
  size?: "small" | "medium" | "large" | string;
  helperText?: React.ReactNode;
  defaultValue?: unknown;
}
