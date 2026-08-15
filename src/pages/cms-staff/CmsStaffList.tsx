import { useCanAccess, useRecordContext, useTranslate } from "ra-core";
import { User } from "lucide-react";

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

const CmsStaffActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "cms-staff",
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

const StaffPhoto = () => {
  const record = useRecordContext();
  const url = record?.photoUrl as string | null | undefined;
  if (!url) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
        <User className="h-4 w-4 text-muted-foreground" />
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="h-10 w-10 rounded-full border border-border object-cover"
    />
  );
};

export default function CmsStaffList() {
  const translate = useTranslate();

  return (
    <List
      actions={<CmsStaffActions />}
      resource="cms-staff"
      title={translate("resources.cms-staff.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/cms-staff/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "deletedAt"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col label="list.fields.photo" disableSort>
          <StaffPhoto />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.name"
          source="name"
          cellClassName="min-w-[180px]"
        />
        <DataTable.Col source="role" label="list.fields.role" />
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
