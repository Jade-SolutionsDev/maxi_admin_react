import { useGetList, useTranslate } from "ra-core";

import { Checkbox } from "@/components/ui/checkbox";
import type { RoleSummary } from "@/providers/dataProvider";

/**
 * Controlled checkbox list of the managed roles (shared by the edit form and
 * the invite modal). `value === null` means the current selection is still
 * loading — the list renders but stays inert.
 */
export function RolesChecklist({
  value,
  onChange,
}: {
  value: string[] | null;
  onChange: (ids: string[]) => void;
}) {
  const translate = useTranslate();
  const { data: roles, isPending } = useGetList<RoleSummary>("roles", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "name", order: "ASC" },
  });

  const toggle = (id: string) => {
    if (value === null) return;
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id],
    );
  };

  if (isPending || value === null) {
    return (
      <p className="text-sm text-muted-foreground">
        {translate("ra.page.loading", { _: "Cargando…" })}
      </p>
    );
  }

  if ((roles ?? []).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {translate("roles.assign_dialog.empty", { _: "No roles yet." })}
      </p>
    );
  }

  return (
    <ul className="space-y-1 rounded-md border border-border p-1">
      {(roles ?? []).map((role) => {
        const id = String(role.id);
        return (
          <li key={id}>
            <label className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={value.includes(id)}
                onCheckedChange={() => toggle(id)}
                className="mt-0.5"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{role.name}</span>
                {role.description && (
                  <span className="text-xs text-muted-foreground">
                    {role.description}
                  </span>
                )}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
