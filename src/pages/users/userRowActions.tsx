import { useState } from "react";
import {
  useDataProvider,
  useGetIdentity,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
} from "ra-core";
import { MailCheck, RotateCcw, XCircle } from "lucide-react";

import type { ExtendedDataProvider } from "@/providers/dataProvider";
import {
  ConfirmIconButton,
  IconButton,
} from "@/components/admin/confirm-icon-button";
import { backendMessage } from "./errors";

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
