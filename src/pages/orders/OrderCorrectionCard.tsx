import { useState } from "react";
import { useDataProvider, useNotify, useRefresh, useTranslate } from "ra-core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ShieldAlert, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  ExtendedDataProvider,
  OrderPaymentStatus,
  OrderStatus,
  PaymentAttempt,
} from "@/providers/dataProvider";
import { ProviderStatusBadge } from "./OrderBadges";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type ProviderChargeStatus,
} from "./orderStatus";

const REASON_MIN = 5;

/**
 * Corrección de superadministrador (capa 2 de la edición de pedidos): cualquier
 * estado de pedido y de pago, en cualquier dirección, y quitar intentos de pago
 * que nunca se completaron. La API aplica el efecto sobre el stock y lo anota
 * todo en el historial con el motivo. Solo se muestra a SUPER_ADMIN.
 */
export function OrderCorrectionCard({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
}) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const queryClient = useQueryClient();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  const [nextStatus, setNextStatus] = useState<OrderStatus>(status);
  const [nextPayment, setNextPayment] =
    useState<OrderPaymentStatus>(paymentStatus);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState<
    null | { kind: "correct" } | { kind: "remove"; attempt: PaymentAttempt }
  >(null);

  const attempts = useQuery({
    queryKey: ["orders", orderId, "payment-attempts"],
    queryFn: () => dataProvider.getPaymentAttempts(orderId).then((r) => r.data),
  });

  const afterChange = () => {
    void queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
    refresh();
  };
  const errorMessage = (error: unknown) =>
    (error as { body?: { error?: { message?: string } } })?.body?.error
      ?.message ??
    (error as Error)?.message ??
    "Error";

  const correct = useMutation({
    mutationFn: () =>
      dataProvider.correctOrder(orderId, {
        status: nextStatus !== status ? nextStatus : undefined,
        paymentStatus: nextPayment !== paymentStatus ? nextPayment : undefined,
        reason: reason.trim(),
      }),
    onSuccess: () => {
      setConfirming(null);
      setReason("");
      notify("orders.correction.applied", {
        type: "success",
        messageArgs: { _: "Corrección aplicada" },
      });
      afterChange();
    },
    onError: (error: unknown) => {
      setConfirming(null);
      notify(errorMessage(error), { type: "error" });
    },
  });

  const remove = useMutation({
    mutationFn: (attempt: PaymentAttempt) =>
      dataProvider.removePaymentAttempt(orderId, attempt.id, reason.trim()),
    onSuccess: () => {
      setConfirming(null);
      setReason("");
      notify("orders.correction.attempt_removed", {
        type: "success",
        messageArgs: { _: "Intento de pago eliminado" },
      });
      afterChange();
    },
    onError: (error: unknown) => {
      setConfirming(null);
      notify(errorMessage(error), { type: "error" });
    },
  });

  const changed = nextStatus !== status || nextPayment !== paymentStatus;
  const reasonOk = reason.trim().length >= REASON_MIN;
  const busy = correct.isPending || remove.isPending;

  return (
    <section className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/5">
      <h2 className="flex items-center gap-2 border-b border-amber-500/30 px-4 py-3 text-sm font-semibold text-foreground">
        <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400" />
        {translate("orders.correction.title", {
          _: "Corregir estado (superadministrador)",
        })}
      </h2>
      <div className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">
          {translate("orders.correction.hint", {
            _: "Cualquier estado, en cualquier dirección. El stock se ajusta solo: al salir de cancelado se vuelve a apartar; al entrar, se libera; al pasar de confirmado en adelante, se descuenta; al retroceder, vuelve al almacén. Si el pedido queda pendiente y sin pagar, el plazo de pago empieza de nuevo. Todo queda en el historial con tu nombre y el motivo.",
          })}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="correction-status">
              {translate("orders.correction.status", {
                _: "Estado del pedido",
              })}
            </Label>
            <Select
              value={nextStatus}
              onValueChange={(v) => setNextStatus(v as OrderStatus)}
            >
              <SelectTrigger id="correction-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {translate(`orders.status.${s}`, { _: s })}
                    {s === status
                      ? ` (${translate("orders.correction.current", { _: "actual" })})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="correction-payment">
              {translate("orders.correction.payment", { _: "Estado del pago" })}
            </Label>
            <Select
              value={nextPayment}
              onValueChange={(v) => setNextPayment(v as OrderPaymentStatus)}
            >
              <SelectTrigger id="correction-payment" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {translate(`orders.paymentStatus.${p}`, { _: p })}
                    {p === paymentStatus
                      ? ` (${translate("orders.correction.current", { _: "actual" })})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="correction-reason">
            {translate("orders.correction.reason", {
              _: "Motivo (obligatorio)",
            })}
          </Label>
          <Textarea
            id="correction-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder={translate("orders.correction.reason_placeholder", {
              _: "Por ejemplo: el cliente pagó por transferencia y se marcó por error",
            })}
          />
          {!reasonOk && reason.length > 0 && (
            <p className="text-xs text-destructive">
              {translate("orders.correction.reason_short", {
                _: "Escribe al menos cinco caracteres.",
              })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={!changed || !reasonOk || busy}
            onClick={() => setConfirming({ kind: "correct" })}
          >
            {translate("orders.correction.apply", { _: "Aplicar corrección" })}
          </Button>
          {changed && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setNextStatus(status);
                setNextPayment(paymentStatus);
              }}
            >
              {translate("orders.correction.reset", { _: "Descartar" })}
            </Button>
          )}
        </div>

        <div className="border-t border-amber-500/30 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            {translate("orders.correction.attempts", { _: "Intentos de pago" })}
          </h3>
          {attempts.isPending ? (
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          ) : !attempts.data || attempts.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {translate("orders.correction.no_attempts", {
                _: "Sin intentos de pago.",
              })}
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-background">
              {attempts.data.map((attempt) => {
                const succeeded = attempt.status === "SUCCEEDED";
                return (
                  <li
                    key={attempt.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {attempt.provider}
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {attempt.reference}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(attempt.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProviderStatusBadge
                        status={attempt.status as ProviderChargeStatus}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={succeeded || !reasonOk || busy}
                        title={
                          succeeded
                            ? translate("orders.correction.succeeded_locked", {
                                _: "Un cobro con éxito no se quita: se reembolsa.",
                              })
                            : !reasonOk
                              ? translate("orders.correction.reason_first", {
                                  _: "Escribe el motivo arriba.",
                                })
                              : undefined
                        }
                        onClick={() =>
                          setConfirming({ kind: "remove", attempt })
                        }
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        {translate("orders.correction.remove", { _: "Quitar" })}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 sm:mx-0">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-center text-lg sm:text-left">
              {confirming?.kind === "remove"
                ? translate("orders.correction.confirm_remove_title", {
                    _: "Quitar intento de pago",
                  })
                : translate("orders.correction.confirm_title", {
                    _: "Aplicar corrección",
                  })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center sm:text-left">
              {confirming?.kind === "remove"
                ? translate("orders.correction.confirm_remove_description", {
                    _: "Se elimina el intento %{reference} (%{provider}). El pedido dejará de mostrarlo. ¿Continuar?",
                    reference: confirming.attempt.reference,
                    provider: confirming.attempt.provider,
                  })
                : translate("orders.correction.confirm_description", {
                    _: "Pedido: %{from} → %{to}. Pago: %{pfrom} → %{pto}. El stock se ajustará según el cambio. ¿Continuar?",
                    from: translate(`orders.status.${status}`, { _: status }),
                    to: translate(`orders.status.${nextStatus}`, {
                      _: nextStatus,
                    }),
                    pfrom: translate(`orders.paymentStatus.${paymentStatus}`, {
                      _: paymentStatus,
                    }),
                    pto: translate(`orders.paymentStatus.${nextPayment}`, {
                      _: nextPayment,
                    }),
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel disabled={busy}>
              {translate("shared.actions.cancel", { _: "Cancelar" })}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={() => {
                if (!confirming) return;
                if (confirming.kind === "remove")
                  remove.mutate(confirming.attempt);
                else correct.mutate();
              }}
            >
              {translate("shared.actions.confirm_action", { _: "Confirmar" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
