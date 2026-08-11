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
import {
  AlignLeft,
  ArrowUpDown,
  Boxes,
  Building2,
  CircleDot,
  Image as ImageIcon,
  ImageOff,
  Monitor,
  Pencil,
  Smartphone,
  Sparkles,
  Tags,
  Trash2,
} from "lucide-react";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { DateField } from "@/components/admin/date-field";
import { FormSection } from "@/components/admin/form-section";
import { ReferenceField } from "@/components/admin/reference-field";
import {
  DetailField,
  DetailImageCard,
  DetailTextBlock,
  ResourceDetailModal,
} from "@/components/admin/resource-detail-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * URL-routed read-only detail view shared by departments and categories,
 * mounted at `/[resource]/:id` inside the layout's <Outlet>. The resource
 * (departments | categories) is read from the surrounding ResourceContext, so
 * the same component serves both. Auto-adapts by `parentId`: a row with no
 * parent is a department (shows Featured), otherwise a category (shows its
 * parent department). Closing (X / Esc / overlay) navigates back to the list.
 *
 * Layout mirrors the taxonomy form (same sections, icons and field geometry) so
 * opening Edit from here doesn't reflow the dialog.
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
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={
        isDepartment ? <Boxes className="h-5 w-5" /> : <Tags className="h-5 w-5" />
      }
      title={
        (record?.name as string) ??
        translate("shared.actions.view", { _: "Details" })
      }
      subtitle={(record?.slug as string) ?? ""}
      footer={
        record ? (
          <>
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
              to={`/${resource}/edit/${record.id}`}
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
        <RecordContextProvider value={record}>
          <div className="grid gap-4 sm:grid-cols-2">
            {isDepartment ? (
              <DetailField
                label={translate("list.fields.featured", { _: "Featured" })}
                icon={<Sparkles />}
              >
                {record.isFeatured
                  ? translate("shared.filters.yes", { _: "Yes" })
                  : translate("shared.filters.no", { _: "No" })}
              </DetailField>
            ) : (
              <DetailField
                label={translate("resources.departments.name")}
                icon={<Building2 />}
              >
                <ReferenceField source="parentId" reference="departments" />
              </DetailField>
            )}
            <DetailField
              label={translate("list.fields.status")}
              icon={<CircleDot />}
            >
              {record.isActive
                ? translate("shared.status.active", { _: "Active" })
                : translate("shared.status.inactive", { _: "Inactive" })}
            </DetailField>
          </div>

          <DetailTextBlock
            label={translate("list.fields.description")}
            icon={<AlignLeft />}
          >
            {(record.description as string) || ""}
          </DetailTextBlock>

          <FormSection
            icon={<ImageIcon />}
            title={translate(
              isDepartment
                ? "departments.form.images_title"
                : "categories.form.images_title",
              { _: "Imágenes" },
            )}
            className="border-t pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailImageCard
                label={
                  <>
                    <Monitor className="h-4 w-4 text-primary" />
                    {translate("list.fields.imageDesktop", { _: "Desktop" })}
                  </>
                }
                url={record.imageDesktopUrl as string | null}
                emptyIcon={<ImageOff />}
              />
              <DetailImageCard
                label={
                  <>
                    <Smartphone className="h-4 w-4 text-primary" />
                    {translate("list.fields.imageMobile", { _: "Mobile" })}
                  </>
                }
                url={record.imageMobileUrl as string | null}
                emptyIcon={<ImageOff />}
              />
            </div>
          </FormSection>

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <DetailField
              label={translate("list.fields.sortOrder")}
              icon={<ArrowUpDown />}
            >
              {record.sortOrder ?? 0}
            </DetailField>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label={translate("list.fields.createdAt")}>
                <DateField source="createdAt" showTime />
              </DetailField>
              <DetailField label={translate("list.fields.updatedAt")}>
                <DateField source="updatedAt" showTime />
              </DetailField>
            </div>
          </div>
        </RecordContextProvider>
      )}
    </ResourceDetailModal>
  );
}
