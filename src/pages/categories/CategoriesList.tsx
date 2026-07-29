import { useCanAccess, useTranslate } from "ra-core";

import {
  BooleanField,
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  FilterButton,
  List,
  ReferenceField,
  ReferenceInput,
  RefreshButton,
  RowNumberField,
  SearchInput,
  SelectInput,
} from "@/components/admin";

const categoryFilters = [
  <SearchInput source="q" alwaysOn />,
  <ReferenceInput
    source="departmentId"
    reference="departments"
    label="resources.departments.name"
    alwaysOn
  >
    <SelectInput
      className="min-w-64"
      optionText="name"
      label="resources.departments.name"
    />
  </ReferenceInput>,
];

const CategoryActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "categories",
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

export default function CategoriesList() {
  const translate = useTranslate();

  return (
    <List
      filters={categoryFilters}
      actions={<CategoryActions />}
      resource="categories"
      title={translate("resources.categories.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/categories/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "parentId", "deletedAt", "slug"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="resources.departments.name"
          source="parentId"
          disableSort
          cellClassName="min-w-[160px]"
        >
          <ReferenceField source="parentId" reference="departments" />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.name"
          source="name"
          cellClassName="min-w-[180px]"
        />
        <DataTable.Col source="slug" label="list.fields.slug" />
        <DataTable.Col
          className="max-w-sm truncate"
          source="description"
          label="list.fields.description"
        />
        {/* Server-computed total; not a sortable column. */}
        <DataTable.Col
          source="productsCount"
          label="list.fields.productsCount"
          disableSort
        />
        <DataTable.Col
          source="sortOrder"
          label="list.fields.sortOrder"
          disableSort
        />
        <DataTable.Col source="isActive" label="list.fields.status" disableSort>
          <BooleanField
            valueLabelFalse="users.status.inactive"
            valueLabelTrue="users.status.active"
            source="isActive"
          />
        </DataTable.Col>
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
