import {
  ResourceContextProvider,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { ShoppingCart } from "lucide-react";

import {
  DataTable,
  DateField,
  List,
  RefreshButton,
  SearchInput,
  SelectInput,
} from "@/components/admin";
import type { OrderStatus, OrderPaymentStatus } from "@/providers/dataProvider";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderBadges";
import { money, ORDER_STATUSES, PAYMENT_STATUSES } from "./orderStatus";

const orderFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    label="list.fields.status"
    choices={ORDER_STATUSES.map((s) => ({ id: s, name: `orders.status.${s}` }))}
    alwaysOn
  />,
  <SelectInput
    source="paymentStatus"
    label="orders.fields.paymentStatus"
    choices={PAYMENT_STATUSES.map((s) => ({
      id: s,
      name: `orders.paymentStatus.${s}`,
    }))}
    alwaysOn
  />,
];

const NumberCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <ShoppingCart size={16} />
      </span>
      <span className="font-medium text-foreground">
        {(record.orderNumber as string) ?? record.id}
      </span>
    </div>
  );
};

const ClientCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground">
        {(record.clientName as string) || "—"}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {(record.clientEmail as string) || ""}
      </p>
    </div>
  );
};

const StatusCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return <OrderStatusBadge status={record.status as OrderStatus} />;
};

const PaymentCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <PaymentStatusBadge status={record.paymentStatus as OrderPaymentStatus} />
  );
};

const TotalCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return <span className="font-medium tabular-nums">{money(record.total)}</span>;
};

export default function OrdersList() {
  const translate = useTranslate();
  return (
    <ResourceContextProvider value="orders">
      <List
        filters={orderFilters}
        actions={<RefreshButton />}
        title={translate("resources.orders.name_plural", { _: "Pedidos" })}
        sort={{ field: "createdAt", order: "DESC" }}
        perPage={10}
        empty={false}
      >
        <DataTable rowClick={(id) => `/orders/${id}`} bulkActionButtons={false}>
          <DataTable.Col source="orderNumber" label="orders.fields.orderNumber">
            <NumberCell />
          </DataTable.Col>
          <DataTable.Col label="orders.fields.client" disableSort>
            <ClientCell />
          </DataTable.Col>
          <DataTable.Col source="status" label="list.fields.status">
            <StatusCell />
          </DataTable.Col>
          <DataTable.Col
            source="paymentStatus"
            label="orders.fields.paymentStatus"
          >
            <PaymentCell />
          </DataTable.Col>
          <DataTable.Col source="total" label="orders.fields.total">
            <TotalCell />
          </DataTable.Col>
          <DataTable.Col source="createdAt" label="list.fields.createdAt">
            <DateField source="createdAt" showTime />
          </DataTable.Col>
        </DataTable>
      </List>
    </ResourceContextProvider>
  );
}
