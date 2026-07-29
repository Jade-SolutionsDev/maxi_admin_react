import { useRecordContext, useTranslate } from "ra-core";
import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BooleanField } from "@/components/admin/boolean-field";
import { cn } from "@/lib/utils";

const StatusPill = ({
  tone,
  labelKey,
  fallback,
}: {
  tone: "amber" | "slate" | "indigo";
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
        tone === "indigo" &&
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      )}
    >
      {translate(labelKey, { _: fallback })}
    </span>
  );
};

export const StatusCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  if (record.isPending) {
    return (
      <StatusPill
        tone="amber"
        labelKey="users.status.pending"
        fallback="Pending"
      />
    );
  }
  if (record.isAwaitingApproval) {
    return (
      <StatusPill
        tone="indigo"
        labelKey="users.status.awaiting_approval"
        fallback="Awaiting approval"
      />
    );
  }
  if (record.isDeleted) {
    return (
      <StatusPill
        tone="slate"
        labelKey="users.status.deleted"
        fallback="Deleted"
      />
    );
  }
  // Read-only boolean; toggling active/inactive now happens in the edit form.
  return (
    <BooleanField
      valueLabelFalse="users.status.inactive"
      valueLabelTrue="users.status.active"
      source="isActive"
    />
  );
};

export const UserAvatar = () => {
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

export const UserNameCell = () => {
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
