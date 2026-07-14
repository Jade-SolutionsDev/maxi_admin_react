import { useNavigate } from "react-router-dom";
import {
  CreateBase,
  useNotify,
  useRefresh,
  useSaveContext,
  useTranslate,
  type RaRecord,
} from "ra-core";
import { useFormContext, useFormState } from "react-hook-form";
import { Loader2, Save } from "lucide-react";

import { SimpleForm } from "@/components/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlmacenFormFields } from "./AlmacenFormFields";

// Only the DTO fields the backend accepts.
const sanitize = (data: Record<string, unknown>) => ({
  name: data.name,
  isActive: data.isActive,
  coverage: data.coverage,
  ...(data.grocerIds !== undefined ? { grocerIds: data.grocerIds } : {}),
});

export function AlmacenCreateModal({
  open,
  onClose,
  isManager,
}: {
  open: boolean;
  onClose: () => void;
  isManager: boolean;
}) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex flex-col w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[88vh] p-0 gap-0 overflow-hidden">
        <CreateBase
          resource="stock-locations"
          transform={sanitize}
          mutationOptions={{
            onSuccess: (data: RaRecord) => {
              notify("almacenes.notify.created", {
                type: "success",
                messageArgs: { _: "Almacén creado" },
              });
              onClose();
              refresh();
              navigate(`/stock-locations/${data.id}`);
            },
          }}
        >
          <DialogHeader className="shrink-0 px-6 py-4 border-b">
            <DialogTitle className="text-xl">
              {translate("almacenes.actions.create", { _: "Crear almacén" })}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {translate("shared.actions.form_subtitle", {
                _: "Fill in the details below.",
              })}
            </DialogDescription>
          </DialogHeader>

          <SimpleForm
            toolbar={<ModalToolbar onClose={onClose} />}
            className="flex-1 min-h-0 flex flex-col w-full max-w-none px-0 py-0 gap-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AlmacenFormFields isManager={isManager} />
            </div>
          </SimpleForm>
        </CreateBase>
      </DialogContent>
    </Dialog>
  );
}

function ModalToolbar({ onClose }: { onClose: () => void }) {
  const translate = useTranslate();
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pt-4 pb-4 border-t">
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
