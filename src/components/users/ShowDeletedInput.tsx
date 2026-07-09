import type { RaRecord } from "ra-core";
import { useInput, useTranslate } from "ra-core";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Filter switch that reveals soft-deleted users (sends `includeDeleted=true`).
 * Declares the props react-admin's FilterForm injects (notably `alwaysOn`).
 */
export function ShowDeletedInput(props: ShowDeletedInputProps) {
  const { source, resource, className } = props;
  const { field } = useInput({ source, resource, defaultValue: false });
  const translate = useTranslate();

  const checked = field.value === true;

  return (
    <label
      className={cn(
        "flex items-center gap-2 h-10 px-3 rounded-[10px] bg-muted cursor-pointer select-none",
        className,
      )}
    >
      <Switch
        checked={checked}
        onCheckedChange={(value) => field.onChange(value)}
      />
      <span className="text-[13px] font-medium text-muted-foreground">
        {translate("users.filters.show_deleted", { _: "Show deleted" })}
      </span>
    </label>
  );
}

export interface ShowDeletedInputProps {
  source: string;
  resource?: string;
  className?: string;
  alwaysOn?: boolean;
  // Props injected by FilterForm that we accept and ignore
  record?: RaRecord;
  size?: "small" | "medium" | "large" | string;
  helperText?: React.ReactNode;
  label?: string;
  defaultValue?: unknown;
}
