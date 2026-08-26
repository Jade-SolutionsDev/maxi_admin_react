import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import {
  AlignLeft,
  ArrowUpDown,
  Boxes,
  Building2,
  Image as ImageIcon,
  Monitor,
  Smartphone,
} from "lucide-react";

import {
  BooleanInput,
  FormSection,
  ImageUploadInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

interface DepartmentFormModalProps {
  mode: "create" | "edit";
}

// Strip server-managed fields (id, parentId, timestamps) the backend rejects.
// sortOrder/isActive only render in edit mode, so fall back to their defaults
// on create rather than sending `undefined`.
const sanitizeDepartment = (data: Record<string, unknown>) => ({
  name: data.name,
  slug: data.slug,
  description: data.description,
  imageDesktopUrl: data.imageDesktopUrl,
  imageMobileUrl: data.imageMobileUrl,
  isFeatured: data.isFeatured ?? false,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function DepartmentFormModal({
  mode,
}: DepartmentFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.departments.name", { _: "Department" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/departments")}
      icon={<Boxes className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit
          ? "departments.form.edit_subtitle"
          : "departments.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "departments.form.note",
        ),
      }}
      transform={sanitizeDepartment}
    >
      <DepartmentFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function DepartmentFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          source="name"
          label={translate("list.fields.name")}
          validate={required()}
          icon={<Building2 />}
          placeholder={translate("departments.form.placeholders.name", {
            _: "",
          })}
          helperText="departments.form.hints.name"
        />
        {/* Slug temporarily hidden — auto-generated from the name on the backend. */}
        <BooleanInput
          source="isFeatured"
          label={translate("list.fields.featured")}
          defaultValue={false}
          helperText="departments.form.hints.isFeatured"
        />
      </div>

      <TextInput
        source="description"
        label={translate("list.fields.description")}
        multiline
        icon={<AlignLeft />}
        placeholder={translate("departments.form.placeholders.description", {
          _: "",
        })}
        helperText="departments.form.hints.description"
      />

      <FormSection
        icon={<ImageIcon />}
        title={translate("departments.form.images_title", { _: "Imágenes" })}
        subtitle={translate(
          isEdit
            ? "departments.form.images_hint_edit"
            : "departments.form.images_hint",
          { _: "" },
        )}
        className="border-t pt-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <ImageUploadInput
              source="imageDesktopUrl"
              label={
                <span className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  {translate("list.fields.imageDesktop")}
                </span>
              }
              recommendedSize="1200 x 800"
              validate={required()}
            />
          </div>
          <div className="rounded-xl border border-border p-4">
            <ImageUploadInput
              source="imageMobileUrl"
              label={
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  {translate("list.fields.imageMobile")}
                </span>
              }
              recommendedSize="600 x 1000"
            />
          </div>
        </div>
      </FormSection>

      {/* Order + status are edit-only, matching the create form's shorter shape. */}
      {isEdit && (
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText="departments.form.hints.sortOrder"
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="departments.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}
