import { useState } from "react";
import { useDataProvider, useNotify, useRefresh, useTranslate } from "ra-core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Banknote, Check, X } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExtendedDataProvider,
  OrderPaymentStatus,
  Refund,
} from "@/providers/dataProvider";

const REASON_MIN = 5;

const money = (amount: string | null | undefined): string =>
  amount == null ? "—" : `$${Number(amount).toFixed(2)}`;

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleString("es-CU") : "—";

/**
 * Devoluciones de un pedido (MxH-0048).
 *
 * La distinción que gobierna la pantalla: registrar una devolución es un
 * compromiso, confirmarla es decir que el dinero salió. Solo lo segundo puede
 * dejar el pedido en «reembolsado», y por eso pide confirmación aparte.
 */
export function OrderRefundsCard({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: OrderPaymentStatus;
}) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const queryClient = useQueryClient();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");
  const [confirming, setConfirming] = useState<
    | null
    | { kind: "request" }
    | { kind: "complete"; refund: Refund }
    | { kind: "reject"; refund: Refund }
  >(null);
  const [payoutRef, setPayoutRef] = useState("");
  const [payoutTo, setPayoutTo] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const refunds = useQuery({
    queryKey: ["orders", orderId, "refunds"],
    queryFn: () => dataProvider.getRefunds(orderId).then((r) => r.data),
  });
  const summary = useQuery({
    queryKey: ["orders", orderId, "refund-summary"],
    queryFn: () => dataProvider.getRefundSummary(orderId).then((r) => r.data),
  });

  const afterChange = () => {
    void queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
    void refunds.refetch();
    void summary.refetch();
    refresh();
  };
  const errorMessage = (error: unknown) =>
    (error as { body?: { error?: { message?: string } } })?.body?.error
      ?.message ??
    (error as Error)?.message ??
    "Error";
  const fail = (error: unknown) => {
    setConfirming(null);
    notify(errorMessage(error), { type: "error" });
  };

  const request = useMutation({
    mutationFn: () =>
      dataProvider.requestRefund(orderId, {
        amount: amount.trim() ? amount.trim() : undefined,
        reason: reason.trim(),
        destination: destination.trim() || undefined,
      }),
    onSuccess: () => {
      setConfirming(null);
      setAmount("");
      setReason("");
      setDestination("");
      notify(
        translate("orders.refunds.requested", {
          _: "Devolución registrada. El dinero no ha salido todavía.",
        }),
        { type: "info" },
      );
      afterChange();
    },
    onError: fail,
  });

  const complete = useMutation({
    mutationFn: (refund: Refund) =>
      dataProvider.completeRefund(refund.id, {
        destination: payoutTo.trim() || undefined,
        providerRef: payoutRef.trim() || undefined,
      }),
    onSuccess: () => {
      setConfirming(null);
      setPayoutRef("");
      setPayoutTo("");
      notify(
        translate("orders.refunds.completed", {
          _: "Devolución confirmada y avisado el cliente.",
        }),
        { type: "info" },
      );
      afterChange();
    },
    onError: fail,
  });

  const reject = useMutation({
    mutationFn: (refund: Refund) =>
      dataProvider.rejectRefund(refund.id, rejectReason.trim()),
    onSuccess: () => {
      setConfirming(null);
      setRejectReason("");
      afterChange();
    },
    onError: fail,
  });

  const rows = refunds.data ?? [];
  const totals = summary.data;
  const refundable = Number(totals?.refundable ?? 0);
  const canRequest = paymentStatus === "paid" && refundable > 0;
  const reasonOk = reason.trim().length >= REASON_MIN;
  const busy = request.isPending || complete.isPending || reject.isPending;

  if (!canRequest && rows.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 rounded-lg border border-border bg-card">
      <h2 className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold">
        <Banknote size={16} className="text-muted-foreground" />
        {translate("orders.refunds.title", { _: "Devoluciones" })}
      </h2>

      <div className="space-y-4 p-4">
        {totals && (
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">
                {translate("orders.refunds.charged", { _: "Cobrado" })}
              </dt>
              <dd className="font-medium">{money(totals.total)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {translate("orders.refunds.returned", { _: "Devuelto" })}
              </dt>
              <dd className="font-medium">{money(totals.refunded)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {translate("orders.refunds.committed", { _: "Comprometido" })}
              </dt>
              <dd className="font-medium">{money(totals.requested)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {translate("orders.refunds.refundable", {
                  _: "Se puede devolver",
                })}
              </dt>
              <dd className="font-medium">{money(totals.refundable)}</dd>
            </div>
          </dl>
        )}

        {rows.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {rows.map((refund) => (
              <li key={refund.id} className="space-y-1 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{money(refund.amount)}</span>
                  <span className="text-xs text-muted-foreground">
                    {translate(`orders.refunds.status.${refund.status}`, {
                      _: refund.status,
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground">{refund.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {refund.requestedByName ??
                    translate("orders.refunds.bySystem", { _: "El sistema" })}
                  {" · "}
                  {formatDate(refund.requestedAt)}
                  {refund.completedAt
                    ? ` · ${translate("orders.refunds.paidOn", { _: "pagada" })} ${formatDate(refund.completedAt)}`
                    : ""}
                </p>
                {refund.destination && (
                  <p className="font-mono text-xs break-all text-muted-foreground">
                    {refund.destination}
                    {refund.providerRef ? ` · ${refund.providerRef}` : ""}
                  </p>
                )}
                {refund.rejectionReason && (
                  <p className="text-xs text-muted-foreground">
                    {translate("orders.refunds.rejectedBecause", {
                      _: "Rechazada:",
                    })}{" "}
                    {refund.rejectionReason}
                  </p>
                )}
                {refund.status === "requested" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        setPayoutTo(refund.destination ?? "");
                        setConfirming({ kind: "complete", refund });
                      }}
                    >
                      <Check size={14} />
                      {translate("orders.refunds.markPaid", {
                        _: "Confirmar que salió",
                      })}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setConfirming({ kind: "reject", refund })}
                    >
                      <X size={14} />
                      {translate("orders.refunds.reject", { _: "Rechazar" })}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {canRequest && (
          <div className="space-y-3 border-t border-border pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="refund-amount">
                  {translate("orders.refunds.amount", { _: "Importe (USD)" })}
                </Label>
                <Input
                  id="refund-amount"
                  inputMode="decimal"
                  placeholder={totals?.refundable ?? ""}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {translate("orders.refunds.amountHint", {
                    _: "Vacío devuelve todo lo que queda.",
                  })}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="refund-destination">
                  {translate("orders.refunds.destination", {
                    _: "Dirección USDT (BEP20)",
                  })}
                </Label>
                <Input
                  id="refund-destination"
                  placeholder="0x…"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {translate("orders.refunds.destinationHint", {
                    _: "Si todavía no la tienes, se la pedimos al cliente por correo.",
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refund-reason">
                {translate("orders.refunds.reason", {
                  _: "Motivo (obligatorio)",
                })}
              </Label>
              <Textarea
                id="refund-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button
              disabled={!reasonOk || busy}
              onClick={() => setConfirming({ kind: "request" })}
            >
              {translate("orders.refunds.request", {
                _: "Registrar devolución",
              })}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          {confirming?.kind === "request" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {translate("orders.refunds.confirmRequest", {
                    _: "¿Registrar esta devolución?",
                  })}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm">
                    <p>
                      {translate("orders.refunds.confirmRequestBody", {
                        _: "Queda comprometida por",
                      })}{" "}
                      <strong>
                        {money(amount.trim() || totals?.refundable)}
                      </strong>
                      .
                    </p>
                    <p className="text-muted-foreground">
                      {translate("orders.refunds.confirmRequestNote", {
                        _: "El dinero no sale ahora: el pedido sigue cobrado hasta que confirmes el envío.",
                      })}
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {translate("ra.action.cancel", { _: "Cancelar" })}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    request.mutate();
                  }}
                >
                  {translate("orders.refunds.request", {
                    _: "Registrar devolución",
                  })}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}

          {confirming?.kind === "complete" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  {translate("orders.refunds.confirmComplete", {
                    _: "¿El dinero ya salió?",
                  })}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3 text-sm">
                    <p>
                      {translate("orders.refunds.confirmCompleteBody", {
                        _: "Esto da por devueltos",
                      })}{" "}
                      <strong>{money(confirming.refund.amount)}</strong>{" "}
                      {translate("orders.refunds.confirmCompleteTail", {
                        _: "y avisa al cliente por correo. Confírmalo solo si ya hiciste la transferencia.",
                      })}
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="payout-to">
                        {translate("orders.refunds.destination", {
                          _: "Dirección USDT (BEP20)",
                        })}
                      </Label>
                      <Input
                        id="payout-to"
                        placeholder="0x…"
                        value={payoutTo}
                        onChange={(e) => setPayoutTo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="payout-ref">
                        {translate("orders.refunds.providerRef", {
                          _: "Referencia de la transacción",
                        })}
                      </Label>
                      <Input
                        id="payout-ref"
                        value={payoutRef}
                        onChange={(e) => setPayoutRef(e.target.value)}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {translate("ra.action.cancel", { _: "Cancelar" })}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={!payoutTo.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    complete.mutate(confirming.refund);
                  }}
                >
                  {translate("orders.refunds.markPaid", {
                    _: "Confirmar que salió",
                  })}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}

          {confirming?.kind === "reject" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {translate("orders.refunds.confirmReject", {
                    _: "¿Rechazar esta devolución?",
                  })}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      {translate("orders.refunds.confirmRejectNote", {
                        _: "Queda en la ficha con el motivo; no se borra.",
                      })}
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="reject-reason">
                        {translate("orders.refunds.reason", {
                          _: "Motivo (obligatorio)",
                        })}
                      </Label>
                      <Textarea
                        id="reject-reason"
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {translate("ra.action.cancel", { _: "Cancelar" })}
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={rejectReason.trim().length < REASON_MIN}
                  onClick={(e) => {
                    e.preventDefault();
                    reject.mutate(confirming.refund);
                  }}
                >
                  {translate("orders.refunds.reject", { _: "Rechazar" })}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
