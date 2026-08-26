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
import type { NomenclatorCategoryId } from "./nomenclatorCategories";

const NomenclatorsActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "nomenclators",
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

export default function NomenclatorsList({
  category,
}: {
  category: NomenclatorCategoryId;
}) {
  const translate = useTranslate();

  return (
    <List
      actions={<NomenclatorsActions />}
      resource="nomenclators"
      filter={{ category }}
      title={translate("resources.nomenclators.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/nomenclators/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "category", "deletedAt"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="nomenclators.fields.label"
          source="label"
          cellClassName="min-w-[200px]"
        />
        <DataTable.Col source="code" label="list.fields.slug" />
        <DataTable.Col
          className="max-w-sm truncate"
          source="description"
          label="list.fields.description"
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
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
