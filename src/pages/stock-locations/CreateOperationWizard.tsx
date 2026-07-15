import { useMemo, useState } from "react";
import {
  useDataProvider,
  useGetList,
  useGetMany,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ExtendedDataProvider,
  InventoryOperationType,
} from "@/providers/dataProvider";

interface WizardProps {
  locationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ItemRow {
  key: number;
  productId: string;
  productName: string;
  quantity: string;
  // Present only for Out/Transfer, where products are restricted to current stock.
  available?: number;
}

interface StockProduct {
  id: string;
  name: string;
  available: number;
}

const OP_TYPES: {
  type: InventoryOperationType;
  labelKey: string;
  labelFallback: string;
  descKey: string;
  descFallback: string;
  icon: typeof ArrowDownToLine;
  accent: string;
}[] = [
  {
    type: "IN",
    labelKey: "stockLocations.operations.in",
    labelFallback: "Entrada",
    descKey: "stockLocations.operations.in_desc",
    descFallback: "Añade existencias a uno o varios productos del almacén.",
    icon: ArrowDownToLine,
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  {
    type: "OUT",
    labelKey: "stockLocations.operations.out",
    labelFallback: "Salida",
    descKey: "stockLocations.operations.out_desc",
    descFallback: "Disminuye las existencias de uno o varios productos.",
    icon: ArrowUpFromLine,
    accent: "text-red-600 dark:text-red-400",
  },
  {
    type: "TRANSFER",
    labelKey: "stockLocations.operations.transfer",
    labelFallback: "Transferencia",
    descKey: "stockLocations.operations.transfer_desc",
    descFallback: "Mueve productos hacia otro almacén del sistema.",
    icon: ArrowLeftRight,
    accent: "text-blue-600 dark:text-blue-400",
  },
];

/**
 * Product picker. For an Entrada (no `stock` prop) it searches all products
 * server-side. For Salida/Transferencia, `stock` restricts the options to what
 * the location actually holds, and each option shows its available quantity.
 */
function ProductCombobox({
  value,
  valueName,
  onSelect,
  stock,
  excludeIds,
}: {
  value: string;
  valueName: string;
  onSelect: (id: string, name: string, available?: number) => void;
  stock?: StockProduct[];
  excludeIds?: Set<string>;
}) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const restricted = stock !== undefined;

  const { data: searched, isLoading } = useGetList(
    "products",
    {
      filter: term ? { q: term } : {},
      pagination: { page: 1, perPage: 20 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open && !restricted },
  );

  const options: StockProduct[] = restricted
    ? (stock ?? [])
        .filter((s) => s.id === value || !excludeIds?.has(s.id))
        .filter((s) =>
          term ? s.name.toLowerCase().includes(term.toLowerCase()) : true,
        )
    : (searched ?? [])
        .filter((p) => String(p.id) === value || !excludeIds?.has(String(p.id)))
        .map((p) => ({
          id: String(p.id),
          name: String(p.name ?? ""),
          available: Number.NaN,
        }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {valueName ||
              translate("stockLocations.operations.product_placeholder", {
                _: "Escriba el nombre del producto...",
              })}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={term}
            onValueChange={setTerm}
            placeholder={translate("stockLocations.operations.product_search", {
              _: "Buscar producto...",
            })}
          />
          <CommandList>
            {!restricted && isLoading && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {translate("search.loading", { _: "Buscando…" })}
              </p>
            )}
            {(restricted || !isLoading) && options.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {translate("search.empty", { _: "Sin resultados" })}
              </p>
            )}
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.id}
                  onSelect={() => {
                    onSelect(
                      o.id,
                      o.name,
                      restricted ? o.available : undefined,
                    );
                    setOpen(false);
                    setTerm("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === o.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{o.name}</span>
                  {restricted && (
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {translate("stockLocations.operations.available_short", {
                        smart_count: o.available,
                        _: "disp: %{smart_count}",
                      })}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CreateOperationWizard({
  locationId,
  open,
  onOpenChange,
}: WizardProps) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<InventoryOperationType | null>(null);
  const [targetLocationId, setTargetLocationId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { key: 0, productId: "", productName: "", quantity: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Destination storages for a transfer: active, excluding the current one.
  const { data: locations } = useGetList(
    "stock-locations",
    {
      filter: { isActive: "true" },
      pagination: { page: 1, perPage: 100 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open && type === "TRANSFER" },
  );
  const destinations = (locations ?? []).filter((l) => l.id !== locationId);

  // For Out/Transfer, products are limited to what this location currently holds.
  const stockMode = type === "OUT" || type === "TRANSFER";
  const { data: invRows } = useGetList(
    "inventory",
    {
      filter: { locationId },
      pagination: { page: 1, perPage: 300 },
      sort: { field: "id", order: "ASC" },
    },
    { enabled: open && stockMode },
  );
  const invProductIds = useMemo(
    () => [...new Set((invRows ?? []).map((r) => String(r.productId)))],
    [invRows],
  );
  const { data: invProducts } = useGetMany(
    "products",
    { ids: invProductIds },
    { enabled: invProductIds.length > 0 },
  );
  const stock: StockProduct[] = useMemo(() => {
    const nameById = new Map(
      (invProducts ?? []).map((p) => [String(p.id), String(p.name ?? "")]),
    );
    return (invRows ?? [])
      .filter((r) => Number(r.quantity) > 0)
      .map((r) => ({
        id: String(r.productId),
        name: nameById.get(String(r.productId)) ?? "",
        available: Number(r.quantity),
      }));
  }, [invRows, invProducts]);

  const reset = () => {
    setStep(1);
    setType(null);
    setTargetLocationId("");
    setNote("");
    setItems([{ key: 0, productId: "", productName: "", quantity: "" }]);
    setSubmitting(false);
  };

  const close = () => {
    onOpenChange(false);
    // Delay reset so it doesn't flash during the close animation.
    setTimeout(reset, 200);
  };

  const selectType = (t: InventoryOperationType) => {
    setType(t);
    setTargetLocationId("");
    setItems([{ key: 0, productId: "", productName: "", quantity: "" }]);
  };

  const validItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.productId &&
          Number(i.quantity) > 0 &&
          (i.available == null || Number(i.quantity) <= i.available),
      ),
    [items],
  );

  const canContinueStep2 =
    validItems.length > 0 &&
    (type !== "TRANSFER" || Boolean(targetLocationId));

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        key: (prev[prev.length - 1]?.key ?? 0) + 1,
        productId: "",
        productName: "",
        quantity: "",
      },
    ]);

  const updateItem = (key: number, patch: Partial<ItemRow>) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, ...patch } : i)),
    );

