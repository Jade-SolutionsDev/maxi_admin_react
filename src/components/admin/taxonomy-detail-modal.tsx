import { type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useGetOne,
  useRecordContext,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { Eye, ImageOff, Pencil } from "lucide-react";
import { BooleanField } from "@/components/admin/boolean-field";
import { DateField } from "@/components/admin/date-field";
import { ReferenceField } from "@/components/admin/reference-field";
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

function DetailSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-6 w-full rounded bg-muted animate-pulse" />
      ))}
    </div>
  );
}

/**
 * URL-routed read-only detail view shared by departments and categories,
 * mounted at `/[resource]/:id` inside the layout's <Outlet>. The resource
 * (departments | categories) is read from the surrounding ResourceContext, so
 * the same component serves both. Auto-adapts by `parentId`: a row with no
 * parent is a department (shows Featured), otherwise a category (shows its
 * parent department). Closing (X / Esc / overlay) navigates back to the list.
 */
export function TaxonomyDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const resource = useResourceContext();
  const { id } = useParams<{ id: string }>();

  const onClose = () => navigate(`/${resource}`);
  const { data: record, isLoading } = useGetOne(
    resource as string,
    { id: id as string },
    { enabled: Boolean(resource && id), onError: onClose },
  );

  const isDepartment = record?.parentId == null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {(record?.name as string) ??
              translate("shared.actions.view", { _: "Details" })}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {(record?.slug as string) ?? ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !record ? (
          <DetailSkeleton />
        ) : (
          <RecordContextProvider value={record}>
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
                <DetailRow
                  label={translate("list.fields.featured", { _: "Featured" })}
                >
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
        )}

        {record && (
          <DialogFooter>
            <Link
              to={`/${resource}/edit/${record.id}`}
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
 * Eye-icon row action that deep-links to the taxonomy detail route
 * `/[resource]/:id`. Available to every user (view is a read action).
 */
export function TaxonomyViewButton() {
  const record = useRecordContext();
  const resource = useResourceContext();
  const translate = useTranslate();
  const label = translate("shared.actions.view", { _: "View details" });

  if (!record) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/${resource}/${record.id}`}
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
