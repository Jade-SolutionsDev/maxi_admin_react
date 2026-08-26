import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import {
  AlignLeft,
  ArrowUpDown,
  Heading,
  NotebookPen,
  Tag,
} from "lucide-react";

import {
  AutocompleteInput,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

interface ContactTemplateFormModalProps {
  mode: "create" | "edit";
}

const sanitizeTemplate = (data: Record<string, unknown>) => ({
  title: data.title,
  body: data.body,
  motiveId: data.motiveId || undefined,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function ContactTemplateFormModal({
  mode,
}: ContactTemplateFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.contact-templates.name", {
    _: "Template",
  });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/contact-templates")}
      icon={<NotebookPen className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit
          ? "contact-templates.form.edit_subtitle"
          : "contact-templates.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "contact-templates.form.note",
        ),
      }}
      transform={sanitizeTemplate}
    >
      <ContactTemplateFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function ContactTemplateFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          source="title"
          label={translate("list.fields.title")}
          validate={required()}
          icon={<Heading />}
          placeholder={translate("contact-templates.form.placeholders.title", {
            _: "",
          })}
          helperText="contact-templates.form.hints.title"
        />
        <ReferenceInput
          source="motiveId"
          reference="contact-motives"
          filter={{ category: "contact-motive" }}
        >
          <AutocompleteInput
            label={translate("contact-messages.fields.motive")}
            optionText="label"
            icon={<Tag />}
            helperText="contact-templates.form.hints.motiveId"
          />
        </ReferenceInput>
      </div>

      <TextInput
        source="body"
        label={translate("contact-templates.fields.body")}
        validate={required()}
        multiline
        rows={8}
        icon={<AlignLeft />}
        placeholder={translate("contact-templates.form.placeholders.body", {
          _: "",
        })}
        helperText="contact-templates.form.hints.body"
      />

      {isEdit && (
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText="contact-templates.form.hints.sortOrder"
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="contact-templates.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}
