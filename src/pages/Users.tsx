import {
  LinkBase,
  useCreatePath,
  useDeleteWithUndoController,
  useGetIdentity,
  useGetRecordRepresentation,
  useRecordContext,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { Pencil, Trash2, User } from "lucide-react";

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
import { Button } from "@/components/ui/button";
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

  const isSelf = record?.id === identity?.id;
  const { isPending, handleDelete } = useDeleteWithUndoController({
    record,
    resource,
  });

  if (isSelf) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isPending}
            aria-label={translate("users.actions.delete", { _: "Delete" })}
          >
            <Trash2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {translate("ra.action.delete_item", {
              _: "Delete %{name}",
              name: getRecordRepresentation(record),
            })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const UserEditButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const translate = useTranslate();
  const createPath = useCreatePath();

  const link = createPath({
    resource,
    type: "edit",
    id: record?.id,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <LinkBase
            to={link}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
              "text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30",
            )}
            aria-label={translate("users.actions.edit", { _: "Edit" })}
          >
            <Pencil size={16} />
          </LinkBase>
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

const UsersList = () => {
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
        <DataTable.Col label="list.fields.actions" disableSort cellClassName="text-center w-24">
          <UserActionsCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};

export default UsersList;
