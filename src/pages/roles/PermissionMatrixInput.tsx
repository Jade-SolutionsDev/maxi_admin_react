import { useCallback, useMemo } from "react";
import { useGetList, useInput, useTranslate, type Validator } from "ra-core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

/** Las dos acciones que solo miran; el resto es trabajar sobre el módulo. */
const LECTURAS = ["list", "read"];

// Preferred column order; any action the API returns that isn't listed here is
// appended, so a new backend action renders without a frontend change (its
// label falls back to the raw key until i18n catches up).
const ACTION_ORDER = [
  "list",
  "read",
  "create",
  "update",
  "delete",
  "view-all",
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
  /** Validación del formulario, igual que en cualquier otro input. */
  validate?: Validator | Validator[];
}

/**
 * A module × action grid of checkboxes bound to a form field holding the
 * selected permission ids. Used inside the Role edit form.
 */
export function PermissionMatrixInput({
  source,
  disabled,
  validate,
}: PermissionMatrixInputProps) {
  const translate = useTranslate();
  const { field, fieldState, isRequired } = useInput({ source, validate });
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

  const { modules, actions, byModuleAction, byId } = useMemo(() => {
    const map = new Map<string, string>();
    const porId = new Map<string, { module: string; action: string }>();
    const moduleSet = new Set<string>();
    const actionSet = new Set<string>();
    (permissions ?? []).forEach((p) => {
      moduleSet.add(p.module);
      actionSet.add(p.action);
      map.set(`${p.module}:${p.action}`, p.id);
      porId.set(p.id, { module: p.module, action: p.action });
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
      byId: porId,
      modules: [...moduleSet].sort(byPreferredOrder(MODULE_ORDER)),
      actions: [...actionSet].sort(byPreferredOrder(ACTION_ORDER)),
      byModuleAction: map,
    };
  }, [permissions]);

  const setSelected = useCallback(
    (next: string[]) => field.onChange(next),
    [field],
  );

  /**
   * Trabajar sobre un módulo obliga a poder verlo: el menú lateral solo
   * enseña lo que el rol puede listar, así que un permiso de «crear» a secas
   * dejaba a la persona en un panel vacío. Al marcar cualquier acción de
   * trabajo, «listar» y «ver» se marcan solas y quedan bloqueadas.
   *
   * La API aplica la misma regla; esto es para que se vea antes de guardar.
   */
  const conLecturas = useCallback(
    (ids: string[]) => {
      const modulosQueTrabajan = new Set(
        ids
          .map((id) => byId.get(id))
          .filter((p) => p && !LECTURAS.includes(p.action))
          .map((p) => p!.module),
      );
      const lecturas = [...modulosQueTrabajan].flatMap((module) =>
        LECTURAS.map((action) => byModuleAction.get(`${module}:${action}`)),
      );
      return [
        ...new Set([
          ...ids,
          ...lecturas.filter((id): id is string => Boolean(id)),
        ]),
      ];
    },
    [byId, byModuleAction],
  );

  /** ¿Esta casilla de lectura está sostenida por un permiso de trabajo? */
  const lecturaImplicada = (module: string, action: string) =>
    LECTURAS.includes(action) &&
    selected.some((id) => {
      const permiso = byId.get(id);
      return permiso?.module === module && !LECTURAS.includes(permiso.action);
    });

  const toggleId = (id: string) => {
    if (disabled) return;
    setSelected(
      selected.includes(id)
        ? conLecturas(selected.filter((x) => x !== id))
        : conLecturas([...selected, id]),
    );
  };

  const toggleMany = (ids: string[], checked: boolean) => {
    if (disabled) return;
    if (checked) {
      setSelected(conLecturas([...new Set([...selected, ...ids])]));
    } else {
      setSelected(conLecturas(selected.filter((x) => !ids.includes(x))));
    }
  };

  const idsForModule = (module: string) =>
    actions
      .map((a) => byModuleAction.get(`${module}:${a}`))
      .filter((id): id is string => Boolean(id));

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
    <div className="w-full">
      {fieldState.error && (
        <p className="mb-2 text-sm text-destructive">
          {translate(fieldState.error.message ?? "", {
            _: fieldState.error.message ?? "",
          })}
        </p>
      )}
      {isRequired && !fieldState.error && (
        <p className="mb-2 text-sm text-muted-foreground">
          {translate("roles.matrix.al_menos_uno", {
            _: "Marca al menos un permiso: un rol sin acceso a nada no sirve.",
          })}
        </p>
      )}
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
                        onCheckedChange={(c) =>
                          toggleMany(moduleIds, c === true)
                        }
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
                            checked={
                              selected.includes(id) ||
                              lecturaImplicada(module, action)
                            }
                            disabled={
                              disabled || lecturaImplicada(module, action)
                            }
                            onCheckedChange={() => toggleId(id)}
                            aria-label={`${module}:${action}`}
                            title={
                              lecturaImplicada(module, action)
                                ? translate("roles.matrix.lectura_implicada", {
                                    _: "Hace falta para trabajar en este módulo: sin poder verlo, el módulo no aparece en el menú.",
                                  })
                                : undefined
                            }
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
    </div>
  );
}
