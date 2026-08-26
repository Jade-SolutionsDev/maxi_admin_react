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

const ContactTemplatesActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "contact-templates",
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

export default function ContactTemplatesList() {
  const translate = useTranslate();

  return (
    <List
      actions={<ContactTemplatesActions />}
      resource="contact-templates"
      title={translate("resources.contact-templates.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/contact-templates/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "deletedAt", "motiveId"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.title"
          source="title"
          cellClassName="min-w-[200px]"
        />
        <DataTable.Col
          className="max-w-md truncate"
          source="body"
          label="contact-templates.fields.body"
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
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
