import { AlignLeft, CircleHelp, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useDelete,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import {
  DetailField,
  DetailTextBlock,
  ResourceDetailModal,
} from "@/components/admin/resource-detail-modal";
import { ReferenceField } from "@/components/admin/reference-field";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CmsFaqQuestionDetailModal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: removing }] = useDelete();
  const onClose = () => navigate("/cms-faq-questions");
  const { data: record, isLoading } = useGetOne(
    "cms-faq-questions",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const remove = () =>
    deleteOne(
      "cms-faq-questions",
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

  return (
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={<CircleHelp className="h-5 w-5" />}
      title={(record?.question as string) ?? ""}
      footer={
        record ? (
          <>
            <ConfirmActionButton
              label={translate("shared.actions.delete")}
              icon={<Trash2 className="h-4 w-4" />}
              destructive
              disabled={removing}
              title={translate("cms-faq.question.delete_title")}
              description={translate("cms-faq.question.delete_description")}
              confirmLabel={translate("shared.actions.delete")}
              onConfirm={remove}
            />
            <Link
              to={`/cms-faq-questions/edit/${record.id}`}
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
        <RecordContextProvider value={record}>
          <DetailField label={translate("cms-faq.fields.category")}>
            <ReferenceField
              source="categoryId"
              reference="cms-faq-categories"
              link={false}
            />
          </DetailField>
          <DetailTextBlock
            label={translate("cms-faq.fields.answer")}
            icon={<AlignLeft />}
          >
            {(record.answer as string) ?? ""}
          </DetailTextBlock>
          {record.linkHref && (
            <DetailField label={translate("cms-faq.fields.linkHref")}>
              {record.linkLabel} — {record.linkHref}
            </DetailField>
          )}
        </RecordContextProvider>
      )}
    </ResourceDetailModal>
  );
}
