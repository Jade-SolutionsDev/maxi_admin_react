import { useMemo, useState } from "react";
import {
  useDataProvider,
  useGetList,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExtendedDataProvider,
  OrderLinePayload,
  OrderPaymentStatus,
  OrderStatus,
} from "@/providers/dataProvider";

const REASON_MIN = 5;

export interface EditableLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

const money = (value: number) =>
  new Intl.NumberFormat("es-CU", {
    style: "currency",
    currency: "USD",
  }).format(value);

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Qué le pasa al stock al guardar, según dónde esté el pedido. Es lo mismo que
 * hace la API, dicho en la lengua de quien mira la pantalla. Una clave por caso
 * (y no un texto ya traducido) porque cada fase dice una cosa distinta.
 */
function stockHint(status: OrderStatus): { key: string; fallback: string } {
  if (status === "cancelled")
    return {
      key: "orders.items_editor.stock_cancelled",
      fallback:
        "El pedido está cancelado: no hay stock apartado, así que esto no toca el almacén.",
    };
  if (status === "pending")
    return {
      key: "orders.items_editor.stock_pending",
      fallback:
        "El pedido está pendiente: lo que subas se aparta del stock y lo que bajes se suelta.",
    };
  return {
    key: "orders.items_editor.stock_committed",
    fallback:
      "El pedido ya salió del almacén: lo que subas se descuenta y lo que bajes vuelve a entrar, con su movimiento de inventario.",
  };
}

/**
 * Corrección de las líneas de un pedido (capa 3): cantidades, productos y
 * precios, con el total recalculado. Solo para SUPER_ADMIN; la API vuelve a
 * comprobarlo y mueve el stock según la fase en que esté el pedido.
 */
