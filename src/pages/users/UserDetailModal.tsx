import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useDelete,
  useGetIdentity,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
  useUpdate,
} from "ra-core";
import {
  ConfirmActionButton,
  DateField,
  DetailField,
  FormSection,
  ResourceDetailModal,
} from "@/components/admin";
import {
  CalendarDays,
  CheckCircle2,
  CircleDot,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Shield,
  Trash2,
  User,
  UserCog,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
import { RoleBadge } from "./RoleBadge";
import { backendMessage } from "./errors";

/**
 * URL-routed read-only detail view for a user, mounted at `/users/:id` inside
 * the users layout's <Outlet>. Closing navigates back to the list. The footer
 * carries the actions (managers only): Approve/Reject for a user awaiting
 * approval, otherwise Edit + Change password + Delete.
 *
 * Sections and field geometry mirror UserFormModal so opening Edit from here
 * doesn't reflow the dialog.
 */
export default function UserDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { id } = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity();
  const [update, { isPending: approving }] = useUpdate();
  const [deleteOne, { isPending: removing }] = useDelete();
  const busy = approving || removing;

  const onClose = () => navigate("/users");
  const { data: record, isLoading } = useGetOne(
    "users",
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const canManage = MANAGER_ROLES.includes(
    (identity?.role as Role) ?? "KARDIST",
  );

  const firstName = (record?.firstName as string | null) ?? "";
  const lastName = (record?.lastName as string | null) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = (record?.email as string | null) ?? "";
  const name = fullName || email;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const avatarUrl = (record?.avatarUrl as string | null) ?? undefined;
  const isSelf = record?.id != null && record.id === identity?.id;
  const canRestore = identity?.role === "SUPER_ADMIN";

  const statusKey = record?.isAwaitingApproval
    ? "awaiting_approval"
    : record?.isActive
      ? "active"
      : "inactive";

  const approve = () =>
    update(
      "users",
      { id: record!.id, data: { isActive: true }, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("users.actions.approve_success", {
            type: "success",
            messageArgs: { _: "User approved" },
          });
          refresh();
          navigate("/users");
        },
        onError: (error) =>
          notify(backendMessage(error, "Could not approve user"), {
            type: "error",
          }),
      },
    );

  const softDelete = (successKey: string, fallback: string) => () =>
    deleteOne(
      "users",
      { id: record!.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify(successKey, { type: "success", messageArgs: { _: fallback } });
          refresh();
          navigate("/users");
        },
        onError: (error) =>
          notify(backendMessage(error, fallback), { type: "error" }),
      },
    );

  return (
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={<UserCog className="h-5 w-5" />}
      title={name || translate("shared.actions.view", { _: "Details" })}
      subtitle={fullName ? email : ""}
      footer={
        record && canManage ? (
          <>
            {record.isAwaitingApproval ? (
              <>
                <ConfirmActionButton
                  label={translate("users.actions.reject", { _: "Reject" })}
                  icon={<XCircle className="mr-2 h-4 w-4" />}
                  destructive
                  disabled={busy}
                  title={translate("users.confirm.reject.title", {
                    _: "Reject request",
                  })}
                  description={translate("users.confirm.reject.description", {
                    name,
                    _: `Reject ${name}? They will not get access.`,
                  })}
                  confirmLabel={translate("users.actions.reject", {
                    _: "Reject",
                  })}
                  onConfirm={softDelete(
                    "users.actions.reject_success",
                    "Request rejected",
                  )}
                />
                <ConfirmActionButton
                  label={translate("users.actions.approve", { _: "Approve" })}
                  icon={<CheckCircle2 className="mr-2 h-4 w-4" />}
                  disabled={busy}
                  title={translate("users.confirm.approve.title", {
                    _: "Approve user",
                  })}
                  description={translate("users.confirm.approve.description", {
                    name,
                    _: `Approve ${name}? They will be able to sign in.`,
                  })}
                  confirmLabel={translate("users.actions.approve", {
                    _: "Approve",
                  })}
                  onConfirm={approve}
                />
              </>
            ) : (
              !isSelf && (
                <>
                  <ConfirmActionButton
                    label={translate("users.actions.delete", { _: "Delete" })}
                    icon={<Trash2 className="mr-2 h-4 w-4" />}
                    destructive
                    disabled={busy}
                    title={translate("users.actions.delete_confirm_title", {
                      _: "Delete user",
                    })}
                    description={translate(
                      canRestore
                        ? "users.actions.delete_confirm_description"
                        : "users.actions.delete_confirm_description_no_restore",
                      {
                        name,
                        _: canRestore
                          ? "Are you sure you want to delete %{name}? You can restore them later from “Show deleted”."
                          : "Are you sure you want to delete %{name}?",
                      },
                    )}
                    confirmLabel={translate("users.actions.delete", {
                      _: "Delete",
                    })}
                    onConfirm={softDelete(
                      "users.actions.delete_success",
                      "User deleted",
                    )}
                  />
                  <Link
                    to={`/users/password/${record.id}`}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    {translate("users.actions.change_password", {
                      _: "Change password",
                    })}
                  </Link>
                </>
              )
            )}
            <Link
              to={`/users/edit/${record.id}`}
              className={cn(
                buttonVariants({
                  variant: record.isAwaitingApproval ? "outline" : "default",
                }),
              )}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {translate("shared.actions.edit", { _: "Edit" })}
            </Link>
          </>
        ) : undefined
      }
    >
      {record && (
        <RecordContextProvider value={record}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border/50">
              <AvatarImage src={avatarUrl} alt={initials || "Avatar"} />
              <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
                {initials || <User size={24} />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {name}
              </p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <FormSection
            icon={<User />}
            title={translate("users.form.sections.personal", { _: "" })}
            subtitle={translate("users.form.sections.personal_hint", { _: "" })}
            className="border-t pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label={translate("list.fields.firstName")}
                icon={<User />}
              >
                {firstName}
              </DetailField>
              <DetailField
                label={translate("list.fields.lastName")}
                icon={<User />}
              >
                {lastName}
              </DetailField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label={translate("list.fields.email")}
                icon={<Mail />}
              >
                {email}
              </DetailField>
              <DetailField
                label={translate("list.fields.phone")}
                icon={<Phone />}
              >
                {(record.phone as string) || ""}
              </DetailField>
            </div>
          </FormSection>

          <FormSection
            icon={<Shield />}
            title={translate("users.form.sections.access", { _: "" })}
            subtitle={translate("users.form.sections.access_hint", { _: "" })}
            className="border-t pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label={translate("list.fields.role")}
                icon={<Shield />}
              >
                <RoleBadge />
              </DetailField>
              <DetailField
                label={translate("list.fields.status")}
                icon={<CircleDot />}
              >
                {translate(`users.status.${statusKey}`, { _: statusKey })}
              </DetailField>
            </div>
            <DetailField
              label={translate("list.fields.createdAt")}
              icon={<CalendarDays />}
            >
              <DateField source="createdAt" showTime />
            </DetailField>
          </FormSection>
        </RecordContextProvider>
      )}
    </ResourceDetailModal>
  );
}
