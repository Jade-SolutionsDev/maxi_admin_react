import { useCanAccess, useRecordContext, useTranslate } from "ra-core";

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

const CmsBannersActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "cms-banners",
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

const BannerThumbnail = () => {
  const record = useRecordContext();
  const src = (record?.desktop as { src?: string } | undefined)?.src;
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="h-10 w-24 rounded-md border border-border object-cover"
    />
  );
};

export default function CmsBannersList() {
  const translate = useTranslate();

  return (
    <List
      actions={<CmsBannersActions />}
      resource="cms-banners"
      title={translate("resources.cms-banners.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/cms-banners/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "deletedAt"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col label="list.fields.imageDesktop" disableSort>
          <BannerThumbnail />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.alt"
          source="alt"
          cellClassName="min-w-[200px]"
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
