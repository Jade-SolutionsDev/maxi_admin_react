import {
  BooleanField,
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  FilterButton,
  List,
  ReferenceField,
  RefreshButton,
  SearchInput,
  SelectInput,
} from "@/components/admin";
import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { useTranslate } from "ra-core";

const userFilters = [
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

const UserActions = () => (
  <div className="flex gap-2">
    <RefreshButton />
    <CreateButton />
    <InviteUserDialog />
    <ColumnsButton />
    <FilterButton variant="default" size="lg" />
  </div>
);

const UsersList = () => {
  const translate = useTranslate();

  return (
    <List
      filters={userFilters}
      actions={<UserActions />}
      resource="users"
      title={translate("resources.users.name_plural")}
    >
      <DataTable hiddenColumns={["id"]}>
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
        <DataTable.Col source="userType" />
        <DataTable.Col source="email" label="list.fields.email" />
        <DataTable.Col source="firstName" label="list.fields.firstName" />
        <DataTable.Col source="lastName" label="list.fields.lastName" />
        <DataTable.Col source="phone" label="list.fields.phone" disableSort />
        <DataTable.Col source="businessName" />
        <DataTable.Col source="businessDescription" />
        <DataTable.Col source="businessLogoUrl" />
        <DataTable.Col source="clerkOrgId">
          <ReferenceField source="clerkOrgId" reference="clerkOrgs" />
        </DataTable.Col>
        <DataTable.Col source="isActive" label="list.fields.isActive">
          <BooleanField source="isActive" />
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

export default UsersList;
