import { type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useDelete,
  useGetOne,
  useNotify,
  useRefresh,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
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

  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: removing }] = useDelete();

  const onClose = () => navigate(`/${resource}`);
  const { data: record, isLoading } = useGetOne(
    resource as string,
    { id: id as string },
    { enabled: Boolean(resource && id), onError: onClose },
  );

  const isDepartment = record?.parentId == null;

  const remove = () =>
    deleteOne(
      resource as string,
      { id: record!.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("shared.actions.delete_success", { type: "info" });
          refresh();
          navigate(`/${resource}`);
        },
        // Surface the backend guard (department has categories / category has products).
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
                  {record.isFeatured
                    ? translate("shared.filters.yes", { _: "Yes" })
                    : translate("shared.filters.no", { _: "No" })}
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
              <DetailRow label={translate("list.fields.status")}>
                {record.isActive
                  ? translate("shared.status.active", { _: "Active" })
                  : translate("shared.status.inactive", { _: "Inactive" })}
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
          <DialogFooter className="sm:justify-end gap-2">
            <ConfirmActionButton
              label={translate("shared.actions.delete", { _: "Delete" })}
              icon={<Trash2 className="mr-2 h-4 w-4" />}
              destructive
              disabled={removing}
              title={translate("shared.actions.delete_confirm_title", {
                name: translate(
                  isDepartment
                    ? "resources.departments.name"
                    : "resources.categories.name",
                ),
                _: "Delete",
              })}
              description={translate("shared.actions.delete_confirm_description", {
                name: (record.name as string) || "",
                _: "Are you sure you want to delete %{name}? This action cannot be undone.",
              })}
              confirmLabel={translate("shared.actions.delete", { _: "Delete" })}
              onConfirm={remove}
            />
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
