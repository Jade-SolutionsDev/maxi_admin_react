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

const Actions = () => {
  const { canAccess } = useCanAccess({
    resource: "cms-faq-categories",
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      {canAccess && <CreateButton />}
      <ColumnsButton />
    </div>
  );
};

export function CmsFaqCategoriesList() {
  const translate = useTranslate();
  return (
    <List
      resource="cms-faq-categories"
      actions={<Actions />}
      title={translate("resources.cms-faq-categories.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/cms-faq-categories/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col source="title" label="list.fields.title" />
        <DataTable.Col
          source="questionCount"
          label="cms-faq.fields.questionCount"
          disableSort
        />
        <DataTable.Col source="sortOrder" label="list.fields.sortOrder" />
        <DataTable.Col source="isActive" label="list.fields.status" disableSort>
          <BooleanField
            source="isActive"
            valueLabelTrue="shared.status.active"
            valueLabelFalse="shared.status.inactive"
          />
        </DataTable.Col>
        <DataTable.Col source="updatedAt" label="list.fields.updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
