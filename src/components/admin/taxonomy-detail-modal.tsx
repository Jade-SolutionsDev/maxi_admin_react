import { useState, type ReactNode } from "react";
import {
  RecordContextProvider,
  useRecordContext,
  useTranslate,
  type RaRecord,
} from "ra-core";
import { Eye, ImageOff } from "lucide-react";
import { BooleanField } from "@/components/admin/boolean-field";
import { DateField } from "@/components/admin/date-field";
import { ReferenceField } from "@/components/admin/reference-field";
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

interface TaxonomyDetailModalProps {
  record?: RaRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border/50 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm wrap-break-word">{children}</dd>
    </div>
  );
}

function ImagePreview({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className="flex-1 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex h-28 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
        {url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

/**
 * Read-only detail view shared by departments and categories. Auto-adapts:
 * a row with no parentId is a department (shows Featured), otherwise a category
 * (shows its parent department). Reads the record passed from the list row.
 */
export function TaxonomyDetailModal({
  record,
  open,
  onOpenChange,
}: TaxonomyDetailModalProps) {
  const translate = useTranslate();
  if (!record) return null;
  const isDepartment = record.parentId == null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <RecordContextProvider value={record}>
          <DialogHeader>
            <DialogTitle className="text-xl">{record.name}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {record.slug}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4">
            <ImagePreview
              label={translate("list.fields.imageDesktop", { _: "Desktop" })}
              url={record.imageDesktopUrl}
            />
            <ImagePreview
              label={translate("list.fields.imageMobile", { _: "Mobile" })}
              url={record.imageMobileUrl}
            />
          </div>

          <dl className="mt-2">
            {!isDepartment && (
              <DetailRow label={translate("resources.departments.name")}>
                <ReferenceField source="parentId" reference="departments" />
              </DetailRow>
            )}
            {isDepartment && (
              <DetailRow label={translate("list.fields.featured", { _: "Featured" })}>
                <BooleanField source="isFeatured" />
              </DetailRow>
            )}
            <DetailRow label={translate("list.fields.description")}>
              <span className="whitespace-pre-wrap">
                {(record.description as string) || "—"}
              </span>
            </DetailRow>
            <DetailRow label={translate("list.fields.sortOrder")}>
              {record.sortOrder ?? 0}
            </DetailRow>
            <DetailRow label={translate("list.fields.isActive")}>
              <BooleanField source="isActive" />
            </DetailRow>
            <DetailRow label={translate("list.fields.createdAt")}>
              <DateField source="createdAt" showTime />
            </DetailRow>
            <DetailRow label={translate("list.fields.updatedAt")}>
              <DateField source="updatedAt" showTime />
            </DetailRow>
          </dl>
        </RecordContextProvider>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Eye-icon button for a list row that opens {@link TaxonomyDetailModal}.
 * Available to every user (view is a read action).
 */
export function TaxonomyViewButton() {
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
      <TaxonomyDetailModal record={record} open={open} onOpenChange={setOpen} />
    </>
  );
}