  const removeItem = (key: number) =>
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((i) => i.key !== key),
    );

  const submit = async () => {
    if (!type) return;
    setSubmitting(true);
    try {
      await dataProvider.createInventoryOperation({
        locationId,
        type,
        targetLocationId:
          type === "TRANSFER" ? targetLocationId : undefined,
        note: note.trim() || undefined,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
      });
      notify("stockLocations.operations.success", {
        type: "success",
        messageArgs: { _: "Operación registrada" },
      });
      refresh();
      close();
    } catch (error) {
      const message =
        (error as { body?: { error?: { message?: string } } })?.body?.error
          ?.message ??
        (error as Error)?.message;
      notify(message || "shared.actions.error", { type: "error" });
      setSubmitting(false);
    }
  };

  const stepLabels = [
    translate("stockLocations.operations.step_type", {
      _: "Seleccionar operación",
    }),
    translate("stockLocations.operations.step_items", {
      _: "Ingresar productos",
    }),
    translate("stockLocations.operations.step_confirm", {
      _: "Resumen y confirmar",
    }),
  ];

  const activeType = OP_TYPES.find((t) => t.type === type);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {translate("stockLocations.operations.title", {
              _: "Crear operación",
            })}
          </DialogTitle>
          <DialogDescription>
            {translate("stockLocations.operations.subtitle", {
              _: "Registre una entrada, salida o transferencia de inventario.",
            })}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <ol className="flex items-center gap-2 text-xs">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const current = step === n;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    current || done
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check size={12} /> : n}
                </span>
                <span
                  className={cn(
                    "truncate",
                    current ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
                {n < 3 && <span className="h-px flex-1 bg-border" />}
              </li>
            );
          })}
        </ol>

        {/* Step 1 — type */}
        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {OP_TYPES.map((op) => {
              const Icon = op.icon;
              const selected = type === op.type;
              return (
                <button
                  key={op.type}
                  type="button"
                  onClick={() => selectType(op.type)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors",
                    selected
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  <Icon className={cn("h-7 w-7", op.accent)} />
                  <span className="font-medium text-foreground">
                    {translate(op.labelKey, { _: op.labelFallback })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {translate(op.descKey, { _: op.descFallback })}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2 — items */}
        {step === 2 && (
          <div className="space-y-4">
            {type === "TRANSFER" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {translate("stockLocations.operations.destination", {
                    _: "Almacén de destino",
                  })}
                  <span className="text-destructive"> *</span>
                </label>
                <Select
                  value={targetLocationId}
                  onValueChange={setTargetLocationId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={translate(
                        "stockLocations.operations.destination_placeholder",
                        { _: "Seleccione un almacén" },
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {String(l.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {stockMode && stock.length === 0 ? (
              <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                {translate("stockLocations.operations.no_stock", {
                  _: "Este almacén no tiene existencias disponibles para retirar o transferir.",
                })}
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const usedIds = new Set(
                    items
                      .filter((x) => x.key !== item.key && x.productId)
                      .map((x) => x.productId),
                  );
                  const over =
                    item.available != null &&
                    Number(item.quantity) > item.available;
                  return (
                    <div key={item.key} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          {translate("resources.products.name", {
                            _: "Producto",
                          })}
                        </label>
                        <ProductCombobox
                          value={item.productId}
                          valueName={item.productName}
                          stock={stockMode ? stock : undefined}
                          excludeIds={usedIds}
                          onSelect={(id, name, available) =>
                            updateItem(item.key, {
                              productId: id,
                              productName: name,
                              available,
                            })
                          }
                        />
                      </div>
                      <div className="w-28 space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          {translate("stockLocations.operations.quantity", {
                            _: "Cantidad",
                          })}
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={item.available}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.key, { quantity: e.target.value })
                          }
                          placeholder="0"
                          className={cn(over && "border-destructive")}
                        />
                        {item.available != null && (
                          <span
                            className={cn(
                              "block text-[11px]",
                              over
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            {translate(
                              "stockLocations.operations.available_short",
                              {
                                smart_count: item.available,
                                _: "disp: %{smart_count}",
                              },
                            )}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6 text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.key)}
                        disabled={items.length === 1}
                        aria-label={translate("shared.actions.delete", {
                          _: "Delete",
                        })}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {translate("stockLocations.operations.add_product", {
                    _: "Agregar otro producto",
                  })}
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {translate("stockLocations.operations.note", {
                  _: "Nota (opcional)",
                })}
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={500}
              />
            </div>
          </div>
        )}

        {/* Step 3 — summary */}
        {step === 3 && activeType && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3">
              <activeType.icon className={cn("h-5 w-5", activeType.accent)} />
              <span className="font-medium">
                {translate(activeType.labelKey, { _: activeType.labelFallback })}
              </span>
              {type === "TRANSFER" && (
                <span className="text-sm text-muted-foreground">
                  →{" "}
                  {String(
                    destinations.find((d) => d.id === targetLocationId)?.name ??
                      "",
                  )}
                </span>
              )}
            </div>
            <ul className="divide-y divide-border rounded-md border border-border">
              {validItems.map((i) => (
                <li
                  key={i.key}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{i.productName}</span>
                  <span className="font-medium tabular-nums">{i.quantity}</span>
                </li>
              ))}
            </ul>
            {note.trim() && (
              <p className="text-sm text-muted-foreground">
                {translate("stockLocations.operations.note", { _: "Nota" })}:{" "}
                {note}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={submitting}
              >
                {translate("shared.actions.back", { _: "Volver" })}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={submitting}
            >
              {translate("shared.actions.cancel", { _: "Cancelar" })}
            </Button>
            {step === 1 && (
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!type}
              >
                {translate("shared.actions.continue", { _: "Continuar" })}
              </Button>
            )}
            {step === 2 && (
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canContinueStep2}
              >
                {translate("shared.actions.continue", { _: "Continuar" })}
              </Button>
            )}
            {step === 3 && (
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {translate("stockLocations.operations.confirm", {
                  _: "Confirmar operación",
                })}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
