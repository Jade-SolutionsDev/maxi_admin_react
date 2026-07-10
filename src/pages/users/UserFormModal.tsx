import { useParams, useNavigate } from "react-router-dom";
import {
  EditBase,
  required,
  useEditContext,
  useNotify,
  useRecordContext,
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
import { roleChoices } from "./roleChoices";
import { backendMessage } from "./errors";

/** Read-only display of the account email (email is immutable after creation). */
function EmailField() {
  const record = useRecordContext();
  const translate = useTranslate();
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground">
        {translate("list.fields.email", { _: "Email" })}
      </span>
      <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
        {(record?.email as string | null) ?? "—"}
      </div>
    </div>
  );
}

function UserEditFields() {
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
      <EmailField />
      <TextInput source="phone" label={translate("list.fields.phone")} />
      <SelectInput
        source="role"
        label={translate("list.fields.role")}
        choices={roleChoices}
        validate={required()}
      />
      <BooleanInput
        source="isActive"
        label={translate("list.fields.isActive")}
      />
    </>
  );
}

export default function UserFormModal() {
  const navigate = useNavigate();
  const notify = useNotify();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const title = translate("users.actions.edit_title", { _: "Edit user" });
  const onClose = () => navigate("/users");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex flex-col w-full sm:max-w-xl h-[85vh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 overflow-hidden">
        <EditBase
          id={id}
          mutationMode="pessimistic"
          redirect={false}
          mutationOptions={{
            onSuccess: () => {
              notify("users.actions.update_success", {
                type: "success",
                messageArgs: { _: "User updated" },
              });
              navigate("/users");
            },
            onError: (error) => {
              notify(backendMessage(error, "ra.notification.http_error"), {
                type: "error",
              });
            },
          }}
        >
          <ModalFormShell title={title} onClose={onClose} />
        </EditBase>
      </DialogContent>
    </Dialog>
  );
}

interface ModalFormShellProps {
  title: string;
  onClose: () => void;
}

function ModalFormShell({ title, onClose }: ModalFormShellProps) {
  const translate = useTranslate();
  const editContext = useEditContext();
  const isLoading = editContext?.isLoading ?? false;

  return (
    <>
      <DialogHeader className="shrink-0 px-6 py-4 border-b">
        <div className="space-y-1">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {translate("users.actions.form_subtitle", {
              _: "Update the user's role, status and details.",
            })}
          </DialogDescription>
        </div>
      </DialogHeader>

      <SimpleForm
        toolbar={<ModalFormToolbar onClose={onClose} />}
        className="flex-1 min-h-0 flex flex-col w-full max-w-none px-0 py-0 gap-0"
      >
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {isLoading ? <FormSkeleton /> : <UserEditFields />}
        </div>
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

function ModalFormToolbar({ onClose }: { onClose: () => void }) {
  const translate = useTranslate();

  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pt-4 pb-4 border-t">
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
    // Close/notify are handled by EditBase mutationOptions (success/error).
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
