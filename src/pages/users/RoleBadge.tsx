import { useRecordContext, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import { ROLE_BADGE_CLASSES, type RoleId } from "./roleChoices";

/** Renders the current record's `role` as a translated, color-coded pill. */
export function RoleBadge() {
  const record = useRecordContext();
  const translate = useTranslate();
  const role = record?.role as RoleId | undefined;
  if (!role) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        ROLE_BADGE_CLASSES[role] ??
          "bg-muted text-muted-foreground",
      )}
    >
      {translate(`users.roles.${role}`, { _: role })}
    </span>
  );
}
