import { type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useGetIdentity,
  useGetOne,
  useTranslate,
} from "ra-core";
import { DateField } from "@/components/admin";
import { Pencil, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
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

/**
 * URL-routed read-only detail view for a user, mounted at `/users/:id` inside
 * the users layout's <Outlet>. Closing navigates back to the list; the footer
 * Edit button opens the edit form (managers only).
 */
export default function UserDetailModal() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity();

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
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const avatarUrl = (record?.avatarUrl as string | null) ?? undefined;

  const statusKey = record?.isAwaitingApproval
    ? "awaiting_approval"
    : record?.isActive
      ? "active"
      : "inactive";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {fullName ||
              email ||
              translate("shared.actions.view", { _: "Details" })}
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
          <DialogFooter>
            <Link
              to={`/users/edit/${record.id}`}
              className={cn(buttonVariants())}
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
