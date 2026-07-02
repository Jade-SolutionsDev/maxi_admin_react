import { useParams, useNavigate } from "react-router-dom";
import {
  CreateBase,
  EditBase,
  required,
  useEditContext,
  useSaveContext,
  useTranslate,
} from "ra-core";
import { useFormContext, useFormState } from "react-hook-form";
import { Loader2, Save } from "lucide-react";

import {
  AutocompleteInput,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from "@/components/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFormModalProps {
  mode: "create" | "edit";
}

export default function CategoryFormModal({ mode }: CategoryFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const title = translate(
    isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
    { name: translate("resources.categories.name", { _: "Category" }) },
  );

  const onClose = () => navigate("/categories");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        {isEdit ? (
          <EditBase id={id} mutationMode="pessimistic">
            <ModalFormShell title={title} onClose={onClose} mode={mode} />
          </EditBase>
        ) : (
          <CreateBase redirect="list" mutationMode="pessimistic">
            <ModalFormShell title={title} onClose={onClose} mode={mode} />
          </CreateBase>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ModalFormShellProps {
  title: string;
  onClose: () => void;
  mode: "create" | "edit";
}

function ModalFormShell({ title, onClose, mode }: ModalFormShellProps) {
  const translate = useTranslate();
  const editContext = useEditContext();
  const isLoading = mode === "edit" && (editContext?.isLoading ?? false);

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b">
        <div className="space-y-1">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {translate("shared.actions.form_subtitle", {
              _: "Fill in the details below.",
            })}
          </DialogDescription>
        </div>
      </DialogHeader>

      <SimpleForm
        toolbar={<ModalFormToolbar onClose={onClose} />}
        className="px-6 py-5 gap-5 max-h-[70vh] overflow-y-auto"
      >
        {isLoading ? <FormSkeleton /> : <CategoryFormFields />}
      </SimpleForm>
    </>
  );
}

function CategoryFormFields() {
  const translate = useTranslate();

  return (
    <>
      <ReferenceInput
        source="departmentId"
        reference="departments"
        label={translate("resources.departments.name")}
      >
        <AutocompleteInput validate={required()} />
      </ReferenceInput>
      <TextInput
        source="name"
        label={translate("list.fields.name")}
        validate={required()}
      />
      <TextInput source="slug" label={translate("list.fields.slug")} />
      <TextInput
        source="description"
        label={translate("list.fields.description")}
        multiline
      />
      <NumberInput
        source="sortOrder"
        label={translate("list.fields.sortOrder")}
        defaultValue={0}
      />
      <BooleanInput
        source="isActive"
        label={translate("list.fields.isActive")}
        defaultValue={true}
      />
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function ModalFormToolbar({ onClose }: { onClose: () => void }) {
  const translate = useTranslate();

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t",
      )}
    >
      <Button type="button" variant="outline" onClick={onClose}>
        {translate("shared.actions.cancel", { _: "Cancel" })}
      </Button>
      <SaveButton label={translate("shared.actions.save", { _: "Save" })} />
    </div>
  );
}

function SaveButton({ label }: { label: string }) {
  const form = useFormContext();
  const saveContext = useSaveContext();
  const { isSubmitting, isValidating } = useFormState();
  const disabled = isSubmitting || isValidating;

  const handleClick = async () => {
    await form.handleSubmit(async (values) => {
      await saveContext?.save?.(values);
    })();
  };

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(disabled && "opacity-50 cursor-not-allowed")}
    >
      {isSubmitting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
