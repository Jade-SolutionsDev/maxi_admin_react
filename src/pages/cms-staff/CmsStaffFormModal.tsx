import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import {
  AlignLeft,
  ArrowUpDown,
  BriefcaseBusiness,
  Camera,
  User,
  Users,
} from "lucide-react";

import {
  BooleanInput,
  FormSection,
  ImageUploadInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

interface CmsStaffFormModalProps {
  mode: "create" | "edit";
}

const sanitizeCmsStaff = (data: Record<string, unknown>) => ({
  name: data.name,
  role: data.role,
  photoUrl: data.photoUrl,
  resume: data.resume,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function CmsStaffFormModal({ mode }: CmsStaffFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.cms-staff.name", { _: "Staff member" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/cms-staff")}
      icon={<Users className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit
          ? "cms-staff.form.edit_subtitle"
          : "cms-staff.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "cms-staff.form.note",
        ),
      }}
      transform={sanitizeCmsStaff}
    >
      <CmsStaffFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function CmsStaffFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          source="name"
          label={translate("list.fields.name")}
          validate={required()}
          icon={<User />}
          placeholder={translate("cms-staff.form.placeholders.name", {
            _: "",
          })}
          helperText="cms-staff.form.hints.name"
        />
        <TextInput
          source="role"
          label={translate("list.fields.role")}
          validate={required()}
          icon={<BriefcaseBusiness />}
          placeholder={translate("cms-staff.form.placeholders.role", {
            _: "",
          })}
          helperText="cms-staff.form.hints.role"
        />
      </div>

      <TextInput
        source="resume"
        label={translate("list.fields.resume")}
        multiline
        icon={<AlignLeft />}
        placeholder={translate("cms-staff.form.placeholders.resume", {
          _: "",
        })}
        helperText="cms-staff.form.hints.resume"
      />

      <FormSection
        icon={<Camera />}
        title={translate("cms-staff.form.photo_title", { _: "Foto" })}
        subtitle={translate("cms-staff.form.photo_hint", { _: "" })}
        className="border-t pt-5"
      >
        <div className="rounded-xl border border-border p-4">
          <ImageUploadInput
            source="photoUrl"
            uploadPrefix="cms"
            label={translate("list.fields.photo")}
            recommendedSize="400 x 400"
          />
        </div>
      </FormSection>

      {isEdit && (
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText="cms-staff.form.hints.sortOrder"
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="cms-staff.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}
