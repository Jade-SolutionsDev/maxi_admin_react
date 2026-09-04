import {
  BadgeField,
  BooleanField,
  ColumnsButton, DateField,
  FilterButton,
  RefreshButton,
  SearchInput,
  SelectInput
} from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { RowNumberField } from "@/components/admin/row-number-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { personInitials } from "@/lib/initials";
import { useRecordContext, useTranslate } from "ra-core";
import { User } from "lucide-react";

/**
 * Avatar del cliente, con iniciales de respaldo.
 *
 * Radix cambia solo a `AvatarFallback` cuando la imagen no carga o cuando no
 * hay `src`, que es lo que este listado necesitaba: antes pintaba un
 * placeholder remoto fijo y lo que se veía era el icono de imagen rota.
 */
const ClientAvatar = () => {
  const record = useRecordContext();
  if (!record) return null;

  const firstName = (record.firstName as string | null) ?? "";
  const lastName = (record.lastName as string | null) ?? "";
  const email = (record.email as string | null) ?? "";
  const initials = personInitials({ firstName, lastName, email });
  const name = `${firstName} ${lastName}`.trim() || email;

  return (
    <Avatar className="h-10 w-10 border border-border/50">
      <AvatarImage
        src={(record.avatarUrl as string | null) ?? undefined}
        alt={name || "Avatar"}
      />
      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
        {initials || <User size={16} aria-hidden />}
      </AvatarFallback>
    </Avatar>
  );
};

const clientFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    label="list.fields.isActive"
    source="isActive"
    choices={[
      { id: "true", name: "Yes" },
      { id: "false", name: "No" },
    ]}
  />,
];

const ClientActions = () => (
  <div className="flex gap-2">
    <RefreshButton />
    {/* <CreateButton /> */}
    <ColumnsButton />
    <FilterButton variant="default" size="lg" />
  </div>
);

export const ClientList = () => {
  const translate = useTranslate();

  return (
    <List
      filters={clientFilters}
      actions={<ClientActions />}
      resource="clients"
      title={translate("resources.clients.name_plural")}
    >
      <DataTable
        hasBulkActions={false}
        hiddenColumns={["id", "onboardingCompleted"]}
        rowClick={(id) => `/clients/${id}`}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col source="id" label="list.fields.id">
          <BadgeField source="id" variant="default" truncate />
        </DataTable.Col>
        <DataTable.Col
          source="avatarUrl"
          disableSort
          label="list.fields.avatar"
        >
          <ClientAvatar />
        </DataTable.Col>
        <DataTable.Col source="email" label="list.fields.email" />
        <DataTable.Col source="firstName" label="list.fields.firstName" />
        <DataTable.Col source="lastName" label="list.fields.lastName" />
        <DataTable.Col source="phone" label="list.fields.phone" disableSort />
        <DataTable.Col
          source="defaultMunicipalityId"
          label="list.fields.defaultMunicipality"
          disableSort
        >
          <ReferenceField
            source="defaultMunicipalityId"
            reference="defaultMunicipalities"
          />
        </DataTable.Col>
        <DataTable.Col source="isActive" label="list.fields.isActive">
          <BooleanField
            valueLabelFalse="users.status.inactive"
            valueLabelTrue="users.status.active"
            source="isActive"
          />
        </DataTable.Col>
        <DataTable.Col
          source="onboardingCompleted"
          label="list.fields.onboardingStatus"
        >
          <BooleanField
            source="onboardingCompleted"
            valueLabelFalse="list.fields.incomplete"
            valueLabelTrue="list.fields.complete"
          />
        </DataTable.Col>
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};
