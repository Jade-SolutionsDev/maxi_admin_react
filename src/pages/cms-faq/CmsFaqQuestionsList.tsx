import { useCanAccess, useTranslate } from "ra-core";
import {
  BooleanField,
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  List,
  ReferenceField,
  RefreshButton,
  RowNumberField,
} from "@/components/admin";

const Actions = () => {
  const { canAccess } = useCanAccess({
    resource: "cms-faq-questions",
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

export function CmsFaqQuestionsList() {
  const translate = useTranslate();
  return (
    <List
      resource="cms-faq-questions"
      actions={<Actions />}
      title={translate("resources.cms-faq-questions.name_plural")}
      perPage={15}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/cms-faq-questions/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "answer", "linkLabel", "linkHref"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col source="question" label="cms-faq.fields.question" />
        <DataTable.Col
          source="categoryId"
          label="cms-faq.fields.category"
          disableSort
        >
          <ReferenceField
            source="categoryId"
            reference="cms-faq-categories"
            link={false}
          />
        </DataTable.Col>
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
