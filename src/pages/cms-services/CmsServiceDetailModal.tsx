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
  AlignLeft,
  ArrowUpDown,
  CircleDot,
  HandHeart,
  Pencil,
  Shapes,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { DateField } from "@/components/admin/date-field";
import {
  DetailField,
  DetailTextBlock,
  ResourceDetailModal,
} from "@/components/admin/resource-detail-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ServiceIconField } from "./ServiceIconField";

export function CmsServiceDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: removing }] = useDelete();

  const onClose = () => navigate("/cms-services");
  const { data: record, isLoading } = useGetOne(
    "cms-services",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const remove = () =>
    deleteOne(
      "cms-services",
      { id: record!.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("shared.actions.delete_success", { type: "info" });
          refresh();
          navigate("/cms-services");
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

  return (
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={<HandHeart className="h-5 w-5" />}
      title={
        (record?.title as string) ??
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
                name: translate("resources.cms-services.name"),
                _: "Delete",
              })}
              description={translate(
                "shared.actions.delete_confirm_description",
                {
                  name: (record.title as string) || "",
                  _: "Are you sure you want to delete %{name}? This action cannot be undone.",
                },
              )}
              confirmLabel={translate("shared.actions.delete", { _: "Delete" })}
              onConfirm={remove}
            />
            <Link
              to={`/cms-services/edit/${record.id}`}
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
            <DetailField
              label={translate("list.fields.icon")}
              icon={<Shapes />}
            >
              <ServiceIconField />
            </DetailField>
            <DetailField
              label={translate("list.fields.featured")}
              icon={<Sparkles />}
            >
              {record.isFeatured
                ? translate("shared.filters.yes", { _: "Yes" })
                : translate("shared.filters.no", { _: "No" })}
            </DetailField>
          </div>

          <DetailTextBlock
            label={translate("list.fields.description")}
            icon={<AlignLeft />}
          >
            {(record.description as string) || ""}
          </DetailTextBlock>

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
