import {
  AlignLeft,
  ArrowUpDown,
  CircleHelp,
  ExternalLink,
  FolderTree,
  Heading,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import {
  AutocompleteInput,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

const sanitizeQuestion = (data: Record<string, unknown>) => ({
  categoryId: data.categoryId,
  question: data.question,
  answer: data.answer,
  linkLabel: data.linkLabel || null,
  linkHref: data.linkHref || null,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export function CmsFaqQuestionFormModal({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/cms-faq-questions")}
      icon={<CircleHelp className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name: translate("resources.cms-faq-questions.name") },
      )}
      subtitle={translate(
        isEdit
          ? "cms-faq.question.edit_subtitle"
          : "cms-faq.question.create_subtitle",
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate("cms-faq.question.note"),
      }}
      transform={sanitizeQuestion}
      defaultValues={
        isEdit
          ? undefined
          : {
              categoryId: searchParams.get("categoryId") ?? undefined,
              sortOrder: 0,
              isActive: true,
            }
      }
    >
      <ReferenceInput source="categoryId" reference="cms-faq-categories">
        <AutocompleteInput
          label={translate("cms-faq.fields.category")}
          validate={required()}
          icon={<FolderTree />}
          optionText="title"
          helperText="cms-faq.question.category_hint"
        />
      </ReferenceInput>
      <TextInput
        source="question"
        label={translate("cms-faq.fields.question")}
        validate={required()}
        icon={<Heading />}
        helperText="cms-faq.question.question_hint"
      />
      <TextInput
        source="answer"
        label={translate("cms-faq.fields.answer")}
        validate={required()}
        multiline
        rows={7}
        icon={<AlignLeft />}
        helperText="cms-faq.question.answer_hint"
      />
      <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
        <TextInput
          source="linkLabel"
          label={translate("cms-faq.fields.linkLabel")}
          icon={<ExternalLink />}
          helperText="cms-faq.question.link_label_hint"
        />
        <TextInput
          source="linkHref"
          label={translate("cms-faq.fields.linkHref")}
          icon={<ExternalLink />}
          helperText="cms-faq.question.link_href_hint"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          source="sortOrder"
          label={translate("list.fields.sortOrder")}
          min={0}
          icon={<ArrowUpDown />}
          helperText="cms-faq.common.sort_hint"
        />
        <BooleanInput
          source="isActive"
          label={translate("list.fields.status")}
          helperText="cms-faq.question.status_hint"
        />
      </div>
    </ResourceFormModal>
  );
}
