import { useGetList, useInput, useTranslate } from "ra-core";
import { Users } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

/**
 * Admin-only multi-select of GROCER users assigned to the storage. Bound to the
 * `grocerIds` form field. Render this only for managers — the backend ignores
 * `grocerIds` from non-admins anyway.
 */
export function GrocerAssignInput({ source = "grocerIds" }: { source?: string }) {
  const translate = useTranslate();
  const { field } = useInput({ source });
  const selected: string[] = Array.isArray(field.value) ? field.value : [];

  const { data: grocers = [], isPending } = useGetList("users", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "firstName", order: "ASC" },
    filter: { role: "GROCER" },
  });

  const toggle = (id: string) => {
    field.onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  };

  if (isPending) {
    return <div className="h-24 rounded-lg bg-muted animate-pulse" />;
  }

  if (grocers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {translate("almacenes.grocers.empty", {
          _: "No hay usuarios GROCER disponibles.",
        })}
      </p>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border border-border p-2">
      {grocers.map((g) => {
        const name =
          [g.firstName, g.lastName].filter(Boolean).join(" ") ||
          (g.email as string) ||
          (g.id as string);
        return (
          <label
            key={g.id}
            className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-accent"
          >
            <Checkbox
              checked={selected.includes(g.id as string)}
              onCheckedChange={() => toggle(g.id as string)}
            />
            <Users size={15} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{name}</span>
              {g.email && name !== g.email ? (
                <span className="text-xs text-muted-foreground">
                  {g.email as string}
                </span>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}
