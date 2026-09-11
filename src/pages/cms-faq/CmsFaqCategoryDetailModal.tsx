import { CircleHelp, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDelete,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ResourceDetailModal } from "@/components/admin/resource-detail-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CmsFaqCategoryDetailModal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: removing }] = useDelete();
  const onClose = () => navigate("/cms-faq-categories");
  const { data: record, isLoading } = useGetOne(
    "cms-faq-categories",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const remove = () =>
    deleteOne(
      "cms-faq-categories",
      { id: record!.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("shared.actions.delete_success", { type: "info" });
          refresh();
          onClose();
        },
        onError: () => notify("shared.actions.error", { type: "error" }),
      },
    );

  const filter = encodeURIComponent(JSON.stringify({ categoryId: id }));

  return (
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={<FolderTree className="h-5 w-5" />}
      title={(record?.title as string) ?? ""}
      subtitle={translate("cms-faq.category.detail_subtitle", {
        count: record?.questionCount ?? 0,
      })}
      footer={
        record ? (
          <>
            <ConfirmActionButton
              label={translate("shared.actions.delete")}
              icon={<Trash2 className="h-4 w-4" />}
              destructive
              disabled={removing}
              title={translate("cms-faq.category.delete_title")}
              description={translate("cms-faq.category.delete_description")}
              confirmLabel={translate("shared.actions.delete")}
              onConfirm={remove}
            />
            <Link
              to={`/cms-faq-questions?filter=${filter}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <CircleHelp className="h-4 w-4" />
              {translate("cms-faq.actions.manage_questions")}
            </Link>
            <Link
              to={`/cms-faq-questions/create?categoryId=${record.id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Plus className="h-4 w-4" />
              {translate("cms-faq.actions.create_question")}
            </Link>
            <Link
              to={`/cms-faq-categories/edit/${record.id}`}
              className={cn(buttonVariants())}
            >
              <Pencil className="h-4 w-4" />
              {translate("shared.actions.edit")}
            </Link>
          </>
        ) : undefined
      }
    >
      {record && (
        <p className="text-sm text-muted-foreground">
          {record.isActive
            ? translate("cms-faq.category.visible")
            : translate("cms-faq.category.hidden")}
        </p>
      )}
    </ResourceDetailModal>
  );
}
