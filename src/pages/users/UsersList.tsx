import { useState } from "react";
import {
  useDataProvider,
  useDelete,
  useGetIdentity,
  useNotify,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useTranslate,
  useUpdate,
} from "ra-core";
import {
  AlertTriangle,
  KeyRound,
  MailCheck,
  Pencil,
  RotateCcw,
  Trash2,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  ColumnsButton,
  DataTable,
  DateField,
  FilterButton,
  List,
  RefreshButton,
  SearchInput,
  SelectInput,
} from "@/components/admin";

import { StatusToggleInput } from "@/components/users/StatusToggleInput";
import { ShowDeletedInput } from "@/components/users/ShowDeletedInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
import { roleChoices } from "./roleChoices";
import { RoleBadge } from "./RoleBadge";

const userFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="role"
    label="list.fields.role"
    choices={roleChoices}
    alwaysOn
    emptyText="users.filters.all"
  />,
  <StatusToggleInput source="status" alwaysOn />,
  <ShowDeletedInput source="includeDeleted" alwaysOn />,
];

function backendMessage(error: unknown, fallback: string): string {
  const e = error as { body?: { error?: { message?: string } }; message?: string };
  return e?.body?.error?.message ?? e?.message ?? fallback;
}

const StatusPill = ({ tone, labelKey, fallback }: {
  tone: "amber" | "slate";
  labelKey: string;
  fallback: string;
}) => {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "amber" &&
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        tone === "slate" &&
          "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
      )}
    >
      {translate(labelKey, { _: fallback })}
    </span>
  );
};

/** Inline enable/disable switch that PATCHes `isActive` on the user. */
const ActiveToggle = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [update, { isPending }] = useUpdate();

  if (!record) return null;
  const checked = record.isActive === true;

  const handleChange = async (value: boolean) => {
    try {
      await update(
        resource,
        { id: record.id, data: { isActive: value }, previousData: record },
        { mutationMode: "pessimistic" },
      );
      notify(value ? "users.actions.enable_success" : "users.actions.disable_success", {
        type: "success",
        messageArgs: { _: value ? "User enabled" : "User disabled" },
      });
      refresh();
    } catch (error) {
      notify(backendMessage(error, "Could not update user"), { type: "error" });
      refresh();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isPending}
        aria-label={translate(
          checked ? "users.actions.disable" : "users.actions.enable",
          { _: checked ? "Disable" : "Enable" },
        )}
      />
      <span className="text-xs text-muted-foreground">
        {translate(`users.status.${checked ? "active" : "inactive"}`, {
          _: checked ? "Active" : "Inactive",
        })}
      </span>
    </div>
  );
};

const StatusCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  if (record.isPending) {
    return <StatusPill tone="amber" labelKey="users.status.pending" fallback="Pending" />;
  }
  if (record.isDeleted) {
    return <StatusPill tone="slate" labelKey="users.status.deleted" fallback="Deleted" />;
  }
  return <ActiveToggle />;
};

const UserActions = () => {
  const translate = useTranslate();
  const { data: identity } = useGetIdentity();
  const canManage = MANAGER_ROLES.includes(
    (identity?.role as Role) ?? "KARDIST",
  );

  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      <ColumnsButton />
      <FilterButton variant="outline" size="lg" />
      {canManage && (
        <Link
          to="/users/create"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {translate("users.actions.add", { _: "Invite user" })}
        </Link>
      )}
    </div>
  );
};

const UserAvatar = () => {
  const record = useRecordContext();
  if (!record) return null;

  const firstName = (record.firstName as string | null) ?? "";
  const lastName = (record.lastName as string | null) ?? "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const avatarUrl = (record.avatarUrl as string | null) ?? undefined;

  return (
    <Avatar className="h-10 w-10 border border-border/50">
      <AvatarImage src={avatarUrl} alt={initials || "Avatar"} />
      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
        {initials || <User size={16} />}
      </AvatarFallback>
    </Avatar>
  );
};

const UserNameCell = () => {
  const record = useRecordContext();
  if (!record) return null;

  const firstName = (record.firstName as string | null) ?? "";
  const lastName = (record.lastName as string | null) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = (record.email as string | null) ?? "";

  return (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">{fullName || email}</span>
      {fullName && email && (
        <span className="text-xs text-muted-foreground">{email}</span>
      )}
    </div>
  );
};

