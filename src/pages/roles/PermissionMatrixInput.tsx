import { useCallback, useMemo } from "react";
import { useGetList, useInput, useTranslate } from "ra-core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// Preferred column order; any action the API returns that isn't listed here is
// appended, so a new backend action renders without a frontend change (its
// label falls back to the raw key until i18n catches up).
const ACTION_ORDER = [
  "list",
  "read",
  "create",
  "update",
  "delete",
<<<<<<< HEAD
  "view-all",
=======
>>>>>>> 85c41ea (feat(permissions): espejo de denegación por defecto en el back-office)
  "reply",
  "update-status",
  "update-payment-status",
  "aggregate",
  "history",
  "create-operation",
  "view",
];

// Preferred row order (mirrors the backend MODULE_ACTIONS catalog); any extra
// modules returned by the API are appended alphabetically.
const MODULE_ORDER = [
  "products",
  "categories",
  "departments",
  "stock-locations",
  "inventory",
  "orders",
  "clients",
  "contact",
  "cms-pages",
  "cms-banners",
  "cms-services",
  "cms-staff",
  "cms-settings",
  "nomenclators",
  "delivery-options",
  "fulfillment-settings",
  "payment-methods",
  "dashboard",
  "uploads",
];

interface PermissionRecord {
  id: string;
  module: string;
  action: string;
}

interface PermissionMatrixInputProps {
  source: string;
  disabled?: boolean;
}

/**
 * A module × action grid of checkboxes bound to a form field holding the
 * selected permission ids. Used inside the Role edit form.
 */
export function PermissionMatrixInput({
  source,
  disabled,
}: PermissionMatrixInputProps) {
  const translate = useTranslate();
  const { field } = useInput({ source });
  const { data: permissions, isPending } = useGetList<PermissionRecord>(
    "permissions",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "module", order: "ASC" },
    },
  );

  const selected: string[] = Array.isArray(field.value)
    ? (field.value as string[])
    : [];

  const { modules, actions, byModuleAction } = useMemo(() => {
    const map = new Map<string, string>();
    const moduleSet = new Set<string>();
    const actionSet = new Set<string>();
    (permissions ?? []).forEach((p) => {
      moduleSet.add(p.module);
      actionSet.add(p.action);
      map.set(`${p.module}:${p.action}`, p.id);
    });
    const byPreferredOrder = (order: string[]) => (a: string, b: string) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    };
    return {
      modules: [...moduleSet].sort(byPreferredOrder(MODULE_ORDER)),
      actions: [...actionSet].sort(byPreferredOrder(ACTION_ORDER)),
      byModuleAction: map,
    };
  }, [permissions]);

  const setSelected = useCallback(
    (next: string[]) => field.onChange(next),
    [field],
  );

  const toggleId = (id: string) => {
    if (disabled) return;
    setSelected(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  };

  const toggleMany = (ids: string[], checked: boolean) => {
    if (disabled) return;
    if (checked) {
      setSelected([...new Set([...selected, ...ids])]);
    } else {
      setSelected(selected.filter((x) => !ids.includes(x)));
    }
  };

  const idsForModule = (module: string) =>
    actions.map((a) => byModuleAction.get(`${module}:${a}`)).filter(
      (id): id is string => Boolean(id),
    );

  const idsForAction = (action: string) =>
    modules
      .map((m) => byModuleAction.get(`${m}:${action}`))
      .filter((id): id is string => Boolean(id));

  if (isPending) {
    return (
      <div className="text-sm text-muted-foreground">
        {translate("ra.page.loading")}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">
              {translate("roles.matrix.module")}
            </TableHead>
            {actions.map((action) => {
              const ids = idsForAction(action);
              const allChecked =
                ids.length > 0 && ids.every((id) => selected.includes(id));
              return (
                <TableHead key={action} className="text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span>{translate(`permissions.actions.${action}`)}</span>
                    <Checkbox
                      checked={allChecked}
                      disabled={disabled || ids.length === 0}
                      onCheckedChange={(c) => toggleMany(ids, c === true)}
                      aria-label={translate("roles.matrix.toggle_all")}
                    />
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => {
            const moduleIds = idsForModule(module);
            const allChecked =
              moduleIds.length > 0 &&
              moduleIds.every((id) => selected.includes(id));
            return (
              <TableRow key={module}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allChecked}
                      disabled={disabled || moduleIds.length === 0}
                      onCheckedChange={(c) => toggleMany(moduleIds, c === true)}
                      aria-label={translate("roles.matrix.toggle_all")}
                    />
                    <span>{translate(`permissions.modules.${module}`)}</span>
                  </div>
                </TableCell>
                {actions.map((action) => {
                  const id = byModuleAction.get(`${module}:${action}`);
                  return (
                    <TableCell key={action} className="text-center">
                      {id ? (
                        <Checkbox
                          checked={selected.includes(id)}
                          disabled={disabled}
                          onCheckedChange={() => toggleId(id)}
                          aria-label={`${module}:${action}`}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
