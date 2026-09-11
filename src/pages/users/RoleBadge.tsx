import { useRecordContext, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import { ROLE_BADGE_CLASSES, type RoleId } from "./roleChoices";

const PILL = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

/**
 * The record's access shown as pills: admins get their tier; STAFF users get
 * their managed-role names (that IS their access — the tier alone says
 * nothing), with a muted «Sin roles» fallback.
 */
export function RoleBadge() {
  const record = useRecordContext();
  const translate = useTranslate();
  const role = record?.role as RoleId | undefined;
  if (!role) return null;

  const managedRoles =
    (record?.managedRoles as Array<{ id: string; name: string }>) ?? [];

  if (role === "STAFF") {
    if (managedRoles.length === 0) {
      return (
        <span className={cn(PILL, "bg-muted text-muted-foreground")}>
          {translate("users.roles.none", { _: "Sin roles" })}
        </span>
      );
    }
    return (
      <span className="flex flex-wrap gap-1">
        {managedRoles.map((r) => (
          <span
            key={r.id}
            className={cn(
              PILL,
              "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
            )}
          >
            {r.name}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className={cn(PILL, ROLE_BADGE_CLASSES[role] ?? "bg-muted text-muted-foreground")}
    >
      {translate(`users.roles.${role}`, { _: role })}
    </span>
  );
}
