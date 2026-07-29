import { useState } from "react";
import {
  useDataProvider,
  useGetIdentity,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
} from "ra-core";
import {
  AlertTriangle,
  MailCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";

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


/**
 * Icon button that asks for confirmation before running its action — the
 * button-shaped counterpart to ConfirmToggleField. Destructive actions get the
 * warning glyph and a destructive CTA.
 */
const ConfirmIconButton = ({
  icon,
  label,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive,
  disabled,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}) => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <IconButton
        label={label}
        className={className}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {icon}
      </IconButton>

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="space-y-3">
          {destructive && (
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          )}
          <AlertDialogTitle className="text-center sm:text-left text-lg">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel disabled={disabled}>
            {translate("shared.actions.cancel", { _: "Cancel" })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={disabled}
            className={cn(
              destructive && buttonVariants({ variant: "destructive" }),
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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

  const email = (record.email as string) ?? "";

  return (
    <div className="flex items-center justify-center gap-1">
      <ConfirmIconButton
        icon={<MailCheck size={16} />}
        label={translate("users.actions.resend", { _: "Resend invitation" })}
        className="text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30"
        disabled={busy}
        title={translate("users.confirm.resend.title", {
          _: "Resend invitation",
        })}
        description={translate("users.confirm.resend.description", {
          email,
          _: `Send the invitation to ${email} again?`,
        })}
        confirmLabel={translate("users.actions.resend", { _: "Resend" })}
        onConfirm={() =>
          run(
            () => dataProvider.resendInvitation(String(record.id)),
            "users.actions.resend_success",
            "Invitation resent",
          )
        }
      />
      <ConfirmIconButton
        icon={<XCircle size={16} />}
        label={translate("users.actions.revoke", { _: "Revoke invitation" })}
        className="text-destructive hover:bg-destructive/10"
        destructive
        disabled={busy}
        title={translate("users.confirm.revoke.title", {
          _: "Revoke invitation",
        })}
        description={translate("users.confirm.revoke.description", {
          email,
          _: `Revoke the invitation for ${email}? The link will stop working.`,
        })}
        confirmLabel={translate("users.actions.revoke", { _: "Revoke" })}
        onConfirm={() =>
          run(
            () => dataProvider.revokeInvitation(String(record.id)),
            "users.actions.revoke_success",
            "Invitation revoked",
          )
        }
      />
    </div>
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

export const UserActionsCell = () => {
  const record = useRecordContext();

  // Normal and awaiting-approval rows open the detail modal, which now hosts
  // their actions (edit / change-password / delete / approve / reject). Only
  // the non-navigable synthetic rows keep inline actions: a pending invitation
  // is not a user, and a soft-deleted user isn't returned by GET /users/:id.
  let content: React.ReactNode = null;
  if (record?.isPending) {
    content = <InvitationActionsCell />;
  } else if (record?.isDeleted) {
    content = <UserRestoreButton />;
  }

  if (!content) return null;

  // The row itself opens the detail modal — keep action clicks from bubbling.
  return (
    <div
      className="flex items-center justify-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </div>
  );
};
