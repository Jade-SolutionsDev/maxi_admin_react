import { useDataProvider, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  CircleDollarSign,
  Clock,
  FileCheck,
  History,
  PackagePlus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ExtendedDataProvider,
  OrderEvent,
} from "@/providers/dataProvider";

/**
 * Línea de tiempo del pedido: cada cosa que le pasó, quién lo hizo y cuándo.
 * Es la contraparte visible de la tabla `order_events` de la API, y la base
 * para que la administración pueda editar pedidos sin perder el rastro.
 */
export function OrderHistorySection({ orderId }: { orderId: string }) {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { data, isPending, isError } = useQuery({
    queryKey: ["orders", orderId, "events"],
    queryFn: () => dataProvider.getOrderEvents(orderId).then((r) => r.data),
  });

  return (
    <section className="mb-6 rounded-lg border border-border">
      <h2 className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
        <History size={16} />
        {translate("orders.history.title", { _: "Historial" })}
      </h2>
      {isPending ? (
        <div className="space-y-2 p-4">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ) : isError ? (
        <p className="p-4 text-sm text-destructive">
          {translate("orders.history.error", {
            _: "No se pudo cargar el historial.",
          })}
        </p>
      ) : !data || data.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {translate("orders.history.empty", {
            _: "Sin movimientos registrados. El historial se guarda desde que se activó esta función; los pedidos anteriores no lo tienen.",
          })}
        </p>
      ) : (
        <ol className="divide-y divide-border">
          {[...data].reverse().map((event) => (
            <HistoryRow key={event.id} event={event} />
          ))}
        </ol>
      )}
    </section>
  );
}

const KIND_ICON: Record<OrderEvent["kind"], typeof History> = {
  created: ShoppingBag,
  status_changed: Wrench,
  payment_status_changed: CircleDollarSign,
  payment_attempt: CircleDollarSign,
  proof_submitted: FileCheck,
  reinstated: RotateCcw,
  expired: Clock,
  payment_attempt_removed: Trash2,
  items_changed: PackagePlus,
  total_changed: CircleDollarSign,
};

/** Un cambio de línea, tal como lo guarda la API en `meta.changes`. */
interface LineChange {
  type: "added" | "removed" | "quantity" | "price";
  name?: string;
  quantity?: number;
  unitPrice?: number;
  from?: string | number;
  to?: string | number;
}

function changeLabel(
  translate: ReturnType<typeof useTranslate>,
  change: LineChange,
): string {
  const name = change.name ?? "";
  switch (change.type) {
    case "added":
      return translate("orders.history.line_added", {
        _: "Se añadió %{name} × %{quantity}",
        name,
        quantity: change.quantity ?? 0,
      });
    case "removed":
      return translate("orders.history.line_removed", {
        _: "Se quitó %{name} (%{quantity})",
        name,
        quantity: change.quantity ?? 0,
      });
    case "quantity":
      return translate("orders.history.line_quantity", {
        _: "%{name}: %{from} → %{to} unidades",
        name,
        from: String(change.from ?? ""),
        to: String(change.to ?? ""),
      });
    default:
      return translate("orders.history.line_price", {
        _: "%{name}: precio %{from} → %{to}",
        name,
        from: String(change.from ?? ""),
        to: String(change.to ?? ""),
      });
  }
}

function HistoryRow({ event }: { event: OrderEvent }) {
  const translate = useTranslate();
  const Icon = KIND_ICON[event.kind] ?? History;
  const ActorIcon = event.actorKind === "system" ? Bot : UserRound;
  const actor =
    event.actorKind === "system"
      ? translate("orders.history.actor.system", { _: "Sistema" })
      : (event.actorName ??
        translate(`orders.history.actor.${event.actorKind}`, {
          _: event.actorKind,
        }));
  const meta = event.meta ?? {};
  const provider =
    typeof meta.methodLabel === "string"
      ? meta.methodLabel
      : typeof meta.provider === "string"
        ? meta.provider
        : null;

  return (
    <li className="flex gap-3 px-4 py-3">
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          event.actorKind === "system"
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary",
        )}
        aria-hidden="true"
      >
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {translate(`orders.history.kind.${event.kind}`, { _: event.kind })}
          {meta.correction === true && (
            <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {translate("orders.history.correction", { _: "corrección" })}
            </span>
          )}
          {event.field && event.previousValue && event.nextValue && (
            <span className="font-normal text-muted-foreground">
              {" · "}
              {valueLabel(translate, event.field, event.previousValue)}
              {" → "}
              {valueLabel(translate, event.field, event.nextValue)}
            </span>
          )}
          {!event.previousValue && event.nextValue && event.field && (
            <span className="font-normal text-muted-foreground">
              {" · "}
              {valueLabel(translate, event.field, event.nextValue)}
            </span>
          )}
        </p>
        {Array.isArray(meta.changes) && meta.changes.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
            {(meta.changes as LineChange[]).map((change, index) => (
              <li key={`${change.type}-${change.name ?? index}`}>
                {changeLabel(translate, change)}
              </li>
            ))}
          </ul>
        )}
        {typeof meta.paidDifference === "string" && (
          <p className="mt-1 text-xs font-medium text-destructive">
            {Number(meta.paidDifference) > 0
              ? translate("orders.history.paid_more", {
                  _: "El pedido estaba pagado: quedan %{diff} por cobrar.",
                  diff: meta.paidDifference,
                })
              : translate("orders.history.paid_less", {
                  _: "El pedido estaba pagado: hay que devolver %{diff}.",
                  diff: String(Math.abs(Number(meta.paidDifference))),
                })}
          </p>
        )}
        {Boolean(event.reason || provider || meta.reference) && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[
              event.reason,
              provider &&
                translate("orders.history.via", {
                  _: "vía %{provider}",
                  provider,
                }),
              typeof meta.reference === "string" &&
                translate("orders.history.reference", {
                  _: "ref. %{reference}",
                  reference: meta.reference,
                }),
              meta.direct === true &&
                translate("orders.history.direct", { _: "salto directo" }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ActorIcon size={12} aria-hidden="true" />
          <span>{actor}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={event.createdAt}>
            {new Date(event.createdAt).toLocaleString()}
          </time>
        </p>
      </div>
    </li>
  );
}

function valueLabel(
  translate: ReturnType<typeof useTranslate>,
  field: string,
  value: string,
): string {
  if (field === "status") {
    return translate(`orders.status.${value}`, { _: value });
  }
  if (field === "paymentStatus") {
    return translate(`orders.paymentStatus.${value}`, { _: value });
  }
  if (field === "cancellationReason") {
    return translate(`orders.cancellationReason.${value}`, { _: value });
  }
  return value;
}
