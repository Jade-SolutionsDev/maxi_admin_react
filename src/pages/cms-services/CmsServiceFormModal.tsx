import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import {
  AlignLeft,
  ArrowUpDown,
  HandHeart,
  Heading,
  Shapes,
} from "lucide-react";

import {
  BooleanInput,
  NumberInput,
  ResourceFormModal,
  SelectInput,
  TextInput,
} from "@/components/admin";
import { SERVICE_ICON_CHOICES } from "./service-icons";

interface CmsServiceFormModalProps {
  mode: "create" | "edit";
}

const sanitizeCmsService = (data: Record<string, unknown>) => ({
  icon: data.icon,
  title: data.title,
  description: data.description,
  isFeatured: data.isFeatured ?? false,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function CmsServiceFormModal({
  mode,
}: CmsServiceFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.cms-services.name", { _: "Service" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/cms-services")}
      icon={<HandHeart className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit
          ? "cms-services.form.edit_subtitle"
          : "cms-services.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "cms-services.form.note",
        ),
      }}
      transform={sanitizeCmsService}
    >
      <CmsServiceFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function CmsServiceFormFields({ mode }: { mode: "create" | "edit" }) {
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
          placeholder={translate("cms-services.form.placeholders.title", {
            _: "",
          })}
          helperText="cms-services.form.hints.title"
        />
        <SelectInput
          source="icon"
          label={translate("list.fields.icon")}
          validate={required()}
          icon={<Shapes />}
          choices={SERVICE_ICON_CHOICES}
          helperText="cms-services.form.hints.icon"
        />
      </div>

      <TextInput
        source="description"
        label={translate("list.fields.description")}
        validate={required()}
        multiline
        icon={<AlignLeft />}
        placeholder={translate("cms-services.form.placeholders.description", {
          _: "",
        })}
        helperText="cms-services.form.hints.description"
      />

      <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
        <BooleanInput
          source="isFeatured"
          label={translate("list.fields.featured")}
          defaultValue={false}
          helperText="cms-services.form.hints.isFeatured"
        />
        {isEdit && (
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText="cms-services.form.hints.sortOrder"
          />
        )}
      </div>

      {isEdit && (
        <BooleanInput
          source="isActive"
          label={translate("list.fields.status")}
          defaultValue={true}
          helperText="cms-services.form.hints.isActive"
        />
      )}
    </>
  );
}
