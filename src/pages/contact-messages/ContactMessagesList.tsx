import {
  ResourceContextProvider,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Inbox } from "lucide-react";

import {
  AutocompleteInput,
  DataTable,
  DateField,
  FilterButton,
  List,
  ReferenceInput,
  RefreshButton,
  RowNumberField,
  SearchInput,
  SelectInput,
  TextInput,
} from "@/components/admin";
import { MessageStatusBadge } from "./MessageBadges";
import {
  type ContactMessageStatus,
  MESSAGE_STATUSES,
} from "./messageStatus";

const messageFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    label="list.fields.status"
    choices={MESSAGE_STATUSES.map((s) => ({
      id: s,
      name: `contact-messages.status.${s}`,
    }))}
    alwaysOn
  />,
  <ReferenceInput
    source="motiveId"
    reference="contact-motives"
    filter={{ category: "contact-motive" }}
    label="contact-messages.fields.motive"
  >
    <AutocompleteInput
      label="contact-messages.fields.motive"
      optionText="label"
      className="min-w-56"
    />
  </ReferenceInput>,
  <TextInput
    source="createdFrom"
    type="date"
    label="contact-messages.fields.createdFrom"
  />,
  <TextInput
    source="createdTo"
    type="date"
    label="contact-messages.fields.createdTo"
  />,
];

const SenderCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  const fullName =
    [record.name, record.lastName].filter(Boolean).join(" ") || "—";
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Inbox size={16} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {fullName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {(record.email as string) || (record.phone as string) || ""}
        </p>
      </div>
    </div>
  );
};

const ExcerptCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <p className="max-w-xs truncate text-sm text-muted-foreground">
      {record.message as string}
    </p>
  );
};

const StatusCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <MessageStatusBadge status={record.status as ContactMessageStatus} />
  );
};

export default function ContactMessagesList() {
  const translate = useTranslate();
  return (
    <ResourceContextProvider value="contact-messages">
      <List
        filters={messageFilters}
        actions={
          <div className="flex items-center gap-2">
            <RefreshButton />
            <FilterButton variant="outline" size="lg" />
          </div>
        }
        title={translate("resources.contact-messages.name_plural", {
          _: "Mensajes",
        })}
        sort={{ field: "createdAt", order: "DESC" }}
        perPage={10}
        empty={false}
      >
        <DataTable
          rowClick={(id) => `/contact-messages/${id}`}
          bulkActionButtons={false}
        >
          <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
            <RowNumberField />
          </DataTable.Col>
          <DataTable.Col
            label="contact-messages.fields.sender"
            disableSort
            cellClassName="min-w-[200px]"
          >
            <SenderCell />
          </DataTable.Col>
          <DataTable.Col
            source="motiveLabel"
            label="contact-messages.fields.motive"
            disableSort
          />
          <DataTable.Col label="contact-messages.fields.excerpt" disableSort>
            <ExcerptCell />
          </DataTable.Col>
          <DataTable.Col source="status" label="list.fields.status" disableSort>
            <StatusCell />
          </DataTable.Col>
          <DataTable.Col source="createdAt" label="list.fields.createdAt">
            <DateField source="createdAt" showTime />
          </DataTable.Col>
        </DataTable>
      </List>
    </ResourceContextProvider>
  );
}
