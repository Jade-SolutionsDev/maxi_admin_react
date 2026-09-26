import { useGetIdentity, useTranslate } from "ra-core";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import {
  ColumnsButton,
  DataTable,
  DateField,
  List,
  RefreshButton,
  RowNumberField,
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
      {/* <FilterButton variant="outline" size="lg" /> */}
      {canManage && (
        <Link to="/users/create" className={cn(buttonVariants({ size: "lg" }))}>
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
      actions={<UserActions />}
      resource="users"
      title={translate("resources.users.name_plural")}
      perPage={10}
      sort={{ field: "id", order: "DESC" }}
      /*
        Sin esto la lista no traia las invitaciones pendientes, y como sus
        acciones inline —reenviar y revocar— solo salen en filas con
        `isPending`, no habia forma de reenviar una invitacion desde el modulo
        (MxH-0098). La API ya las devolvia; nadie se las pedia.
      */
      filter={{ includeInvitations: true }}
    >
      <DataTable
        hasBulkActions={false}
        // Open the detail modal on row click. Pending invitations are synthetic
        // and soft-deleted users aren't returned by GET /users/:id, so neither
        // is clickable.
        rowClick={(_id, _resource, record) =>
          record.isPending || record.isDeleted ? false : `/users/${record.id}`
        }
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
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
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
        {/*
          Estaba comentada, y con ella desaparecieron las unicas acciones que
          no viven en el modal de detalle: reenviar y revocar una invitacion
          pendiente, y restaurar un usuario eliminado. Ninguna de esas filas
          abre modal —una invitacion no es un usuario y un eliminado no lo
          devuelve GET /users/:id—, asi que sin esta columna no habia forma de
          hacerlo desde el modulo (MxH-0098). La celda se pinta sola cuando no
          hay nada que ofrecer.
        */}
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
