import {
  BadgeField,
  ColumnsButton,
  CreateButton,
  DateField,
  RefreshButton,
  SearchInput,
} from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";

const clientFilters = [<SearchInput source="q" alwaysOn />];

const ClientActions = () => (
  <div className="flex gap-2">
    <CreateButton />
    <RefreshButton />
    <ColumnsButton />
  </div>
);

export const ClientList = () => (
  <List
    filters={clientFilters}
    actions={<ClientActions />}
    resource="clients"
    title="Clients"
  >
    <DataTable hiddenColumns={["id"]}>
      <DataTable.Col source="id">
        <BadgeField source="id" variant="default" truncate />
      </DataTable.Col>
      <DataTable.Col source="avatarUrl" disableSort>
        <img
          src="https://via.placeholder.com/40"
          alt="Avatar"
          className="w-10 h-10 bg-accent rounded-full"
        />
      </DataTable.Col>
      <DataTable.Col source="email" />
      <DataTable.Col source="firstName" />
      <DataTable.Col source="lastName" />
      <DataTable.Col source="phone" disableSort />
      <DataTable.Col source="defaultMunicipalityId" disableSort>
        <ReferenceField
          source="defaultMunicipalityId"
          reference="defaultMunicipalities"
        />
      </DataTable.Col>
      <DataTable.Col source="isActive" />
      <DataTable.Col source="onboardingCompleted" />
      <DataTable.Col label="list.fields.createdAt" source="createdAt">
        <DateField source="createdAt" />
      </DataTable.Col>
      <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
        <DateField source="updatedAt" />
      </DataTable.Col>
    </DataTable>
  </List>
);
