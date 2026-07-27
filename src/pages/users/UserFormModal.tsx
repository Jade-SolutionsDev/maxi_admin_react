import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  EditBase,
  required,
  useDataProvider,
  useEditContext,
  useGetList,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ExtendedDataProvider, RoleSummary } from "@/providers/dataProvider";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
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

/**
 * Managed-role assignment, moved here from the old row dialog. Selection is
 * lifted to UserFormModal so it saves together with the profile fields.
 * `roleIds === null` means the current assignment is still loading.
 */
function UserRolesField({
  roleIds,
  onChange,
}: {
  roleIds: string[] | null;
  onChange: (ids: string[]) => void;
}) {
  const translate = useTranslate();
  const record = useRecordContext();
  const { data: roles, isPending } = useGetList<RoleSummary>("roles", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "name", order: "ASC" },
  });

  const targetIsAdmin = MANAGER_ROLES.includes(record?.role as Role);

  const toggle = (id: string) => {
    if (roleIds === null) return;
    onChange(
      roleIds.includes(id)
        ? roleIds.filter((x) => x !== id)
        : [...roleIds, id],
    );
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">
        {translate("resources.roles.name_plural", { _: "Roles & permissions" })}
      </span>

      {targetIsAdmin && (
        <Alert>
          <AlertDescription>
            {translate("roles.assign_dialog.admin_notice", {
              _: "Admin users have full access regardless of assigned roles.",
            })}
          </AlertDescription>
        </Alert>
      )}

      {isPending || roleIds === null ? (
        <p className="text-sm text-muted-foreground">
          {translate("ra.page.loading", { _: "Loading…" })}
        </p>
      ) : (roles ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate("roles.assign_dialog.empty", { _: "No roles yet." })}
        </p>
      ) : (
        <ul className="space-y-1 rounded-md border border-border p-1">
          {(roles ?? []).map((role) => {
            const id = String(role.id);
            return (
              <li key={id}>
                <label className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={roleIds.includes(id)}
                    onCheckedChange={() => toggle(id)}
                    className="mt-0.5"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{role.name}</span>
                    {role.description && (
                      <span className="text-xs text-muted-foreground">
                        {role.description}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function UserEditFields({
  roleIds,
  onChangeRoles,
}: {
  roleIds: string[] | null;
  onChangeRoles: (ids: string[]) => void;
}) {
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
      <UserRolesField roleIds={roleIds} onChange={onChangeRoles} />
    </>
  );
}

export default function UserFormModal() {
  const navigate = useNavigate();
  const notify = useNotify();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  // Selected managed roles, lifted here so they save with the profile fields.
  // null until the current assignment loads (and stays null on load failure, so
  // a failed fetch never wipes the user's roles on save).
  const [roleIds, setRoleIds] = useState<string[] | null>(null);
  const roleIdsRef = useRef<string[] | null>(null);
  roleIdsRef.current = roleIds;

  useEffect(() => {
    if (!id) return;
    let active = true;
    dataProvider
      .getUserRoles(id)
      .then(({ data }) => {
        if (active) setRoleIds(data.map((r) => String(r.id)));
      })
      .catch(() => {
        // Leave null → save won't touch roles we couldn't read.
      });
    return () => {
      active = false;
    };
  }, [id, dataProvider]);

  const title = translate("users.actions.edit_title", { _: "Edit user" });
  const onClose = () => navigate("/users");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex flex-col w-full sm:max-w-xl h-[85vh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 overflow-hidden">
        <EditBase
          id={id}
          mutationMode="pessimistic"
          redirect={false}
          // Submit only the editable fields — the form is seeded with the full
          // record, and the backend rejects server-managed props (id, timestamps,
          // derived status, ...) via forbidNonWhitelisted.
          transform={({ firstName, lastName, phone, role, isActive }) => ({
            firstName,
            lastName,
            phone,
            role,
            isActive,
          })}
          mutationOptions={{
            // Profile saved → persist role assignment, then close. Roles ride a
            // separate endpoint (setUserRoles), so they save after the PATCH.
            onSuccess: async () => {
              try {
                if (id && roleIdsRef.current) {
                  await dataProvider.setUserRoles(id, roleIdsRef.current);
                }
              } catch (error) {
                notify(backendMessage(error, "Failed to update roles"), {
                  type: "error",
                });
                return;
              }
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
          <ModalFormShell
            title={title}
            onClose={onClose}
            roleIds={roleIds}
            onChangeRoles={setRoleIds}
          />
        </EditBase>
      </DialogContent>
    </Dialog>
  );
}

interface ModalFormShellProps {
  title: string;
  onClose: () => void;
  roleIds: string[] | null;
  onChangeRoles: (ids: string[]) => void;
}

function ModalFormShell({
  title,
  onClose,
  roleIds,
  onChangeRoles,
}: ModalFormShellProps) {
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
          {isLoading ? (
            <FormSkeleton />
          ) : (
            <UserEditFields roleIds={roleIds} onChangeRoles={onChangeRoles} />
          )}
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
    // Close/notify (+ role save) are handled by EditBase mutationOptions.
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
