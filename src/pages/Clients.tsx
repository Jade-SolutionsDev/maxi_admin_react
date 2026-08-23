import {
  BadgeField,
  BooleanField,
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
import { RowNumberField } from "@/components/admin/row-number-field";
import { useTranslate } from "ra-core";

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
        <DataTable.Col source="id">
          <BadgeField source="id" variant="default" truncate />
        </DataTable.Col>
        <DataTable.Col
          source="avatarUrl"
          disableSort
          label="list.fields.avatar"
        >
          <img
            src="https://via.placeholder.com/40"
            alt="Avatar"
            className="w-10 h-10 bg-accent rounded-full"
          />
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
