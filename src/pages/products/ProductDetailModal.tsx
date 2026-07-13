import { useState, type ReactNode } from "react";
import {
  RecordContextProvider,
  useRecordContext,
  useTranslate,
  type RaRecord,
} from "ra-core";
import { Eye, ImageOff } from "lucide-react";

import { BooleanField, DateField, ReferenceField } from "@/components/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface ProductDetailModalProps {
  record?: RaRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Read-only detail view for a product row. */
export function ProductDetailModal({
  record,
  open,
  onOpenChange,
}: ProductDetailModalProps) {
  const translate = useTranslate();
  if (!record) return null;

  const imageUrl = record.imageUrl as string | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <RecordContextProvider value={record}>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {record.name as string}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {(record.sku as string) || ""}
            </DialogDescription>
          </DialogHeader>

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
              {record.expiryDate ? (
                <DateField source="expiryDate" />
              ) : (
                "—"
              )}
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
      </DialogContent>
    </Dialog>
  );
}

/** Eye-icon button that opens {@link ProductDetailModal}. Read action → all users. */
export function ProductViewButton() {
  const record = useRecordContext();
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const label = translate("shared.actions.view", { _: "View" });

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(true)}
              aria-label={label}
            >
              <Eye size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ProductDetailModal record={record} open={open} onOpenChange={setOpen} />
    </>
  );
}
