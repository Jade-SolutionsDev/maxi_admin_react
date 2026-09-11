import { AlignLeft, ArrowUpDown, FolderTree } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import {
  BooleanInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

const sanitizeCategory = (data: Record<string, unknown>) => ({
  title: data.title,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export function CmsFaqCategoryFormModal({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/cms-faq-categories")}
      icon={<FolderTree className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name: translate("resources.cms-faq-categories.name") },
      )}
      subtitle={translate(
        isEdit
          ? "cms-faq.category.edit_subtitle"
          : "cms-faq.category.create_subtitle",
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate("cms-faq.category.note"),
      }}
      transform={sanitizeCategory}
      defaultValues={isEdit ? undefined : { sortOrder: 0, isActive: true }}
    >
      <TextInput
        source="title"
        label={translate("list.fields.title")}
        validate={required()}
        icon={<AlignLeft />}
        helperText="cms-faq.category.title_hint"
      />
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
          helperText="cms-faq.category.status_hint"
        />
      </div>
    </ResourceFormModal>
  );
}
