import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import {
  AlignLeft,
  ArrowUpDown,
  Building2,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Tag,
  Tags,
} from "lucide-react";

import {
  AutocompleteInput,
  BooleanInput,
  FormSection,
  ImageUploadInput,
  NumberInput,
  ReferenceInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

interface CategoryFormModalProps {
  mode: "create" | "edit";
}

// The form record carries server-managed fields (id, parentId, timestamps)
// that the backend's whitelist rejects — send only what the DTO accepts.
// sortOrder/isActive only render in edit mode, so fall back to their defaults
// on create rather than sending `undefined`.
const sanitizeCategory = (data: Record<string, unknown>) => ({
  departmentId: data.departmentId,
  name: data.name,
  slug: data.slug,
  description: data.description,
  imageDesktopUrl: data.imageDesktopUrl,
  imageMobileUrl: data.imageMobileUrl,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function CategoryFormModal({ mode }: CategoryFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.categories.name", { _: "Category" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/categories")}
      icon={<Tags className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit
          ? "categories.form.edit_subtitle"
          : "categories.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "categories.form.note",
        ),
      }}
      transform={sanitizeCategory}
      // On edit the parent lives on `parentId`; the input reads `departmentId`.
      defaultValues={(record?: Record<string, unknown>) => ({
        departmentId: record?.parentId,
      })}
    >
      <CategoryFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function CategoryFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <ReferenceInput
          source="departmentId"
          reference="departments"
          label={translate("resources.departments.name")}
        >
          <AutocompleteInput
            label={translate("resources.departments.name")}
            validate={required()}
            icon={<Building2 />}
            placeholder={translate(
              "categories.form.placeholders.departmentId",
              { _: "" },
            )}
            helperText="categories.form.hints.departmentId"
          />
        </ReferenceInput>
        <TextInput
          source="name"
          label={translate("list.fields.name")}
          validate={required()}
          icon={<Tag />}
          placeholder={translate("categories.form.placeholders.name", {
            _: "",
          })}
          helperText="categories.form.hints.name"
        />
      </div>
      {/* Slug temporarily hidden — auto-generated from the name on the backend. */}

      <TextInput
        source="description"
        label={translate("list.fields.description")}
        multiline
        icon={<AlignLeft />}
        placeholder={translate("categories.form.placeholders.description", {
          _: "",
        })}
        helperText="categories.form.hints.description"
      />

      <FormSection
        icon={<ImageIcon />}
        title={translate("categories.form.images_title", { _: "Imágenes" })}
        subtitle={translate(
          isEdit
            ? "categories.form.images_hint_edit"
            : "categories.form.images_hint",
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
            helperText="categories.form.hints.sortOrder"
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="categories.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}
