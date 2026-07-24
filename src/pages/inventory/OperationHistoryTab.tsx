import { useDataProvider, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  CircleCheck,
  CircleX,
  ClipboardList,
  Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ExtendedDataProvider,
  InventoryHistoryEvent,
} from "@/providers/dataProvider";

// Icon + delta sign + tone per event type.
const EVENT_META: Record<
  string,
  { icon: typeof ArrowDownToLine; sign: "+" | "-" | ""; tone: string }
> = {
  IN: {
    icon: ArrowDownToLine,
    sign: "+",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  OUT: {
    icon: ArrowUpFromLine,
    sign: "-",
    tone: "text-red-600 dark:text-red-400",
  },
  TRANSFER: {
    icon: ArrowLeftRight,
    sign: "",
    tone: "text-blue-600 dark:text-blue-400",
  },
  reserved: {
    icon: Clock,
    sign: "-",
    tone: "text-amber-600 dark:text-amber-400",
  },
  confirmed: { icon: CircleCheck, sign: "-", tone: "text-slate-500" },
  cancelled: { icon: CircleX, sign: "+", tone: "text-slate-500" },
};

const DATE_FMT = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Stock change timeline, keyed by product (inventory detail) or by location
 * (storage detail). Lazily fetched via the custom dataProvider method.
 */
export function OperationHistoryTab({
  productId,
  locationId,
  enabled = true,
}: {
  productId?: string;
  locationId?: string;
  enabled?: boolean;
}) {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  const { data: events, isLoading } = useQuery({
    queryKey: ["inventory-history", productId ?? "", locationId ?? ""],
    queryFn: () =>
      dataProvider
        .getInventoryHistory({ productId, locationId })
        .then((r) => r.data),
    enabled: enabled && Boolean(productId || locationId),
  });

  if (isLoading) {
    return <div className="h-40 rounded-lg bg-muted animate-pulse" />;
  }

  const rows = events ?? [];
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <ClipboardList className="mb-3 h-9 w-9 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {translate("inventory.history.empty_title", {
            _: "Sin movimientos",
          })}
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {translate("inventory.history.empty_hint", {
            _: "Aún no se registran cambios de existencia.",
          })}
        </p>
      </div>
    );
  }

  // Location history spans products → show the product name per row.
  const showProduct = Boolean(locationId);

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {rows.map((e: InventoryHistoryEvent, i: number) => {
        const meta = EVENT_META[e.type] ?? {
          icon: ClipboardList,
          sign: "" as const,
          tone: "text-muted-foreground",
        };
        const Icon = meta.icon;
        const place =
          e.type === "TRANSFER" && e.targetLocationName
            ? `${e.locationName ?? "?"} → ${e.targetLocationName}`
            : (e.locationName ?? "");
        const who = e.actorName
          ? e.actorName
          : e.orderId
            ? `${translate("inventory.history.order", { _: "Pedido" })} #${e.orderId.slice(0, 8)}`
            : null;
        return (
          <li key={i} className="flex items-start gap-3 px-4 py-3">
            <div className={cn("mt-0.5 shrink-0", meta.tone)}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-medium text-foreground">
                  {translate(`inventory.history.type.${e.type}`, { _: e.type })}
                </span>
                {showProduct && (
                  <span className="truncate text-sm text-muted-foreground">
                    · {e.productName}
                  </span>
                )}
                <span
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    meta.tone,
                  )}
                >
                  {meta.sign}
                  {e.quantity}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {place}
                {who ? ` · ${who}` : ""}
              </div>
              {e.note ? (
                <p className="mt-0.5 text-xs italic text-muted-foreground">
                  {e.note}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
              {DATE_FMT.format(new Date(e.createdAt))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
