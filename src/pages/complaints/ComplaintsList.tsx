import { MessageSquareWarning } from "lucide-react";
import {
  ResourceContextProvider,
  useCanAccess,
  useRecordContext,
  useTranslate,
} from "ra-core";

import {
  AutocompleteInput,
  CreateButton,
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
import { ComplaintStatusBadge } from "./ComplaintBadges";
import { COMPLAINT_STATUSES, type ComplaintRecord } from "./complaintStatus";

const complaintFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    label="list.fields.status"
    choices={COMPLAINT_STATUSES.map((s) => ({
      id: s,
      name: `complaints.status.${s}`,
    }))}
    alwaysOn
  />,
  <ReferenceInput
    source="motiveId"
    reference="complaint-motives"
    filter={{ category: "complaint-motive" }}
    label="complaints.fields.motive"
  >
    <AutocompleteInput
      label="complaints.fields.motive"
      optionText="label"
      className="min-w-56"
    />
  </ReferenceInput>,
  <ReferenceInput
    source="clientId"
    reference="clients"
    label="complaints.fields.client"
  >
    <AutocompleteInput
      label="complaints.fields.client"
      optionText={(record: { firstName?: string; lastName?: string; email?: string }) =>
        [record.firstName, record.lastName].filter(Boolean).join(" ") ||
        record.email ||
        ""
      }
      className="min-w-56"
    />
  </ReferenceInput>,
  <TextInput
    source="createdFrom"
    type="date"
    label="complaints.fields.createdFrom"
  />,
  <TextInput
    source="createdTo"
    type="date"
    label="complaints.fields.createdTo"
  />,
];

const ClientCell = () => {
  const record = useRecordContext<ComplaintRecord>();
  if (!record) return null;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <MessageSquareWarning size={16} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {record.clientName || "—"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {record.orderNumber || ""}
        </p>
      </div>
    </div>
  );
};

const ExcerptCell = () => {
  const record = useRecordContext<ComplaintRecord>();
  if (!record) return null;
  return (
    <p className="max-w-xs truncate text-sm text-muted-foreground">
      {record.description}
    </p>
  );
};

const StatusCell = () => {
  const record = useRecordContext<ComplaintRecord>();
  if (!record) return null;
  return <ComplaintStatusBadge status={record.status} />;
};

const AssignedCell = () => {
  const record = useRecordContext<ComplaintRecord>();
  const translate = useTranslate();
  if (!record) return null;
  return (
    <span className="text-sm text-muted-foreground">
      {record.assignedUserName ||
        translate("complaints.sinAsignar", { _: "Sin asignar" })}
    </span>
  );
};

/**
 * Qué se ve cuando no hay ninguna queja.
 *
 * Una tabla vacía y sin más deja a quien entra sin saber si el módulo está
 * roto o si simplemente nadie se ha quejado todavía. Y lo segundo es una
 * buena noticia, así que se dice.
 */
const SinQuejas = () => {
  const translate = useTranslate();
  const { canAccess: canCreate } = useCanAccess({
    resource: "complaints",
    action: "create",
  });
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageSquareWarning size={22} />
      </span>
      <p className="text-sm font-medium text-foreground">
        {translate("complaints.empty.title", {
          _: "No hay ninguna queja registrada",
        })}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {translate("complaints.empty.hint", {
          _: "Cuando el Call Center registre una, aparecerá aquí con su historial.",
        })}
      </p>
      {canCreate && <CreateButton />}
    </div>
  );
};

const ComplaintsActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "complaints",
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      {canCreate && <CreateButton />}
      <RefreshButton />
      <FilterButton variant="outline" size="lg" />
    </div>
  );
};

export default function ComplaintsList() {
  const translate = useTranslate();
  return (
    <ResourceContextProvider value="complaints">
      <List
        filters={complaintFilters}
        actions={<ComplaintsActions />}
        title={translate("resources.complaints.name_plural", {
          _: "Quejas",
        })}
        sort={{ field: "createdAt", order: "DESC" }}
        perPage={10}
        empty={<SinQuejas />}
      >
        <DataTable
          rowClick={(id) => `/complaints/${id}`}
          bulkActionButtons={false}
        >
          <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
            <RowNumberField />
          </DataTable.Col>
          <DataTable.Col
            label="complaints.fields.client"
            disableSort
            cellClassName="min-w-[200px]"
          >
            <ClientCell />
          </DataTable.Col>
          <DataTable.Col
            source="motiveLabel"
            label="complaints.fields.motive"
            disableSort
          />
          <DataTable.Col label="complaints.fields.description" disableSort>
            <ExcerptCell />
          </DataTable.Col>
          <DataTable.Col
            label="complaints.fields.assigned"
            disableSort
            cellClassName="min-w-[140px]"
          >
            <AssignedCell />
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
