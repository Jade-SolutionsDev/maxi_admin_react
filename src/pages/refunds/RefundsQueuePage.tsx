import { useState } from "react";
import { Link } from "react-router-dom";
import { useDataProvider, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Banknote, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  ExtendedDataProvider,
  Refund,
  RefundStatus,
} from "@/providers/dataProvider";

const TABS: RefundStatus[] = ["requested", "completed", "rejected"];

const money = (amount: string): string => `$${Number(amount).toFixed(2)}`;
const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleDateString("es-CU") : "—";

/**
 * La cola de devoluciones: todo lo que espera a que alguien mueva el dinero,
 * lo más viejo primero.
 *
 * Confirmar y rechazar se hacen desde la ficha del pedido, que es donde se ve
 * el contexto completo; aquí se ve qué falta por atender y desde cuándo.
 */
export default function RefundsQueuePage() {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const [status, setStatus] = useState<RefundStatus>("requested");

  const { data, isPending } = useQuery({
    queryKey: ["refunds", status],
    queryFn: () => dataProvider.getRefundQueue(status).then((r) => r.data),
  });

  const rows: Refund[] = data ?? [];
  const pendingTotal = rows.reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <Banknote size={20} className="text-muted-foreground" />
          {translate("refunds.title", { _: "Devoluciones" })}
        </h1>
        {status === "requested" && rows.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {translate("refunds.pendingTotal", { _: "Pendiente de pagar:" })}{" "}
            <strong className="text-foreground">
              {money(String(pendingTotal))}
            </strong>
          </p>
        )}
      </header>

      <div className="mb-4 flex gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={tab === status ? "default" : "outline"}
            onClick={() => setStatus(tab)}
          >
            {translate(`orders.refunds.status.${tab}`, { _: tab })}
          </Button>
        ))}
      </div>

      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          {translate("refunds.empty", {
            _: "No hay devoluciones en este estado.",
          })}
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {rows.map((refund) => (
            <li key={refund.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/orders/${refund.orderId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {refund.orderNumber ?? refund.orderId}
                    </Link>
                    {refund.paidAfterExpiryOutOfStock && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle size={12} />
                        {translate("refunds.outOfStock", {
                          _: "Pagó y no había mercancía",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {refund.clientName ?? "—"}
                    {refund.clientEmail ? ` · ${refund.clientEmail}` : ""}
                  </p>
                  <p className="text-sm">{refund.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {translate("refunds.requestedOn", { _: "Registrada" })}{" "}
                    {formatDate(refund.requestedAt)}
                    {" · "}
                    {refund.requestedByName ??
                      translate("orders.refunds.bySystem", {
                        _: "El sistema",
                      })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold">
                    {money(refund.amount)}
                  </p>
                  {refund.orderTotal && (
                    <p className="text-xs text-muted-foreground">
                      {translate("orders.refunds.charged", { _: "Cobrado" })}{" "}
                      {money(refund.orderTotal)}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
