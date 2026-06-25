import { ColumnsButton, CreateButton, DateField, SearchInput } from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";

const clientFilters = [
    <SearchInput source="q" alwaysOn />
];

const ClientActions = () => (
    <div className="flex gap-2">
        <CreateButton />
        <ColumnsButton />
    </div>
);

export const ClientList = () => (
    <List filters={clientFilters} actions={<ClientActions />} resource="clients" title="Clients">
        <DataTable>
            <DataTable.Col source="id" />
            {/* <DataTable.Col source="clerkId">
                <ReferenceField source="clerkId" reference="clerks" />
            </DataTable.Col> */}
            <DataTable.Col source="email" />
            <DataTable.Col source="firstName" />
            <DataTable.Col source="lastName" />
            <DataTable.Col source="phone" disableSort />
            <DataTable.Col source="avatarUrl" disableSort />
            <DataTable.Col source="defaultMunicipalityId" disableSort>
                <ReferenceField source="defaultMunicipalityId" reference="defaultMunicipalities" />
            </DataTable.Col>
            <DataTable.Col source="isActive" />
            <DataTable.Col source="onboardingCompleted" />
            <DataTable.Col label='list.fields.createdAt' source="createdAt"  >
                <DateField source="createdAt" />
            </DataTable.Col>
            <DataTable.Col label='list.fields.updatedAt'  source="updatedAt" >
                <DateField source="updatedAt" />
            </DataTable.Col>
        </DataTable>
    </List>
);