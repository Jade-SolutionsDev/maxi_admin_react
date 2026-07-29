import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  required,
  useDataProvider,
  useGetList,
  useNotify,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Phone, Shield, User, UserCog } from "lucide-react";

import {
  BooleanInput,
  FormSection,
  ResourceFormModal,
  SelectInput,
  TextInput,
} from "@/components/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  ExtendedDataProvider,
  RoleSummary,
} from "@/providers/dataProvider";
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
      roleIds.includes(id) ? roleIds.filter((x) => x !== id) : [...roleIds, id],
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
  const record = useRecordContext();

  return (
    <>
      <FormSection
        icon={<User />}
        title={translate("users.form.sections.personal", { _: "" })}
        subtitle={translate("users.form.sections.personal_hint", { _: "" })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            source="firstName"
            label={translate("list.fields.firstName")}
            validate={required()}
            icon={<User />}
            helperText="users.form.hints.firstName"
          />
          <TextInput
            source="lastName"
            label={translate("list.fields.lastName")}
            validate={required()}
            icon={<User />}
            helperText="users.form.hints.lastName"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <EmailField />
          <TextInput
            source="phone"
            label={translate("list.fields.phone")}
            icon={<Phone />}
            helperText="users.form.hints.phone"
          />
        </div>
      </FormSection>

      <FormSection
        icon={<Shield />}
        title={translate("users.form.sections.access", { _: "" })}
        subtitle={translate("users.form.sections.access_hint", { _: "" })}
        className="border-t pt-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            source="role"
            label={translate("list.fields.role")}
            choices={roleChoices}
            validate={required()}
            icon={<Shield />}
            helperText="users.form.hints.role"
          />
          {/* An awaiting-approval user is activated via Approve/Reject in the
              detail modal, not this switch — showing it here only confuses. */}
          {!record?.isAwaitingApproval && (
            <BooleanInput
              source="isActive"
              label={translate("list.fields.status")}
              helperText="users.form.hints.isActive"
            />
          )}
        </div>
        <UserRolesField roleIds={roleIds} onChange={onChangeRoles} />
      </FormSection>
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

  return (
    <ResourceFormModal
      mode="edit"
      id={id}
      onClose={() => navigate("/users")}
      icon={<UserCog className="h-5 w-5" />}
      title={translate("users.actions.edit_title", { _: "Edit user" })}
      subtitle={translate("users.form.edit_subtitle", {
        _: "Update the user's role, status and details.",
      })}
      callout={{
        title: translate("shared.form.note_title_edit"),
        description: translate("users.form.note"),
      }}
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
      <UserEditFields roleIds={roleIds} onChangeRoles={setRoleIds} />
    </ResourceFormModal>
  );
}
