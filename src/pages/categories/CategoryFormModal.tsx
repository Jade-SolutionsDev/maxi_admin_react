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
  ImageUploadInput,
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

// The form record carries server-managed fields (id, parentId, timestamps)
// that the backend's whitelist rejects — send only what the DTO accepts.
const sanitizeCategory = (data: Record<string, unknown>) => ({
  departmentId: data.departmentId,
  name: data.name,
  slug: data.slug,
  description: data.description,
  imageDesktopUrl: data.imageDesktopUrl,
  imageMobileUrl: data.imageMobileUrl,
  sortOrder: data.sortOrder,
  isActive: data.isActive,
});

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
      <DialogContent className="flex flex-col w-full sm:max-w-xl h-[85vh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 overflow-hidden">
        {isEdit ? (
          <EditBase
            id={id}
            mutationMode="pessimistic"
            transform={sanitizeCategory}
          >
            <ModalFormShell title={title} onClose={onClose} mode={mode} />
          </EditBase>
        ) : (
          <CreateBase
            redirect="list"
            mutationMode="pessimistic"
            transform={sanitizeCategory}
          >
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

  return (
    <>
      <DialogHeader className="shrink-0 px-6 py-4 border-b">
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
        // On edit the parent lives on `parentId`; the input reads `departmentId`.
        defaultValues={(record?: Record<string, unknown>) => ({
          departmentId: record?.parentId,
        })}
        className="flex-1 min-h-0 flex flex-col w-full max-w-none px-0 py-0 gap-0"
      >
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {mode === "edit" ? <EditLoading /> : <CategoryFormFields />}
        </div>
      </SimpleForm>
    </>
  );
}

function EditLoading() {
  const editContext = useEditContext();
  const isLoading = editContext?.isLoading ?? false;

  return isLoading ? <FormSkeleton /> : <CategoryFormFields />;
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
        <AutocompleteInput label={translate("resources.departments.name")} validate={required()} />
      </ReferenceInput>
      <TextInput
        source="name"
        label={translate("list.fields.name")}
        validate={required()}
      />
      {/* Slug temporarily hidden — auto-generated from the name on the backend. */}
      <TextInput
        source="description"
        label={translate("list.fields.description")}
        multiline
      />
      <ImageUploadInput
        source="imageDesktopUrl"
        label={translate("list.fields.imageDesktop")}
      />
      <ImageUploadInput
        source="imageMobileUrl"
        label={translate("list.fields.imageMobile")}
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
      {Array.from({ length: 8 }).map((_, i) => (
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
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pt-4 pb-4 border-t",
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
