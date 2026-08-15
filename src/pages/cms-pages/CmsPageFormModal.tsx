import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import { AlignLeft, ArrowUpDown, FileText, Heading } from "lucide-react";

import {
  BooleanInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

interface CmsPageFormModalProps {
  mode: "create" | "edit";
}

// The slug is server-generated from the title (taxonomy precedent) and the
// record carries server-managed fields the DTO whitelist rejects.
const sanitizeCmsPage = (data: Record<string, unknown>) => ({
  title: data.title,
  content: data.content,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function CmsPageFormModal({ mode }: CmsPageFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.cms-pages.name", { _: "Page" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/cms-pages")}
      icon={<FileText className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit ? "cms-pages.form.edit_subtitle" : "cms-pages.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "cms-pages.form.note",
        ),
      }}
      transform={sanitizeCmsPage}
    >
      <CmsPageFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function CmsPageFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <>
      <TextInput
        source="title"
        label={translate("list.fields.title")}
        validate={required()}
        icon={<Heading />}
        placeholder={translate("cms-pages.form.placeholders.title", { _: "" })}
        helperText="cms-pages.form.hints.title"
      />

      <TextInput
        source="content"
        label={translate("list.fields.content")}
        validate={required()}
        multiline
        rows={14}
        icon={<AlignLeft />}
        placeholder={translate("cms-pages.form.placeholders.content", {
          _: "",
        })}
        helperText="cms-pages.form.hints.content"
      />

      {isEdit && (
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText="cms-pages.form.hints.sortOrder"
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="cms-pages.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}
