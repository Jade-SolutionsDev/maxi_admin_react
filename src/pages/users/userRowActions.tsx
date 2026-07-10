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
} from "ra-core";
import {
  AlertTriangle,
  KeyRound,
  MailCheck,
  Pencil,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

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
import { backendMessage } from "./errors";

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

export const UserActionsCell = () => {
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
