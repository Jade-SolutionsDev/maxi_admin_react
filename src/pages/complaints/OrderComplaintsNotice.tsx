import { MessageSquareWarning } from "lucide-react";
import { useCanAccess, useGetList, useTranslate } from "ra-core";
import { Link } from "react-router-dom";

import { ComplaintStatusBadge } from "./ComplaintBadges";
import type { ComplaintStatus } from "./complaintStatus";

interface Fila {
  id: string;
  motiveLabel: string | null;
  status: ComplaintStatus;
  createdAt: string;
}

/**
 * Si este pedido generó alguna queja, se dice aquí (MxH-0064).
 *
 * No se pinta nada cuando no hay ninguna: un aviso permanente de «0 quejas»
 * en todos los pedidos es ruido, y lo que importa es enterarse cuando sí la
 * hay.
 */
export function OrderComplaintsNotice({ orderId }: { orderId: string }) {
  const translate = useTranslate();
  const { canAccess } = useCanAccess({
    resource: "complaints",
    action: "list",
  });

  const { data } = useGetList<Fila>(
    "complaints",
    {
      filter: { orderId },
      pagination: { page: 1, perPage: 10 },
      sort: { field: "createdAt", order: "DESC" },
    },
    { enabled: canAccess === true },
  );

  const quejas = data ?? [];
  if (!canAccess || quejas.length === 0) return null;

  return (
    <section className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
        <MessageSquareWarning size={16} />
        {translate("complaints.delPedido", {
          smart_count: quejas.length,
          _:
            quejas.length === 1
              ? "Este pedido tiene 1 queja"
              : `Este pedido tiene ${quejas.length} quejas`,
        })}
      </h2>
      <ul className="divide-y divide-amber-500/20">
        {quejas.map((queja) => (
          <li key={queja.id}>
            <Link
              to={`/complaints/${queja.id}`}
              className="flex flex-wrap items-center justify-between gap-3 py-2 hover:underline"
            >
              <span className="text-sm text-foreground">
                {queja.motiveLabel || "—"}
              </span>
              <span className="flex items-center gap-3">
                <ComplaintStatusBadge status={queja.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(queja.createdAt).toLocaleDateString()}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
