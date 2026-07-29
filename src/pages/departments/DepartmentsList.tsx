import { useCanAccess, useTranslate } from "ra-core";

import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  FilterButton,
  List,
  RefreshButton,
  RowNumberField,
  SearchInput,
} from "@/components/admin";

const departmentFilters = [
  <SearchInput source="q" alwaysOn />,
];

const DepartmentActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "departments",
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      {canCreate && <CreateButton />}
      <ColumnsButton />
      <FilterButton variant="outline" size="lg" />
    </div>
  );
};
export default function DepartmentsList() {
  const translate = useTranslate();

  return (
    <List
      filters={departmentFilters}
      actions={<DepartmentActions />}
      resource="departments"
      title={translate("resources.departments.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/departments/${id}`}
        hiddenColumns={[
          "id",
          "parentId",
          "deletedAt",
          "updatedAt",
          "slug",
        ]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.name"
          source="name"
          cellClassName="min-w-[180px]"
        />
        <DataTable.Col source="slug" label="list.fields.slug" />
        <DataTable.Col className="max-w-sm truncate" source="description" label="list.fields.description" />
        {/* Server-computed total; not a sortable column. */}
        <DataTable.Col
          source="childrenCount"
          label="list.fields.childrenCount"
          disableSort
        />
        <DataTable.Col
          source="sortOrder"
          label="list.fields.sortOrder"
          disableSort
        />
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
