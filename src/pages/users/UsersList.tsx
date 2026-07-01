import { useState } from "react";
import {
  useDelete,
  useGetIdentity,
  useGetRecordRepresentation,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { Pencil, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  <SearchInput source="q" alwaysOn placeholder="ra.action.search" />,
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
  const getRecordRepresentation = useGetRecordRepresentation(resource);
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

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {translate("users.actions.delete_confirm_title", {
              _: "Delete user",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {translate("users.actions.delete_confirm_description", {
              _: "Are you sure you want to delete %{name}? This action cannot be undone.",
              name: getRecordRepresentation(record),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
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
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30",
            )}
            onClick={() => navigate(`/users/edit/${record?.id}`)}
            aria-label={translate("users.actions.edit", { _: "Edit" })}
          >
            <Pencil size={16} />
          </Button>
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
