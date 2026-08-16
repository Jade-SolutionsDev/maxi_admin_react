import { useCanAccess, useTranslate } from "ra-core";
import { ServiceIconField } from "./ServiceIconField";

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

const CmsServicesActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "cms-services",
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

export default function CmsServicesList() {
  const translate = useTranslate();

  return (
    <List
      actions={<CmsServicesActions />}
      resource="cms-services"
      title={translate("resources.cms-services.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/cms-services/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "deletedAt"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.title"
          source="title"
          cellClassName="min-w-[200px]"
        />
        <DataTable.Col source="icon" label="list.fields.icon" disableSort>
          <ServiceIconField />
        </DataTable.Col>
        <DataTable.Col
          className="max-w-sm truncate"
          source="description"
          label="list.fields.description"
        />
        <DataTable.Col
          source="isFeatured"
          label="list.fields.featured"
          disableSort
        >
          <BooleanField
            valueLabelFalse="shared.filters.no"
            valueLabelTrue="shared.filters.yes"
            source="isFeatured"
          />
        </DataTable.Col>
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
