import {
    BadgeField,
    ColumnsButton,
    CreateButton,
    DateField,
    FilterButton,
    RefreshButton,
    SearchInput,
    SelectInput,
} from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";

const clientFilters = [<SearchInput source="q" alwaysOn />, <SelectInput label="list.fields.isActive" source="isActive" choices={[
    { id: 'true', name: 'Yes' },
    { id: 'false', name: 'No' },
]} />];

const ClientActions = () => (
  <div className="flex gap-2">
    <CreateButton />
    <RefreshButton />
    <ColumnsButton />
    <FilterButton variant="default" size="lg" />
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
      <DataTable.Col source="email" label='list.fields.email' />
      <DataTable.Col source="firstName" label='list.fields.firstName' />
      <DataTable.Col source="lastName" label='list.fields.lastName' />
      <DataTable.Col source="phone" label='list.fields.phone' />
      <DataTable.Col source="defaultMunicipalityId" label='list.fields.defaultMunicipality' disableSort>
        <ReferenceField
          source="defaultMunicipalityId"
          reference="defaultMunicipalities"
        />
      </DataTable.Col>
      <DataTable.Col source="isActive" label='list.fields.isActive' />
      <DataTable.Col source="onboardingCompleted" label='list.fields.onboardingStatus' />
      <DataTable.Col label="list.fields.createdAt" source="createdAt">
        <DateField source="createdAt" />
      </DataTable.Col>
      <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
        <DateField source="updatedAt" />
      </DataTable.Col>
    </DataTable>
  </List>
);