const IconButton = ({
  onClick,
  label,
  className,
  children,
  disabled,
}: {
  onClick: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", className)}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/** Actions for a pending invitation row (synthetic user, `isPending === true`). */
const InvitationActionsCell = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);

  if (!record) return null;

  const run = async (
    fn: () => Promise<unknown>,
    successKey: string,
    fallback: string,
  ) => {
    setBusy(true);
    try {
      await fn();
      notify(successKey, { type: "success", messageArgs: { _: fallback } });
      refresh();
    } catch (error) {
      notify(backendMessage(error, fallback), { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <IconButton
        label={translate("users.actions.resend", { _: "Resend invitation" })}
        className="text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30"
        disabled={busy}
        onClick={() =>
          run(
            () => dataProvider.resendInvitation(String(record.id)),
            "users.actions.resend_success",
            "Invitation resent",
          )
        }
      >
        <MailCheck size={16} />
      </IconButton>
      <IconButton
        label={translate("users.actions.revoke", { _: "Revoke invitation" })}
        className="text-destructive hover:bg-destructive/10"
        disabled={busy}
        onClick={() =>
          run(
            () => dataProvider.revokeInvitation(String(record.id)),
            "users.actions.revoke_success",
            "Invitation revoked",
          )
        }
      >
        <XCircle size={16} />
      </IconButton>
    </div>
  );
};

const UserEditButton = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/users/edit/${record?.id}`}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
              "text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30",
            )}
            aria-label={translate("users.actions.edit", { _: "Edit" })}
          >
            <Pencil size={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{translate("users.actions.edit", { _: "Edit" })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const UserPasswordButton = () => {
  const record = useRecordContext();
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();

  // Own password is changed from the profile, not here (backend enforces too).
  if (!record || record.id === identity?.id) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/users/password/${record.id}`}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
              "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
            )}
            aria-label={translate("users.actions.change_password", {
              _: "Change password",
            })}
          >
            <KeyRound size={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{translate("users.actions.change_password", { _: "Change password" })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const UserRestoreButton = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { data: identity } = useGetIdentity();
  const [busy, setBusy] = useState(false);

  // Restore is only meaningful for soft-deleted users, and only SUPER_ADMIN can
  // perform it (the backend enforces this too).
  if (!record?.isDeleted || identity?.role !== "SUPER_ADMIN") return null;

  const handleRestore = async () => {
    setBusy(true);
    try {
      await dataProvider.restoreUser(String(record?.id));
      notify("users.actions.restore_success", {
        type: "success",
        messageArgs: { _: "User restored" },
      });
      refresh();
    } catch (error) {
      notify(backendMessage(error, "User restored"), { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <IconButton
      label={translate("users.actions.restore", { _: "Restore" })}
      className="text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      disabled={busy}
      onClick={handleRestore}
    >
      <RotateCcw size={16} />
    </IconButton>
  );
};

const UserDeleteButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);

  const [deleteOne, { isPending }] = useDelete();

  const isSelf = record?.id === identity?.id;
  // You cannot delete yourself; already-deleted rows show Restore instead.
  if (isSelf || record?.isDeleted) {
    return null;
  }

  const firstName = (record?.firstName as string | null) ?? "";
  const lastName = (record?.lastName as string | null) ?? "";
  const email = (record?.email as string | null) ?? "";
  const displayName = `${firstName} ${lastName}`.trim() || email;

  const handleConfirm = async () => {
    await deleteOne(
      resource,
      { id: record?.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          setOpen(false);
          notify("users.actions.delete_success", {
            type: "success",
            messageArgs: { _: "User deleted" },
          });
          refresh();
        },
        onError: (error) => {
          setOpen(false);
          notify(backendMessage(error, "Could not delete user"), {
            type: "error",
          });
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <IconButton
        label={translate("users.actions.delete", { _: "Delete" })}
        className="text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} />
      </IconButton>

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="space-y-3">
          <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center sm:text-left text-lg">
            {translate("users.actions.delete_confirm_title", {
              _: "Delete user",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-left">
            {translate("users.actions.delete_confirm_description", {
              _: "Are you sure you want to delete %{name}? You can restore them later from “Show deleted”.",
              name: displayName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel disabled={isPending}>
            {translate("users.actions.cancel", { _: "Cancel" })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {isPending
              ? translate("ra.action.loading", { _: "Working…" })
              : translate("users.actions.delete", { _: "Delete" })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const UserActionsCell = () => {
  const record = useRecordContext();
  if (record?.isPending) {
    return <InvitationActionsCell />;
  }
  if (record?.isDeleted) {
    return (
      <div className="flex items-center justify-center gap-1">
        <UserRestoreButton />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-1">
      <UserEditButton />
      <UserPasswordButton />
      <UserDeleteButton />
    </div>
  );
};

export default function UsersList() {
  const translate = useTranslate();

  return (
    <List
      filters={userFilters}
      filterDefaultValues={{ includeInvitations: true }}
      actions={<UserActions />}
      resource="users"
      title={translate("resources.users.name_plural")}
      perPage={10}
      sort={{ field: "id", order: "DESC" }}
    >
      <DataTable
        hiddenColumns={[
          "id",
          "businessName",
          "businessDescription",
          "businessLogoUrl",
          "clerkOrgId",
          "updatedAt",
          "createdBy",
          "clerkId",
          "isPending",
        ]}
      >
        <DataTable.Col
          source="avatarUrl"
          disableSort
          label="list.fields.avatar"
          cellClassName="w-14"
        >
          <UserAvatar />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.firstName"
          disableSort
          cellClassName="min-w-[180px]"
        >
          <UserNameCell />
        </DataTable.Col>
        <DataTable.Col source="role" label="list.fields.role" disableSort>
          <RoleBadge />
        </DataTable.Col>
        <DataTable.Col source="status" label="list.fields.status" disableSort>
          <StatusCell />
        </DataTable.Col>
        <DataTable.Col source="phone" label="list.fields.phone" disableSort />
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.actions"
          disableSort
          cellClassName="text-center w-28"
        >
          <UserActionsCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
