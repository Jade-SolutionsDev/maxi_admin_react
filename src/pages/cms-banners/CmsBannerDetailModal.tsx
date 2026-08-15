import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useDelete,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import {
  ArrowUpDown,
  CircleDot,
  GalleryHorizontalEnd,
  Image as ImageIcon,
  ImageOff,
  Monitor,
  Pencil,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { DateField } from "@/components/admin/date-field";
import { FormSection } from "@/components/admin/form-section";
import {
  DetailField,
  DetailImageCard,
  ResourceDetailModal,
} from "@/components/admin/resource-detail-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CmsBannerDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: removing }] = useDelete();

  const onClose = () => navigate("/cms-banners");
  const { data: record, isLoading } = useGetOne(
    "cms-banners",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const remove = () =>
    deleteOne(
      "cms-banners",
      { id: record!.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("shared.actions.delete_success", { type: "info" });
          refresh();
          navigate("/cms-banners");
        },
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

  const variants = [
    {
      key: "desktop" as const,
      icon: <Monitor className="h-4 w-4 text-primary" />,
    },
    {
      key: "tablet" as const,
      icon: <Tablet className="h-4 w-4 text-primary" />,
    },
    {
      key: "mobile" as const,
      icon: <Smartphone className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={<GalleryHorizontalEnd className="h-5 w-5" />}
      title={
        (record?.alt as string) ??
        translate("shared.actions.view", { _: "Details" })
      }
      footer={
        record ? (
          <>
            <ConfirmActionButton
              label={translate("shared.actions.delete", { _: "Delete" })}
              icon={<Trash2 className="mr-2 h-4 w-4" />}
              destructive
              disabled={removing}
              title={translate("shared.actions.delete_confirm_title", {
                name: translate("resources.cms-banners.name"),
                _: "Delete",
              })}
              description={translate(
                "shared.actions.delete_confirm_description",
                {
                  name: (record.alt as string) || "",
                  _: "Are you sure you want to delete %{name}? This action cannot be undone.",
                },
              )}
              confirmLabel={translate("shared.actions.delete", { _: "Delete" })}
              onConfirm={remove}
            />
            <Link
              to={`/cms-banners/edit/${record.id}`}
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
          <FormSection
            icon={<ImageIcon />}
            title={translate("cms-banners.form.images_title", {
              _: "Imágenes",
            })}
          >
            <div className="grid gap-4">
              {variants.map(({ key, icon }) => {
                const asset = record[key] as {
                  src?: string;
                  width?: number;
                  height?: number;
                } | null;
                return (
                  <div key={key} className="grid gap-1">
                    <DetailImageCard
                      label={
                        <>
                          {icon}
                          {translate(`cms-banners.form.variants.${key}`)}
                        </>
                      }
                      url={asset?.src ?? null}
                      emptyIcon={<ImageOff />}
                    />
                    {asset?.width && asset?.height ? (
                      <p className="text-xs text-muted-foreground">
                        {asset.width} x {asset.height} px
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </FormSection>

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-3">
            <DetailField
              label={translate("list.fields.sortOrder")}
              icon={<ArrowUpDown />}
            >
              {record.sortOrder ?? 0}
            </DetailField>
            <DetailField
              label={translate("list.fields.status")}
              icon={<CircleDot />}
            >
              {record.isActive
                ? translate("shared.status.active", { _: "Active" })
                : translate("shared.status.inactive", { _: "Inactive" })}
            </DetailField>
            <DetailField label={translate("list.fields.updatedAt")}>
              <DateField source="updatedAt" />
            </DetailField>
          </div>
        </RecordContextProvider>
      )}
    </ResourceDetailModal>
  );
}
