import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import { AlignLeft, ArrowUpDown, ListTree, Tag } from "lucide-react";

import {
  BooleanInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";
import type { NomenclatorsOutletContext } from "./NomenclatorsLayout";

interface NomenclatorFormModalProps {
  mode: "create" | "edit";
}

export default function NomenclatorFormModal({
  mode,
}: NomenclatorFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { category } = useOutletContext<NomenclatorsOutletContext>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.nomenclators.name", { _: "Option" });

  // The category rides with the create payload; the code is server-derived
  // from the label and never edited by hand (slug convention).
  const sanitizeNomenclator = (data: Record<string, unknown>) => ({
    ...(isEdit ? {} : { category }),
    label: data.label,
    description: data.description || undefined,
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
  });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/nomenclators")}
      icon={<ListTree className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit
          ? "nomenclators.form.edit_subtitle"
          : "nomenclators.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "nomenclators.form.note",
        ),
      }}
      transform={sanitizeNomenclator}
    >
      <NomenclatorFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function NomenclatorFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <>
      <TextInput
        source="label"
        label={translate("nomenclators.fields.label")}
        validate={required()}
        icon={<Tag />}
        placeholder={translate("nomenclators.form.placeholders.label", {
          _: "",
        })}
        helperText="nomenclators.form.hints.label"
      />

      <TextInput
        source="description"
        label={translate("list.fields.description")}
        multiline
        icon={<AlignLeft />}
        helperText="nomenclators.form.hints.description"
      />

      {isEdit && (
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText="nomenclators.form.hints.sortOrder"
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="nomenclators.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}
