import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useDataProvider,
  useGetOne,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { Eye, ImageOff, Package, PackageSearch, Pencil, Warehouse } from "lucide-react";

import { BooleanField, DateField, ReferenceField } from "@/components/admin";
import { buttonVariants } from "@/components/ui/button";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Prices are shown in USD to match the products list.
const money = (value: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border/50 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm wrap-break-word">{children}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-6 w-full rounded bg-muted animate-pulse" />
      ))}
    </div>
  );
}

/**
 * URL-routed read-only detail view for a product, mounted at `/products/:id`
 * inside the products layout's <Outlet>. Closing navigates back to the list.
 */
type TabKey = "details" | "stock";

/** Per-storage stock breakdown for a product (fetched lazily). */
function StockByStorageTab({
  productId,
  measureUnit,
  enabled,
}: {
  productId: string;
  measureUnit: string;
  enabled: boolean;
}) {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["product-stock", productId],
    queryFn: () => dataProvider.getProductStock(productId).then((r) => r.data),
    enabled,
  });

  if (isLoading) {
    return <div className="h-40 rounded-lg bg-muted animate-pulse" />;
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <PackageSearch className="mb-3 h-9 w-9 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {translate("products.stock.empty_title", { _: "Sin existencias" })}
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {translate("products.stock.empty_hint", {
            _: "Este producto no tiene existencias registradas en ningún almacén.",
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
              <p className="truncate font-medium text-foreground">
                {r.locationName}
              </p>
              {r.provinces.length > 0 && (
                <p className="truncate text-xs text-muted-foreground">
                  {r.provinces.join(", ")}
                </p>
              )}
            </div>
          </div>
          <span className="shrink-0 font-medium tabular-nums">
            {r.quantity} {measureUnit}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ProductDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>("details");

  const onClose = () => navigate("/products");
  const { data: record, isLoading } = useGetOne(
    "products",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const imageUrl = record?.imageUrl as string | null | undefined;
  const measureUnit = (record?.measureUnit as string) || "";

  const tabs: { key: TabKey; label: string; fallback: string; icon: typeof Package }[] = [
    { key: "details", label: "products.tabs.details", fallback: "Detalles", icon: Package },
    { key: "stock", label: "products.tabs.stock", fallback: "Existencias por almacén", icon: Warehouse },
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {(record?.name as string) ??
              translate("shared.actions.view", { _: "Details" })}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {(record?.sku as string) ?? ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !record ? (
          <DetailSkeleton />
        ) : (
          <>
            {/* Tab strip */}
            <div role="tablist" className="flex gap-1 border-b border-border">
              {tabs.map(({ key, label, fallback, icon: Icon }) => {
                const isActive = tab === key;
                return (
                  <button
                    key={key}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => setTab(key)}
                    className={cn(
                      "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {translate(label, { _: fallback })}
                  </button>
                );
              })}
            </div>

            {tab === "details" && (
              <RecordContextProvider value={record}>
                <div className="mt-2 flex justify-center">
                  <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={record.name as string}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <dl className="mt-2">
                  <DetailRow label={translate("resources.categories.name")}>
                    <ReferenceField source="categoryId" reference="categories" />
                  </DetailRow>
                  <DetailRow label={translate("list.fields.description")}>
                    <span className="whitespace-pre-wrap">
                      {(record.description as string) || "—"}
                    </span>
                  </DetailRow>
                  <DetailRow label={translate("list.fields.format")}>
                    {(record.format as string) || "—"}
                  </DetailRow>
                  <DetailRow label={translate("list.fields.measureUnit")}>
                    {measureUnit || "—"}
                  </DetailRow>
                  <DetailRow
                    label={translate("list.fields.totalStock", {
                      _: "Existencia total",
                    })}
                  >
                    <span className="font-medium">
                      {(record.amount as number) ?? 0} {measureUnit}
                    </span>
                  </DetailRow>
                  <DetailRow label={translate("list.fields.expiryDate")}>
                    {record.expiryDate ? <DateField source="expiryDate" /> : "—"}
                  </DetailRow>
                  <DetailRow label={translate("list.fields.basePrice")}>
                    {money(record.basePrice)}
                  </DetailRow>
                  <DetailRow label={translate("list.fields.discount")}>
                    {Number(record.discount ?? 0)}%
                  </DetailRow>
                  <DetailRow label={translate("list.fields.finalPrice")}>
                    <span className="font-medium text-primary">
                      {money(record.finalPrice)}
                    </span>
                  </DetailRow>
                  <DetailRow label={translate("list.fields.featured")}>
                    <BooleanField source="featured" />
                  </DetailRow>
                  <DetailRow label={translate("list.fields.isActive")}>
                    <BooleanField source="isActive" />
                  </DetailRow>
                  <DetailRow label={translate("list.fields.sortOrder")}>
                    {(record.sortOrder as number) ?? 0}
                  </DetailRow>
                  <DetailRow label={translate("list.fields.createdAt")}>
                    <DateField source="createdAt" showTime />
                  </DetailRow>
                </dl>
              </RecordContextProvider>
            )}

            {tab === "stock" && (
              <div className="mt-3">
                <StockByStorageTab
                  productId={record.id as string}
                  measureUnit={measureUnit}
                  enabled={tab === "stock"}
                />
              </div>
            )}
          </>
        )}

        {record && (
          <DialogFooter>
            <Link
              to={`/products/edit/${record.id}`}
              className={cn(buttonVariants())}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {translate("shared.actions.edit", { _: "Edit" })}
            </Link>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Eye-icon row action that deep-links to the product detail route
 * `/products/:id`. Read action → all users.
 */
export function ProductViewButton() {
  const record = useRecordContext();
  const translate = useTranslate();
  const label = translate("shared.actions.view", { _: "View details" });

  if (!record) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/products/${record.id}`}
            aria-label={label}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-8 w-8 text-muted-foreground hover:text-foreground",
            )}
          >
            <Eye size={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
