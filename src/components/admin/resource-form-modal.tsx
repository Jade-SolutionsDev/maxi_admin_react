import type { ReactNode } from "react";
import type { RaRecord, TransformData } from "ra-core";
import { FormDialogContent } from "@/components/admin/form-dialog-content";
import { CreateBase, EditBase, useEditContext, useTranslate } from "ra-core";
import { Info } from "lucide-react";

import { SaveButton } from "@/components/admin/form";
import { SimpleForm } from "@/components/admin/simple-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export type ResourceFormModalProps = {
  mode: "create" | "edit";
  /** Record id — edit only, usually `useParams().id`. */
  id?: string;
  /** Overrides the ambient ResourceContext. */
  resource?: string;
  /** Route-driven modals omit this (they are always open while routed). */
  open?: boolean;
  onClose: () => void;

  /** Header medallion icon. */
  icon: ReactNode;
  /** Already-translated header title and subtitle. */
  title: string;
  subtitle?: string;

  /** Already-translated footer note shown left of the buttons. */
  callout?: { title: string; description: string };

  /* Pass-throughs to CreateBase / EditBase / SimpleForm. */
  transform?: TransformData;
  redirect?: string | false;
  defaultValues?:
    | Record<string, unknown>
    | ((record?: RaRecord) => Record<string, unknown>);
  mutationOptions?: {
    onSuccess?: (data: RaRecord) => void | Promise<void>;
    onError?: (error: unknown) => void;
  };

  /** The fields. */
  children: ReactNode;
};

/**
 * Shared shell for every resource create/edit modal: decorated header, the
 * CreateBase/EditBase switch, the scrolling form body and the footer with an
 * optional note plus Cancel/Save.
 *
 * Width, `mutationMode`, the cancel label, the submit label (derived from
 * `mode`) and the edit-loading skeleton are deliberately NOT props — every form
 * in the app is meant to look the same. Add a field-level `FormSection`/grid
 * inside `children` when a form needs structure; the shell never imposes one.
 */
export function ResourceFormModal({
  mode,
  id,
  resource,
  open = true,
  onClose,
  icon,
  title,
  subtitle,
  callout,
  transform,
  redirect,
  defaultValues,
  mutationOptions,
  children,
}: ResourceFormModalProps) {
  const body = (
    <FormModalBody
      mode={mode}
      icon={icon}
      title={title}
      subtitle={subtitle}
      callout={callout}
      defaultValues={defaultValues}
      onClose={onClose}
    >
      {children}
    </FormModalBody>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {/* p-0 gap-0 cancels DialogContent's built-in grid/padding; the
          flex + h-[85vh] chain is what makes the body (not the page) scroll. */}
      <FormDialogContent className="flex flex-col w-full sm:max-w-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 overflow-hidden">
        {mode === "edit" ? (
          <EditBase
            id={id}
            resource={resource}
            mutationMode="pessimistic"
            transform={transform}
            redirect={redirect}
            mutationOptions={mutationOptions}
          >
            {body}
          </EditBase>
        ) : (
          <CreateBase
            resource={resource}
            mutationMode="pessimistic"
            transform={transform}
            redirect={redirect ?? "list"}
            mutationOptions={mutationOptions}
          >
            {body}
          </CreateBase>
        )}
      </FormDialogContent>
    </Dialog>
  );
}

function FormModalBody({
  mode,
  icon,
  title,
  subtitle,
  callout,
  defaultValues,
  onClose,
  children,
}: Pick<
  ResourceFormModalProps,
  | "mode"
  | "icon"
  | "title"
  | "subtitle"
  | "callout"
  | "defaultValues"
  | "onClose"
  | "children"
>) {
  return (
    <>
      <DialogHeader className="relative shrink-0 overflow-hidden border-b px-6 py-5 text-left">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-primary opacity-10" />
          <div className="absolute -bottom-20 -left-16 h-32 w-32 rounded-full bg-primary/70 opacity-10" />
        </div>
        <div className="relative flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </span>
          <div className="space-y-1">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {subtitle && (
              <DialogDescription className="text-sm text-muted-foreground">
                {subtitle}
              </DialogDescription>
            )}
          </div>
        </div>
      </DialogHeader>

      <SimpleForm
        toolbar={
          <FormModalFooter mode={mode} callout={callout} onClose={onClose} />
        }
        defaultValues={defaultValues}
        // max-w-none cancels SimpleForm's default max-w-lg, otherwise the form
        // renders as a narrow column inside the wide dialog.
        className="flex-1 min-h-0 flex flex-col w-full max-w-none px-0 py-0 gap-0"
      >
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* useEditContext() THROWS outside an Edit tree, so the loading gate
              has to be its own component rendered only in the edit branch —
              calling the hook here would break every create form. */}
          {mode === "edit" ? <EditLoadingGate>{children}</EditLoadingGate> : children}
        </div>
      </SimpleForm>
    </>
  );
}

/** Swaps the fields for a skeleton while the edited record loads. Only ever
 *  rendered inside <EditBase>, since useEditContext() throws without it. */
function EditLoadingGate({ children }: { children: ReactNode }) {
  const { isLoading } = useEditContext();
  return isLoading ? <FormSkeleton /> : <>{children}</>;
}

function FormModalFooter({
  mode,
  callout,
  onClose,
}: Pick<ResourceFormModalProps, "mode" | "callout" | "onClose">) {
  const translate = useTranslate();

  return (
    <div className="flex shrink-0 flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center">
      {callout && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Info className="h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">{callout.title}</p>
            <p className="text-muted-foreground">{callout.description}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:shrink-0 sm:flex-row">
        <Button type="button" variant="outline" onClick={onClose}>
          {translate("shared.actions.cancel", { _: "Cancelar" })}
        </Button>
        {/* type="button" keeps SimpleForm's existing submit path (it swallows
            native submit); the shared SaveButton also reports backend field
            errors, which the old per-modal copies dropped. */}
        <SaveButton
          type="button"
          label={
            mode === "edit"
              ? "shared.actions.save_changes"
              : "shared.actions.save"
          }
        />
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
