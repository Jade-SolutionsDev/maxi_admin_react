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
import type { CmsText } from "./cms-text";
import type { CmsTextScreen } from "./cms-text-screens";
import { NoticeSchedule } from "./NoticeSchedule";
import { PublicationStatusBadge } from "./PublicationStatusBadge";

const CmsTextsActions = ({ screen }: { screen: CmsTextScreen }) => {
  const { canAccess: canCreate } = useCanAccess({
    resource: screen.resource,
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      {canCreate && <CreateButton resource={screen.resource} />}
      <ColumnsButton />
    </div>
  );
};

const PublicationStatusCell = () => {
  const record = useRecordContext<CmsText>();
  if (!record) return null;
  return <PublicationStatusBadge status={record.publicationStatus} />;
};

const ScheduleCell = () => {
  const record = useRecordContext<CmsText>();
  if (!record) return null;
  return <NoticeSchedule notice={record} />;
};

export function CmsTextsList({ screen }: { screen: CmsTextScreen }) {
  const translate = useTranslate();

  return (
    <List
      actions={<CmsTextsActions screen={screen} />}
      resource={screen.resource}
      title={translate(`resources.${screen.resource}.name_plural`)}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `${screen.basePath}/${id}`}
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
        {screen.isNotice ? (
          <DataTable.Col
            label="cms-home-notices.fields.schedule"
            source="startsAt"
            disableSort
          >
            <ScheduleCell />
          </DataTable.Col>
        ) : (
          <DataTable.Col source="slug" label="list.fields.slug" />
        )}
        <DataTable.Col
          label="cms-texts.fields.publication"
          source="publicationStatus"
          disableSort
        >
          <PublicationStatusCell />
        </DataTable.Col>
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
