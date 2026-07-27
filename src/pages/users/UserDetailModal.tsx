import { useState, type ReactNode } from "react";
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
import { DateField } from "@/components/admin";
import { AlertTriangle, CheckCircle2, Pencil, Trash2, User, XCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
import { RoleBadge } from "./RoleBadge";
import { backendMessage } from "./errors";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border/50 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm wrap-break-word">{children}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-6 w-full rounded bg-muted animate-pulse" />
      ))}
    </div>
  );
}

/** Footer button that confirms in an AlertDialog before running its action. */
function ConfirmActionButton({
  label,
  icon,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          destructive &&
            "text-destructive hover:text-destructive hover:bg-destructive/10",
        )}
      >
        {icon}
        {label}
      </Button>

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
            onClick={async () => {
              setOpen(false);
              await onConfirm();
            }}
            disabled={disabled}
            className={cn(destructive && buttonVariants({ variant: "destructive" }))}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * URL-routed read-only detail view for a user, mounted at `/users/:id` inside
 * the users layout's <Outlet>. Closing navigates back to the list. The footer
 * carries the actions (managers only): Approve/Reject for a user awaiting
 * approval, otherwise Edit + Delete.
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {name || translate("shared.actions.view", { _: "Details" })}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {fullName ? email : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !record ? (
          <DetailSkeleton />
        ) : (
          <RecordContextProvider value={record}>
            <div className="mt-1 flex justify-center">
              <Avatar className="h-20 w-20 border border-border/50">
                <AvatarImage src={avatarUrl} alt={initials || "Avatar"} />
                <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
                  {initials || <User size={24} />}
                </AvatarFallback>
              </Avatar>
            </div>

            <dl className="mt-2">
              <DetailRow label={translate("list.fields.email")}>
                {email || "—"}
              </DetailRow>
              <DetailRow label={translate("list.fields.phone")}>
                {(record.phone as string) || "—"}
              </DetailRow>
              <DetailRow label={translate("list.fields.role")}>
                <RoleBadge />
              </DetailRow>
              <DetailRow label={translate("list.fields.status")}>
                {translate(`users.status.${statusKey}`, { _: statusKey })}
              </DetailRow>
              <DetailRow label={translate("list.fields.createdAt")}>
                <DateField source="createdAt" showTime />
              </DetailRow>
            </dl>
          </RecordContextProvider>
        )}

        {record && canManage && (
          <DialogFooter className="sm:justify-end gap-2">
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
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
