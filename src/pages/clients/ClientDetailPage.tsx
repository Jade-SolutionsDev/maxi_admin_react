import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetList, useGetOne, useTranslate } from "ra-core";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { OrderPaymentStatus, OrderStatus } from "@/providers/dataProvider";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/pages/orders/OrderBadges";
import { money } from "@/pages/orders/orderStatus";

interface ClientRecord {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface OrderRow {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  total: number;
  createdAt: string;
}

type TabKey = "general" | "orders";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("general");

  const { data: client, isPending } = useGetOne<ClientRecord & { id: string }>(
    "clients",
    { id: id as string },
  );

  if (isPending || !client) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const fullName =
    [client.firstName, client.lastName].filter(Boolean).join(" ") || "—";

  const tabs: { key: TabKey; label: string; icon: typeof UserRound }[] = [
    { key: "general", label: "clients.tabs.general", icon: UserRound },
    { key: "orders", label: "clients.tabs.orders", icon: ShoppingCart },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={translate("shared.actions.back", { _: "Volver" })}
            onClick={() => navigate("/clients")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3">
            {client.avatarUrl ? (
              <img
                src={client.avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound size={20} />
              </span>
            )}
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {fullName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {client.email ?? "—"}
              </p>
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            client.isActive
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/15 text-destructive",
          )}
        >
          {translate(
            client.isActive ? "clients.status.active" : "clients.status.inactive",
            { _: client.isActive ? "Activo" : "Inactivo" },
          )}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={16} />
            {translate(label)}
          </button>
        ))}
      </div>

      {tab === "general" ? (
        <GeneralTab client={client} />
      ) : (
        <OrdersTab clientId={client.id} />
      )}
    </div>
  );
}

function GeneralTab({ client }: { client: ClientRecord }) {
  const translate = useTranslate();
  const rows: { icon: typeof Mail; label: string; value: string }[] = [
    {
      icon: Mail,
      label: translate("list.fields.email", { _: "Email" }),
      value: client.email ?? "—",
    },
    {
      icon: Phone,
      label: translate("list.fields.phone", { _: "Teléfono" }),
      value: client.phone ?? "—",
    },
    {
      icon: MapPin,
      label: translate("list.fields.onboardingStatus", {
        _: "Estado de incorporación",
      }),
      value: translate(
        client.onboardingCompleted
          ? "list.fields.complete"
          : "list.fields.incomplete",
        { _: client.onboardingCompleted ? "Completo" : "Incompleto" },
      ),
    },
    {
      icon: CalendarDays,
      label: translate("list.fields.createdAt", { _: "Creado" }),
      value: new Date(client.createdAt).toLocaleDateString(),
    },
  ];
  return (
    <section className="rounded-lg border border-border">
      {rows.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-0"
        >
          <Icon size={16} className="shrink-0 text-muted-foreground" />
          <span className="w-56 text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <span className="text-sm text-foreground">{value}</span>
        </div>
      ))}
    </section>
  );
}

/** The customer's orders across the platform, newest first. */
function OrdersTab({ clientId }: { clientId: string }) {
  const translate = useTranslate();
  const { data: orders, isPending } = useGetList<OrderRow & { id: string }>(
    "orders",
    {
      filter: { clientId },
      pagination: { page: 1, perPage: 50 },
      sort: { field: "createdAt", order: "DESC" },
    },
  );

  if (isPending) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  }
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <ShoppingCart className="mb-3 h-9 w-9 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {translate("clients.orders.empty_title", { _: "Sin pedidos" })}
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {translate("clients.orders.empty_hint", {
            _: "Este cliente aún no ha realizado pedidos.",
          })}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {translate("orders.fields.orderNumber", { _: "Número" })}
            </TableHead>
            <TableHead>
              {translate("list.fields.status", { _: "Estado" })}
            </TableHead>
            <TableHead>
              {translate("orders.fields.paymentStatus", { _: "Pago" })}
            </TableHead>
            <TableHead className="text-right">
              {translate("orders.fields.total", { _: "Total" })}
            </TableHead>
            <TableHead className="text-right">
              {translate("list.fields.createdAt", { _: "Fecha" })}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  to={`/orders/${order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {order.orderNumber ?? order.id}
                </Link>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={order.paymentStatus} />
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {money(order.total)}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