export function OrderItemsEditor({
  orderId,
  status,
  paymentStatus,
  deliveryFee,
  currentTotal,
  items,
  open,
  onOpenChange,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  deliveryFee: number;
  currentTotal: number;
  items: EditableLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const queryClient = useQueryClient();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  const [lines, setLines] = useState<EditableLine[]>(items);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");

  // Catálogo para añadir productos. Se consulta solo cuando hay búsqueda: la
  // lista entera no cabe y tampoco ayuda.
  const { data: found } = useGetList(
    "products",
    {
      filter: { q: search },
      pagination: { page: 1, perPage: 8 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: search.trim().length >= 2 },
  );

  const original = useMemo(
    () => new Map(items.map((line) => [line.productId, line])),
    [items],
  );

  const subtotal = round(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  );
  const total = round(subtotal + deliveryFee);
  const difference = round(total - currentTotal);

  // Qué va a cambiar, en palabras: es lo que se lee antes de guardar y lo que
  // quedará en el historial.
  const changes = useMemo(() => {
    const out: string[] = [];
    for (const line of lines) {
      const before = original.get(line.productId);
      if (!before) {
        out.push(`Se añade ${line.name} × ${line.quantity}`);
        continue;
      }
      if (before.quantity !== line.quantity) {
        out.push(
          `${line.name}: ${before.quantity} → ${line.quantity} unidades`,
        );
      }
      if (round(before.unitPrice) !== round(line.unitPrice)) {
        out.push(
          `${line.name}: precio ${money(before.unitPrice)} → ${money(line.unitPrice)}`,
        );
      }
    }
    for (const before of original.values()) {
      if (!lines.some((line) => line.productId === before.productId)) {
        out.push(`Se quita ${before.name} (${before.quantity})`);
      }
    }
    return out;
  }, [lines, original]);

  const reasonOk = reason.trim().length >= REASON_MIN;
  const canSave = changes.length > 0 && reasonOk && lines.length > 0;

  const save = useMutation({
    mutationFn: () => {
      const payload: OrderLinePayload[] = lines.map((line) => {
        const before = original.get(line.productId);
        return {
          productId: line.productId,
          quantity: line.quantity,
          // El precio solo viaja cuando se escribió a mano o la línea es nueva;
          // si no, la API conserva el que el cliente aceptó en su día.
          ...(before && round(before.unitPrice) === round(line.unitPrice)
            ? {}
            : { unitPrice: round(line.unitPrice) }),
        };
      });
      return dataProvider.updateOrderItems(orderId, {
        items: payload,
        reason: reason.trim(),
      });
    },
    onSuccess: () => {
      notify("orders.items_editor.saved", {
        type: "success",
        messageArgs: { _: "Productos del pedido corregidos" },
      });
      setReason("");
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      refresh();
    },
    onError: (error: unknown) => {
      notify(
        (error as { body?: { error?: { message?: string } } })?.body?.error
          ?.message ??
          (error as Error)?.message ??
          "Error",
        { type: "error" },
      );
    },
  });

  const setQuantity = (productId: string, quantity: number) =>
    setLines((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.max(1, Math.min(9999, quantity)) }
          : line,
      ),
    );

  const setPrice = (productId: string, unitPrice: number) =>
    setLines((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, unitPrice: Math.max(0, unitPrice) }
          : line,
      ),
    );

  const addProduct = (product: {
    id: string;
    name?: string;
    finalPrice?: number;
    basePrice?: number;
  }) => {
    setSearch("");
    setLines((prev) => {
      const already = prev.find((line) => line.productId === product.id);
      if (already) return prev; // ya está: se sube su cantidad desde la fila
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name ?? product.id,
          quantity: 1,
          unitPrice: Number(product.finalPrice ?? product.basePrice ?? 0),
        },
      ];
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setLines(items);
          setReason("");
          setSearch("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {translate("orders.items_editor.title", {
              _: "Corregir los productos del pedido",
            })}
          </DialogTitle>
          <DialogDescription>
            {translate(stockHint(status).key, {
              _: stockHint(status).fallback,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="divide-y divide-border rounded-md border border-border">
            {lines.map((line) => {
              const before = original.get(line.productId);
              return (
                <li key={line.productId} className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {line.name}
                      {!before && (
                        <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-normal text-emerald-700 dark:text-emerald-400">
                          {translate("orders.items_editor.new", { _: "nuevo" })}
                        </span>
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={translate("orders.items_editor.remove", {
                        _: "Quitar del pedido",
                      })}
                      onClick={() =>
                        setLines((prev) =>
                          prev.filter((l) => l.productId !== line.productId),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`qty-${line.productId}`}
                        className="text-xs"
                      >
                        {translate("orders.fields.quantity", {
                          _: "Cantidad",
                        })}
                      </Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={translate("orders.items_editor.less", {
                            _: "Una menos",
                          })}
                          onClick={() =>
                            setQuantity(line.productId, line.quantity - 1)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          id={`qty-${line.productId}`}
                          type="number"
                          min={1}
                          max={9999}
                          value={line.quantity}
                          onChange={(e) =>
                            setQuantity(
                              line.productId,
                              Number(e.target.value) || 1,
                            )
                          }
                          className="h-8 w-20 text-center tabular-nums"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={translate("orders.items_editor.more", {
                            _: "Una más",
                          })}
                          onClick={() =>
                            setQuantity(line.productId, line.quantity + 1)
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`price-${line.productId}`}
                        className="text-xs"
                      >
                        {translate("orders.fields.unitPrice", {
                          _: "Precio",
                        })}
                      </Label>
                      <Input
                        id={`price-${line.productId}`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          setPrice(line.productId, Number(e.target.value) || 0)
                        }
                        className="h-8 w-28 text-right tabular-nums"
                      />
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground">
                        {translate("orders.fields.lineTotal", {
                          _: "Importe",
                        })}
                      </p>
                      <p className="font-medium tabular-nums">
                        {money(round(line.unitPrice * line.quantity))}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
            {lines.length === 0 && (
              <li className="p-3 text-sm text-destructive">
                {translate("orders.items_editor.empty", {
                  _: "Un pedido no puede quedarse sin productos. Añade alguno o cancela el pedido.",
                })}
              </li>
            )}
          </ul>

          <div className="space-y-1.5">
            <Label htmlFor="items-search">
              {translate("orders.items_editor.add", {
                _: "Añadir un producto",
              })}
            </Label>
            <div className="relative">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="items-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={translate("orders.items_editor.add_placeholder", {
                  _: "Busca por nombre…",
                })}
                className="pl-8"
              />
            </div>
            {search.trim().length >= 2 && (
              <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-md border border-border">
                {(found ?? []).length === 0 ? (
                  <li className="p-2 text-sm text-muted-foreground">
                    {translate("orders.items_editor.no_results", {
                      _: "Ningún producto con ese nombre.",
                    })}
                  </li>
                ) : (
                  (found ?? []).map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() =>
                          addProduct(
                            product as unknown as {
                              id: string;
                              name?: string;
                              finalPrice?: number;
                              basePrice?: number;
                            },
                          )
                        }
                      >
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                          {product.name as string}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {money(
                            Number(
                              product.finalPrice ?? product.basePrice ?? 0,
                            ),
                          )}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="space-y-1 rounded-md border border-border p-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>
                {translate("orders.fields.subtotal", { _: "Subtotal" })}
              </span>
              <span className="tabular-nums">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                {translate("orders.fields.deliveryFee", { _: "Envío" })}
              </span>
              <span className="tabular-nums">{money(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground">
              <span>{translate("orders.fields.total", { _: "Total" })}</span>
              <span className="tabular-nums">{money(total)}</span>
            </div>
            {difference !== 0 && (
              <p className="pt-1 text-xs text-muted-foreground">
                {translate("orders.items_editor.difference", {
                  _: "Antes: %{before}. Diferencia: %{diff}.",
                  before: money(currentTotal),
                  diff: `${difference > 0 ? "+" : ""}${money(difference)}`,
                })}
              </p>
            )}
          </div>

          {paymentStatus === "paid" && difference !== 0 && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {difference > 0
                ? translate("orders.items_editor.paid_more", {
                    _: "Este pedido está pagado y el total sube %{diff}: hay que cobrar esa diferencia aparte.",
                    diff: money(difference),
                  })
                : translate("orders.items_editor.paid_less", {
                    _: "Este pedido está pagado y el total baja %{diff}: hay que devolver esa diferencia al cliente.",
                    diff: money(Math.abs(difference)),
                  })}
            </p>
          )}

          {changes.length > 0 && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
              <p className="mb-1 font-medium text-foreground">
                {translate("orders.items_editor.summary", {
                  _: "Se guardará:",
                })}
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                {changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="items-reason">
              {translate("orders.correction.reason", {
                _: "Motivo (obligatorio)",
              })}
            </Label>
            <Textarea
              id="items-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder={translate("orders.items_editor.reason_placeholder", {
                _: "Por ejemplo: el cliente pidió dos unidades más por teléfono",
              })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={save.isPending}
            onClick={() => onOpenChange(false)}
          >
            {translate("shared.actions.cancel", { _: "Cancelar" })}
          </Button>
          <Button
            type="button"
            disabled={!canSave || save.isPending}
            onClick={() => save.mutate()}
          >
            {translate("orders.items_editor.save", { _: "Guardar cambios" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
