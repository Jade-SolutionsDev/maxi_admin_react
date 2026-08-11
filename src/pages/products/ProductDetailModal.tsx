import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useDataProvider,
  useDelete,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useQuery } from "@tanstack/react-query";
import {
  AlignLeft,
  ArrowUpDown,
  Box,
  CalendarDays,
  CircleDot,
  DollarSign,
  Eye,
  Image as ImageIcon,
  ImageOff,
  Layers,
  Package,
  PackageSearch,
  Pencil,
  Percent,
  Ruler,
  Sparkles,
  Tag,
  Trash2,
  Warehouse,
} from "lucide-react";

import {
  ConfirmActionButton,
  DateField,
  DetailField,
  DetailImageCard,
  DetailTextBlock,
  FormSection,
  ReferenceField,
  ResourceDetailModal,
} from "@/components/admin";
import { buttonVariants } from "@/components/ui/button";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { cn } from "@/lib/utils";

// Prices are shown in USD to match the products list.
const money = (value: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));

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

/**
 * URL-routed read-only detail view for a product, mounted at `/products/:id`
 * inside the products layout's <Outlet>. Closing navigates back to the list.
 *
 * The "Detalles" tab mirrors ProductFormModal's sections, icons and field
 * geometry so opening Edit from here doesn't reflow the dialog.
 */
export function ProductDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>("details");

  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: removing }] = useDelete();

  const onClose = () => navigate("/products");
  const { data: record, isLoading } = useGetOne(
    "products",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const remove = () =>
    deleteOne(
      "products",
      { id: record!.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("shared.actions.delete_success", { type: "info" });
          refresh();
          navigate("/products");
        },
        // Surface the backend's message (e.g. the 409 "still has stock" guard).
        onError: (error: unknown) => {
          const backendMessage = (
            error as { body?: { error?: { message?: string } } }
          )?.body?.error?.message;
          notify(backendMessage ?? translate("shared.actions.error"), {
            type: "error",
          });
        },
      },
    );

  const imageUrl = record?.imageUrl as string | null | undefined;
  const measureUnit = (record?.measureUnit as string) || "";

  const tabs: {
    key: TabKey;
    label: string;
    fallback: string;
    icon: typeof Package;
  }[] = [
    {
      key: "details",
      label: "products.tabs.details",
      fallback: "Detalles",
      icon: Package,
    },
    {
      key: "stock",
      label: "products.tabs.stock",
      fallback: "Existencias por almacén",
      icon: Warehouse,
    },
  ];

  return (
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={<Package className="h-5 w-5" />}
      title={
        (record?.name as string) ??
        translate("shared.actions.view", { _: "Details" })
      }
      subtitle={(record?.sku as string) ?? ""}
      footer={
        record ? (
          <>
            <ConfirmActionButton
              label={translate("shared.actions.delete", { _: "Delete" })}
              icon={<Trash2 className="mr-2 h-4 w-4" />}
              destructive
              disabled={removing}
              title={translate("shared.actions.delete_confirm_title", {
                name: translate("resources.products.name", { _: "product" }),
                _: "Delete product",
              })}
              description={translate(
                "shared.actions.delete_confirm_description",
                {
                  name: (record.name as string) || "",
                  _: "Are you sure you want to delete %{name}? This action cannot be undone.",
                },
              )}
              confirmLabel={translate("shared.actions.delete", { _: "Delete" })}
              onConfirm={remove}
            />
            <Link
              to={`/products/edit/${record.id}`}
              className={cn(buttonVariants())}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {translate("shared.actions.edit", { _: "Edit" })}
            </Link>
          </>
        ) : undefined
      }
    >
      {record && (
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
              <FormSection
                icon={<Package />}
                title={translate("products.form.sections.general", { _: "" })}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label={translate("resources.categories.name")}
                    icon={<Tag />}
                  >
                    <ReferenceField source="categoryId" reference="categories" />
                  </DetailField>
                  <DetailField
                    label={translate("list.fields.totalStock", {
                      _: "Existencia total",
                    })}
                    icon={<Layers />}
                  >
                    <span className="font-medium">
                      {(record.amount as number) ?? 0} {measureUnit}
                    </span>
                  </DetailField>
                </div>
                <DetailTextBlock
                  label={translate("list.fields.description")}
                  icon={<AlignLeft />}
                >
                  {(record.description as string) || ""}
                </DetailTextBlock>
              </FormSection>

              <FormSection
                icon={<DollarSign />}
                title={translate("products.form.sections.pricing", { _: "" })}
                className="border-t pt-5"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <DetailField
                    label={translate("list.fields.basePrice")}
                    icon={<DollarSign />}
                  >
                    {money(record.basePrice)}
                  </DetailField>
                  <DetailField
                    label={translate("list.fields.discount")}
                    icon={<Percent />}
                  >
                    {Number(record.discount ?? 0)}%
                  </DetailField>
                  <DetailField label={translate("list.fields.finalPrice")}>
                    <span className="font-medium text-primary">
                      {money(record.finalPrice)}
                    </span>
                  </DetailField>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <DetailField
                    label={translate("list.fields.measureUnit")}
                    icon={<Ruler />}
                  >
                    {measureUnit}
                  </DetailField>
                  <DetailField
                    label={translate("list.fields.format")}
                    icon={<Box />}
                  >
                    {(record.format as string) || ""}
                  </DetailField>
                  <DetailField
                    label={translate("list.fields.expiryDate")}
                    icon={<CalendarDays />}
                  >
                    {record.expiryDate ? <DateField source="expiryDate" /> : ""}
                  </DetailField>
                </div>
              </FormSection>

              <FormSection
                icon={<ImageIcon />}
                title={translate("products.form.images_title", { _: "Imagen" })}
                className="border-t pt-5"
              >
                <div className="sm:max-w-sm">
                  <DetailImageCard
                    label={translate("list.fields.image")}
                    url={imageUrl}
                    emptyIcon={<ImageOff />}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={<Eye />}
                title={translate("products.form.sections.visibility", { _: "" })}
                className="border-t pt-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label={translate("list.fields.featured")}
                    icon={<Sparkles />}
                  >
                    {record.featured
                      ? translate("shared.filters.yes", { _: "Yes" })
                      : translate("shared.filters.no", { _: "No" })}
                  </DetailField>
                  <DetailField
                    label={translate("list.fields.status")}
                    icon={<CircleDot />}
                  >
                    {record.isActive
                      ? translate("shared.status.active", { _: "Active" })
                      : translate("shared.status.inactive", { _: "Inactive" })}
                  </DetailField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label={translate("list.fields.sortOrder")}
                    icon={<ArrowUpDown />}
                  >
                    {(record.sortOrder as number) ?? 0}
                  </DetailField>
                  <DetailField
                    label={translate("list.fields.createdAt")}
                    icon={<CalendarDays />}
                  >
                    <DateField source="createdAt" showTime />
                  </DetailField>
                </div>
              </FormSection>
            </RecordContextProvider>
          )}

          {tab === "stock" && (
            <StockByStorageTab
              productId={record.id as string}
              measureUnit={measureUnit}
              enabled={tab === "stock"}
            />
          )}
        </>
      )}
    </ResourceDetailModal>
  );
}
