import { useState } from "react";
import {
  ResourceContextProvider,
  useCanAccess,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { AlertTriangle, ShoppingCart } from "lucide-react";

import {
  DataTable,
  DateField,
  List,
  RefreshButton,
  RowNumberField,
  SearchInput,
  SelectInput,
  TextInput,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import type { OrderStatus, OrderPaymentStatus } from "@/providers/dataProvider";
import { CrearPedidoDialog } from "./CrearPedidoDialog";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderBadges";
import { ExportOrdersButton } from "./ExportOrdersButton";
import { PaymentMethodFilter } from "./PaymentMethodFilter";
import { money, ORDER_STATUSES, PAYMENT_STATUSES } from "./orderStatus";

/**
 * La pasarela del último intento. Un pedido puede no tener ninguno —uno de cada
 * diez en producción—, y entonces se dice, en vez de dejar la celda muda.
 */
const PaymentMethodCell = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  const method = record.paymentMethod as { label?: string } | undefined;
  return method?.label ? (
    <span>{method.label}</span>
  ) : (
    <span className="text-muted-foreground">
      {translate("orders.filters.withoutPaymentMethod", {
        _: "Sin intento de pago",
      })}
    </span>
  );
};

const NumberCell = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <ShoppingCart size={16} />
      </span>
      <span className="font-medium text-foreground">
        {(record.orderNumber as string) ?? record.id}
      </span>
      {record.needsTransfer === true && (
        <AlertTriangle
          size={16}
          className="shrink-0 text-amber-500"
          aria-label={translate("orders.transfer.title", {
            _: "Este pedido necesita un traslado entre almacenes",
          })}
        />
      )}
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

/**
 * El botón de crear, oculto a quien no tenga el permiso.
 *
 * No es `<RequireAccess>`: ese componente es un guarda de ruta —a quien no
 * tiene el permiso le pinta la página entera de «Acceso denegado»— y aquí es
 * un botón dentro de una barra. Se usa `useCanAccess` directamente, igual que
 * `GatedNavEntry` en el menú lateral: sin permiso, no se pinta nada.
 */
const BotonCrearPedido = ({ onClick }: { onClick: () => void }) => {
  const translate = useTranslate();
  const { canAccess, isPending } = useCanAccess({
    resource: "orders",
    action: "create",
  });
  if (isPending || !canAccess) return null;
  return (
    <Button onClick={onClick}>
      {translate("orders.create.button", { _: "Crear pedido" })}
    </Button>
  );
};

export default function OrdersList() {
  const translate = useTranslate();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const orderFilters = [
    <SearchInput
      source="q"
      placeholder={translate("orders.search_placeholder", {
        _: "Buscar por pedido, cliente, correo o teléfono",
      })}
      alwaysOn
    />,
    <SelectInput
      source="status"
      label="list.fields.status"
      choices={ORDER_STATUSES.map((s) => ({
        id: s,
        name: `orders.status.${s}`,
      }))}
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
    <PaymentMethodFilter alwaysOn />,
    // El rango acota el reporte: sin él, «los de esta semana» obliga a contar
    // en pantalla. Con `type="date"` para que salga el calendario del
    // navegador; no hay un DateInput propio en los componentes del panel.
    <TextInput source="from" label="orders.filters.from" type="date" />,
    <TextInput source="to" label="orders.filters.to" type="date" />,
  ];

  return (
    <ResourceContextProvider value="orders">
      <List
        filters={orderFilters}
        actions={
          <div className="flex items-center gap-2">
            <BotonCrearPedido onClick={() => setCrearAbierto(true)} />
            <ExportOrdersButton />
            <RefreshButton />
          </div>
        }
        title={translate("resources.orders.name_plural", { _: "Pedidos" })}
        sort={{ field: "createdAt", order: "DESC" }}
        perPage={10}
        empty={false}
      >
        <DataTable rowClick={(id) => `/orders/${id}`} bulkActionButtons={false}>
          <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
            <RowNumberField />
          </DataTable.Col>
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
          <DataTable.Col
            source="paymentMethod"
            label="orders.fields.paymentMethod"
            disableSort
          >
            <PaymentMethodCell />
          </DataTable.Col>
          <DataTable.Col source="total" label="orders.fields.total">
            <TotalCell />
          </DataTable.Col>
          <DataTable.Col source="createdAt" label="list.fields.createdAt">
            <DateField source="createdAt" showTime />
          </DataTable.Col>
        </DataTable>
      </List>
      <CrearPedidoDialog open={crearAbierto} onOpenChange={setCrearAbierto} />
    </ResourceContextProvider>
  );
}
