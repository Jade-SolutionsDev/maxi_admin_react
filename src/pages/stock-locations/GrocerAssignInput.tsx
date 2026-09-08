import { useEffect, useState } from "react";
import { useDataProvider, useInput, useTranslate } from "ra-core";
import { Users } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import type {
  AssignableStorageUser,
  ExtendedDataProvider,
} from "@/providers/dataProvider";

/**
 * Admin-only multi-select of the users assigned to the storage — anyone whose
 * roles grant a stock-locations permission is assignable, not only GROCERs.
 * Bound to the `grocerIds` form field (historical name — the API keeps it).
 * Render this only for managers — the backend ignores `grocerIds` from
 * non-admins anyway.
 */
export function GrocerAssignInput({ source = "grocerIds" }: { source?: string }) {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { field } = useInput({ source });
  const selected: string[] = Array.isArray(field.value) ? field.value : [];

  const [users, setUsers] = useState<AssignableStorageUser[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    dataProvider
      .getAssignableStorageUsers()
      .then(({ data }) => {
        if (!cancelled) setUsers(data);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [dataProvider]);

  const toggle = (id: string) => {
    field.onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  };

  if (users === null) {
    return <div className="h-24 rounded-lg bg-muted animate-pulse" />;
  }

  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {translate("stockLocations.grocers.empty", {
          _: "No hay usuarios con permiso de almacenes para asignar.",
        })}
      </p>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border border-border p-2">
      {users.map((g) => {
        const name =
          [g.firstName, g.lastName].filter(Boolean).join(" ") ||
          g.email ||
          g.id;
        return (
          <label
            key={g.id}
            className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-accent"
          >
            <Checkbox
              checked={selected.includes(g.id)}
              onCheckedChange={() => toggle(g.id)}
            />
            <Users size={15} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{name}</span>
              {g.email && name !== g.email ? (
                <span className="text-xs text-muted-foreground">{g.email}</span>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}
