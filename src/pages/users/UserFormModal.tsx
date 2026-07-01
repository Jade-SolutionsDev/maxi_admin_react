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
  BooleanInput,
  SelectInput,
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

const userTypeChoices = [
  { id: "admin", name: "Admin" },
  { id: "provider", name: "Provider" },
  { id: "staff", name: "Staff" },
];

interface UserFormFieldsProps {
  mode: "create" | "edit";
}

function UserFormFields({ mode }: UserFormFieldsProps) {
  const translate = useTranslate();

  return (
    <>
      <TextInput
        source="firstName"
        label={translate("list.fields.firstName")}
        validate={required()}
      />
      <TextInput
        source="lastName"
        label={translate("list.fields.lastName")}
        validate={required()}
      />
      <TextInput
        source="email"
        label={translate("list.fields.email")}
        validate={required()}
        type="email"
      />
      <TextInput source="phone" label={translate("list.fields.phone")} />
      <SelectInput
        source="userType"
        label={translate("list.fields.userType")}
        choices={userTypeChoices}
        validate={required()}
        defaultValue={mode === "create" ? "staff" : undefined}
      />
      <BooleanInput
        source="isActive"
        label={translate("list.fields.isActive")}
        defaultValue={mode === "create" ? true : undefined}
      />
    </>
  );
}

interface UserFormModalProps {
  mode: "create" | "edit";
}

export default function UserFormModal({ mode }: UserFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const title = translate(
    isEdit ? "users.actions.edit_title" : "users.actions.create_title",
    { _: isEdit ? "Edit user" : "Create user" },
  );

  const onClose = () => navigate("/users");

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
  const isLoading = editContext?.isLoading ?? false;

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {translate("users.actions.form_subtitle", {
                _: "Fill in the user details below.",
              })}
            </DialogDescription>
          </div>
          {/* <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X size={18} />
          </Button> */}
        </div>
      </DialogHeader>

      <SimpleForm
        toolbar={<ModalFormToolbar onClose={onClose} />}
        className="px-6 py-5 gap-5 max-h-[70vh] overflow-y-auto"
      >
        {isLoading ? <FormSkeleton /> : <UserFormFields mode={mode} />}
      </SimpleForm>
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

interface ModalFormToolbarProps {
  onClose: () => void;
}

function ModalFormToolbar({ onClose }: ModalFormToolbarProps) {
  const translate = useTranslate();

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t",
      )}
    >
      <Button type="button" variant="outline" onClick={onClose}>
        {translate("users.actions.cancel", { _: "Cancel" })}
      </Button>
      <SaveButton label={translate("users.actions.save", { _: "Save" })} />
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
