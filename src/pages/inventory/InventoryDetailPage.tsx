import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDataProvider, useGetOne, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ClipboardList,
  ImageOff,
  Warehouse,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { OperationHistoryTab } from "./OperationHistoryTab";

type TabKey = "storages" | "history";

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", tone)}>{value}</p>
    </div>
  );
}

function StorageBreakdown({
  productId,
  measureUnit,
}: {
  productId: string;
  measureUnit: string;
}) {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["product-stock", productId],
    queryFn: () => dataProvider.getProductStock(productId).then((r) => r.data),
  });

  if (isLoading) {
    return <div className="h-40 rounded-lg bg-muted animate-pulse" />;
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <Warehouse className="mb-3 h-9 w-9 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {translate("inventory.detail.empty_title", {
            _: "Sin existencias",
          })}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {rows.map((r) => (
        <li
          key={r.locationId}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Warehouse className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/stock-locations/${r.locationId}`}
                  className="truncate font-medium text-foreground hover:text-primary hover:underline"
                >
                  {r.locationName}
                </Link>
                {!r.isActive && (
                  <Badge
                    variant="outline"
                    className="border-muted-foreground/30 text-muted-foreground"
                  >
                    {translate("stockLocations.status.inactive", {
                      _: "Inactivo",
                    })}
                  </Badge>
                )}
              </div>
              {r.provinces.length > 0 && (
                <p className="truncate text-xs text-muted-foreground">
                  {r.provinces.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 text-sm tabular-nums">
            <span title={translate("list.fields.real", { _: "Existencia" })}>
              {r.quantity} {measureUnit}
            </span>
            <span
              className="text-amber-600 dark:text-amber-400"
              title={translate("list.fields.reserved", { _: "Reservado" })}
            >
              -{r.reservedQuantity}
            </span>
            <span
              className={cn(
                "font-medium",
                r.available === 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
              title={translate("list.fields.available", { _: "Disponible" })}
            >
              {r.available}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function InventoryDetailPage() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [tab, setTab] = useState<TabKey>("storages");

  const { data: product, isLoading } = useGetOne(
    "products",
    { id: productId as string },
    { enabled: Boolean(productId), onError: () => navigate("/inventory") },
  );

  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { data: stock } = useQuery({
    queryKey: ["product-stock", productId],
    queryFn: () =>
      dataProvider.getProductStock(productId as string).then((r) => r.data),
    enabled: Boolean(productId),
  });

  const totals = (stock ?? []).reduce(
    (acc, r) => ({
      real: acc.real + r.quantity,
      reserved: acc.reserved + r.reservedQuantity,
      available: acc.available + r.available,
    }),
    { real: 0, reserved: 0, available: 0 },
  );

  const measureUnit = (product?.measureUnit as string) || "";
  const imageUrl = product?.imageUrl as string | null | undefined;

  const tabs: { key: TabKey; label: string; icon: typeof Warehouse }[] = [
    { key: "storages", label: "inventory.tabs.storages", icon: Warehouse },
    { key: "history", label: "inventory.tabs.history", icon: ClipboardList },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-0.5 h-8 w-8"
          onClick={() => navigate("/inventory")}
          aria-label={translate("shared.actions.back", { _: "Back" })}
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-foreground">
              {(product?.name as string) ??
                translate("resources.inventory.name", { _: "Inventario" })}
            </h1>
            <Link
              to={`/products/${productId}`}
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              {translate("inventory.actions.view_product", {
                _: "Ver producto",
              })}
            </Link>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile
          label={translate("list.fields.real", { _: "Existencia" })}
          value={totals.real}
        />
        <StatTile
          label={translate("list.fields.reserved", { _: "Reservado" })}
          value={totals.reserved}
          tone="text-amber-600 dark:text-amber-400"
        />
        <StatTile
          label={translate("list.fields.available", { _: "Disponible" })}
          value={totals.available}
          tone="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Tab strip */}
      <div role="tablist" className="mb-6 flex gap-1 border-b border-border">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setTab(key)}
              className={cn(
                "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {translate(label)}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="h-40 rounded-lg bg-muted animate-pulse" />
      ) : tab === "storages" ? (
        <StorageBreakdown
          productId={productId as string}
          measureUnit={measureUnit}
        />
      ) : (
        <OperationHistoryTab
          productId={productId as string}
          enabled={tab === "history"}
        />
      )}
    </div>
  );
}
