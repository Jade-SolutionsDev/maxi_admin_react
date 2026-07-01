import { useCallback } from "react";
import type { RaRecord } from "ra-core";
import { useInput, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

type StatusValue = "all" | "true" | "false";

const options: { value: StatusValue; key: string }[] = [
  { value: "all", key: "users.filters.all" },
  { value: "true", key: "users.filters.active" },
  { value: "false", key: "users.filters.inactive" },
];

export function StatusToggleInput(props: StatusToggleInputProps) {
  const { source, resource, className } = props;
  const { field } = useInput({ source, resource });
  const translate = useTranslate();

  const current: StatusValue =
    field.value === "true" ? "true" : field.value === "false" ? "false" : "all";

  const handleChange = useCallback(
    (value: StatusValue) => {
      field.onChange(value === "all" ? "" : value);
    },
    [field],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-[#F1F5F9] dark:bg-[#1A2535] p-1 rounded-[10px] h-10 pointer-events-auto",
        className,
      )}
    >
      {options.map((option) => {
        const active = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            className={cn(
              "px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 h-full",
              active
                ? "bg-[#10B981] text-white"
                : "text-[#64748B] dark:text-[#94A3B8] hover:bg-white/50 dark:hover:bg-white/5",
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
