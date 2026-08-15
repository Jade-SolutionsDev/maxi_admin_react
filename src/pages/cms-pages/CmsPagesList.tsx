import { useCanAccess, useTranslate } from "ra-core";

import {
  BooleanField,
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  List,
  RefreshButton,
  RowNumberField,
} from "@/components/admin";

const CmsPagesActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "cms-pages",
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      {canCreate && <CreateButton />}
      <ColumnsButton />
    </div>
  );
};

export default function CmsPagesList() {
  const translate = useTranslate();

  return (
    <List
      actions={<CmsPagesActions />}
      resource="cms-pages"
      title={translate("resources.cms-pages.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/cms-pages/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "deletedAt"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.title"
          source="title"
          cellClassName="min-w-[220px]"
        />
        <DataTable.Col source="slug" label="list.fields.slug" />
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
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
