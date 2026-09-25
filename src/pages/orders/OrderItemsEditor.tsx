import { useMemo, useState } from "react";
import {
  useDataProvider,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExtendedDataProvider,
  OrderLinePayload,
  OrderPaymentStatus,
  OrderStatus,
} from "@/providers/dataProvider";
import { SelectorDeLineas, type EditableLine } from "./SelectorDeLineas";

export type { EditableLine } from "./SelectorDeLineas";

const REASON_MIN = 5;

// El selector tiene su propio formateador para lo que enseña (líneas y
// búsqueda); este es el de este editor para su propio resumen de totales.
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setLines(items);
          setReason("");
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
          <SelectorDeLineas lines={lines} onChange={setLines} />

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
