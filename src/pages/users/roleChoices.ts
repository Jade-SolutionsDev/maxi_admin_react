/** Backoffice system roles — must match the backend `Role` enum values. */
export const ROLE_IDS = [
  "SUPER_ADMIN",
  "ADMIN",
  "GROCER",
  "KARDIST",
] as const;

export type RoleId = (typeof ROLE_IDS)[number];

/** Choices for ra-core `<SelectInput>`; `name` is an i18n key it will translate. */
export const roleChoices = ROLE_IDS.map((id) => ({
  id,
  name: `users.roles.${id}`,
}));

/** Tailwind classes for the role badge, tuned for both light and dark themes. */
export const ROLE_BADGE_CLASSES: Record<RoleId, string> = {
  SUPER_ADMIN:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  ADMIN:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  GROCER:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  KARDIST:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
};
