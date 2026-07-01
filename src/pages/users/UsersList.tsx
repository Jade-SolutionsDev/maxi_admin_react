import { useState } from "react";
import {
  useDelete,
  useGetIdentity,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useTranslate
} from "ra-core";
import { AlertTriangle, Pencil, Trash2, User } from "lucide-react";
import { Link } from "react-router-dom";

import {
  BooleanField,
  ColumnsButton,
  DataTable,
  DateField,
  FilterButton,
  List,
  RefreshButton,
  SearchInput,
  SelectInput,
} from "@/components/admin";

import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { StatusToggleInput } from "@/components/users/StatusToggleInput";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const userTypeChoices = [
  { id: "admin", name: "Admin" },
  { id: "provider", name: "Provider" },
  { id: "staff", name: "Staff" },
];

const userFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="userType"
    label="users.filters.userType"
    choices={userTypeChoices}
    alwaysOn
    emptyText="users.filters.all"
  />,
  <StatusToggleInput source="isActive" alwaysOn />,
];

const UserActions = () => (
  <div className="flex items-center gap-2">
    <RefreshButton />
    <InviteUserDialog />
    <ColumnsButton />
    <FilterButton variant="outline" size="lg" />
  </div>
);

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
  const translate = useTranslate();
  if (!record) return null;

  const firstName = (record.firstName as string | null) ?? "";
  const lastName = (record.lastName as string | null) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = (record.email as string | null) ?? "";

  return (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">
        {fullName || translate("ra.page.loading")}
      </span>
      {email && <span className="text-xs text-muted-foreground">{email}</span>}
    </div>
  );
};

const UserDeleteButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);

  const [deleteOne, { isPending }] = useDelete(resource, {
    id: record?.id,
    previousData: record,
  });

  const isSelf = record?.id === identity?.id;

  if (isSelf) {
    return null;
  }

  const firstName = (record?.firstName as string | null) ?? "";
  const lastName = (record?.lastName as string | null) ?? "";
  const email = (record?.email as string | null) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const displayName = fullName || email;

  const handleConfirm = async () => {
    await deleteOne(
      resource,
      { id: record?.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          setOpen(false);
          refresh();
        },
        onError: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => setOpen(true)}
              aria-label={translate("users.actions.delete", { _: "Delete" })}
            >
              <Trash2 size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{translate("users.actions.delete", { _: "Delete" })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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
              _: "Are you sure you want to delete %{name}? This action cannot be undone.",
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
              ? translate("ra.action.loading", { _: "Deleting…" })
              : translate("users.actions.confirm", { _: "Delete" })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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

const UserActionsCell = () => {
  return (
    <div className="flex items-center justify-center gap-1">
      <UserEditButton />
      <UserDeleteButton />
    </div>
  );
};

export default function UsersList() {
  const translate = useTranslate();

  return (
    <List
      filters={userFilters}
      actions={<UserActions />}
      resource="users"
      title={translate("resources.users.name_plural")}
      perPage={10}
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
        <DataTable.Col source="userType" label="list.fields.userType" />
        <DataTable.Col source="email" label="list.fields.email" />
        <DataTable.Col source="phone" label="list.fields.phone" disableSort />
        <DataTable.Col source="isActive" label="list.fields.isActive">
          <BooleanField source="isActive" />
        </DataTable.Col>
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.actions"
          disableSort
          cellClassName="text-center w-24"
        >
          <UserActionsCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
