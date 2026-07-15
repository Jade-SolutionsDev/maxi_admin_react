import { type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useGetOne,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Eye, ImageOff, Pencil } from "lucide-react";

import { BooleanField, DateField, ReferenceField } from "@/components/admin";
import { buttonVariants } from "@/components/ui/button";
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
export function ProductDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const onClose = () => navigate("/products");
  const { data: record, isLoading } = useGetOne(
    "products",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const imageUrl = record?.imageUrl as string | null | undefined;

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
          <RecordContextProvider value={record}>
            <div className="flex justify-center">
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
                {(record.measureUnit as string) || "—"}
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
