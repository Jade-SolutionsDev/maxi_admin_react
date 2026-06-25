import { DateField, SearchInput } from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";

const clientFilters = [
    <SearchInput source="q" alwaysOn />
];

export const ClientList = () => (
    <List filters={clientFilters} resource="clients" title="Clients">
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
            <DataTable.Col label='Creado' source="createdAt"  >
                <DateField source="createdAt" />
            </DataTable.Col>
            <DataTable.Col source="updatedAt" />
        </DataTable>
    </List>
);