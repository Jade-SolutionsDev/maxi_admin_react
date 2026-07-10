import { useGetIdentity, useTranslate } from "ra-core";
import { UserPlus } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
import { roleChoices } from "./roleChoices";
import { RoleBadge } from "./RoleBadge";
import { StatusCell, UserAvatar, UserNameCell } from "./userCells";
import { UserActionsCell } from "./userRowActions";

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
