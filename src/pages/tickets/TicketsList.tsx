import { Paperclip, Ticket as TicketIcon } from "lucide-react";
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
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketRecord,
} from "./ticketStatus";

const nombreDelUsuario = (record: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) =>
  [record.firstName, record.lastName].filter(Boolean).join(" ") ||
  record.email ||
  "";

const ticketFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    label="list.fields.status"
    choices={TICKET_STATUSES.map((s) => ({
      id: s,
      name: `tickets.status.${s}`,
    }))}
    alwaysOn
  />,
  <SelectInput
    source="priority"
    label="tickets.fields.priority"
    choices={TICKET_PRIORITIES.map((p) => ({
      id: p,
      name: `tickets.priority.${p}`,
    }))}
    alwaysOn
  />,
  <ReferenceInput
    source="categoryId"
    reference="ticket-categories"
    filter={{ category: "ticket-category" }}
    label="tickets.fields.category"
  >
    <AutocompleteInput
      label="tickets.fields.category"
      optionText="label"
      className="min-w-56"
    />
  </ReferenceInput>,
  <ReferenceInput
    source="assignedUserId"
    reference="users"
    label="tickets.fields.assigned"
  >
    <AutocompleteInput
      label="tickets.fields.assigned"
      optionText={nombreDelUsuario}
      className="min-w-56"
    />
  </ReferenceInput>,
  <ReferenceInput
    source="createdByUserId"
    reference="users"
    label="tickets.fields.openedBy"
  >
    <AutocompleteInput
      label="tickets.fields.openedBy"
      optionText={nombreDelUsuario}
      className="min-w-56"
    />
  </ReferenceInput>,
  <TextInput
    source="createdFrom"
    type="date"
    label="tickets.fields.createdFrom"
  />,
  <TextInput source="createdTo" type="date" label="tickets.fields.createdTo" />,
];

const TituloCell = () => {
  const record = useRecordContext<TicketRecord>();
  if (!record) return null;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <TicketIcon size={16} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {record.title}
        </p>
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          {record.categoryLabel || ""}
          {record.images.length > 0 && (
            <>
              <Paperclip size={11} />
              {record.images.length}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

const StatusCell = () => {
  const record = useRecordContext<TicketRecord>();
  if (!record) return null;
  return <TicketStatusBadge status={record.status} />;
};

const PriorityCell = () => {
  const record = useRecordContext<TicketRecord>();
  if (!record) return null;
  return <TicketPriorityBadge priority={record.priority} />;
};

const AssignedCell = () => {
  const translate = useTranslate();
  const record = useRecordContext<TicketRecord>();
  if (!record) return null;
  return (
    <span className="text-sm text-muted-foreground">
      {record.assignedUserName ||
        translate("tickets.sinAsignar", { _: "Sin asignar" })}
    </span>
  );
};

/**
 * Qué se ve cuando no hay ningún ticket.
 *
 * Una tabla vacía deja a quien entra sin saber si el módulo está roto o si
 * simplemente no hay incidencias. Lo segundo es una buena noticia, así que se
 * dice.
 */
const SinTickets = () => {
  const translate = useTranslate();
  const { canAccess: canCreate } = useCanAccess({
    resource: "tickets",
    action: "create",
  });
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <TicketIcon size={22} />
      </span>
      <p className="text-sm font-medium text-foreground">
        {translate("tickets.empty.title", {
          _: "No hay ninguna incidencia abierta",
        })}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {translate("tickets.empty.hint", {
          _: "Cuando algo se rompa o falte, ábrelo aquí y queda con su historial.",
        })}
      </p>
      {canCreate && <CreateButton />}
    </div>
  );
};

const TicketsActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "tickets",
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

export default function TicketsList() {
  const translate = useTranslate();
  return (
    <ResourceContextProvider value="tickets">
      <List
        filters={ticketFilters}
        actions={<TicketsActions />}
        title={translate("resources.tickets.name_plural", { _: "Tickets" })}
        sort={{ field: "createdAt", order: "DESC" }}
        perPage={10}
        empty={<SinTickets />}
      >
        <DataTable
          rowClick={(id) => `/tickets/${id}`}
          bulkActionButtons={false}
        >
          <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
            <RowNumberField />
          </DataTable.Col>
          <DataTable.Col
            source="title"
            label="tickets.fields.title"
            cellClassName="min-w-[240px]"
          >
            <TituloCell />
          </DataTable.Col>
          <DataTable.Col source="priority" label="tickets.fields.priority">
            <PriorityCell />
          </DataTable.Col>
          <DataTable.Col
            label="tickets.fields.assigned"
            disableSort
            cellClassName="min-w-[140px]"
          >
            <AssignedCell />
          </DataTable.Col>
          <DataTable.Col source="status" label="list.fields.status">
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
