import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useCanAccess,
  useDataProvider,
  useGetIdentity,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CreditCard,
  Loader2,
  MapPin,
  ShoppingCart,
  StickyNote,
  UserRound,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
import type {
  ExtendedDataProvider,
  OrderPaymentStatus,
  OrderStatus,
} from "@/providers/dataProvider";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderBadges";
import {
  GROCER_TARGETS,
  money,
  type OrderPayment,
  PAYMENT_STATUSES,
  STATUS_TRANSITIONS,
} from "./orderStatus";
import { PaymentDetailsSection } from "./PaymentDetailsSection";

interface OrderItemRow {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OrderRecord {
  id: string;
  orderNumber: string | null;
  clientId: string;
  clientName: string | null;
  clientEmail: string | null;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: Record<string, unknown> | null;
  customerNotes: string | null;
  items?: OrderItemRow[];
  payment?: OrderPayment | null;
  createdAt: string;
  updatedAt: string;
}

/** Pending confirmation dialog state: which change is being confirmed. */
type PendingAction =
  | { kind: "status"; value: OrderStatus }
  | { kind: "payment"; value: OrderPaymentStatus };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const navigate = useNavigate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { data: identity } = useGetIdentity();
  const isManager = MANAGER_ROLES.includes(
    (identity?.role as Role) ?? "KARDIST",
  );
  // The customer link only renders when the actor may open /clients
  // (admin-only resource — GROCER gets plain text).
  const { canAccess: canViewClient } = useCanAccess({
    resource: "clients",
    action: "read",
  });

  const {
    data: order,
    isPending,
    refetch,
  } = useGetOne<OrderRecord & { id: string }>("orders", { id: id as string });

  const [pending, setPending] = useState<PendingAction | null>(null);

  const mutation = useMutation({
    mutationFn: (action: PendingAction) =>
      action.kind === "status"
        ? dataProvider.updateOrderStatus(id as string, action.value)
        : dataProvider.updateOrderPaymentStatus(id as string, action.value),
    onSuccess: () => {
      setPending(null);
      notify("orders.actions.updated", {
        type: "success",
        messageArgs: { _: "Pedido actualizado" },
      });
      void refetch();
      refresh();
    },
    onError: (error: unknown) => {
      setPending(null);
      const message =
        (error as { body?: { error?: { message?: string } } })?.body?.error
          ?.message ??
        (error as Error)?.message ??
        "Error";
      notify(message, { type: "error" });
      void refetch();
    },
  });

  if (isPending || !order) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  // Legal next statuses for this order, restricted for non-managers (GROCER).
  const targets = STATUS_TRANSITIONS[order.status].filter(
    (t) => isManager || GROCER_TARGETS.includes(t),
  );

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
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShoppingCart size={20} />
              </span>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {order.orderNumber ?? order.id}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {(order.clientName || order.clientEmail) ?? "—"}
                  {order.clientName && order.clientEmail
                    ? ` · ${order.clientEmail}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {targets.map((target) => (
          <Button
            key={target}
            type="button"
            variant={target === "cancelled" ? "outline" : "default"}
            className={cn(
              target === "cancelled" &&
                "border-destructive/40 text-destructive hover:bg-destructive/10",
            )}
            disabled={mutation.isPending}
            onClick={() => setPending({ kind: "status", value: target })}
          >
            {target === "cancelled" ? (
              <Ban className="mr-2 h-4 w-4" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {translate(`orders.actions.set_${target}`, { _: target })}
          </Button>
        ))}
        {isManager &&
          PAYMENT_STATUSES.filter((p) => p !== order.paymentStatus).map(
            (target) => (
              <Button
                key={target}
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => setPending({ kind: "payment", value: target })}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {translate(`orders.actions.mark_${target}`, { _: target })}
              </Button>
            ),
          )}
        {mutation.isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Items */}
      <section className="mb-6 rounded-lg border border-border">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
          {translate("orders.sections.items", { _: "Productos" })}
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {translate("list.fields.name", { _: "Nombre" })}
              </TableHead>
              <TableHead className="text-right">
                {translate("orders.fields.quantity", { _: "Cantidad" })}
              </TableHead>
              <TableHead className="text-right">
                {translate("orders.fields.unitPrice", { _: "Precio" })}
              </TableHead>
              <TableHead className="text-right">
                {translate("orders.fields.lineTotal", { _: "Importe" })}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(order.items ?? []).map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-9 w-9 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <ShoppingCart size={16} />
                      </span>
                    )}
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money(item.lineTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="space-y-1 border-t border-border px-4 py-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{translate("orders.fields.subtotal", { _: "Subtotal" })}</span>
            <span className="tabular-nums">{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>
              {translate("orders.fields.deliveryFee", { _: "Envío" })}
            </span>
            <span className="tabular-nums">{money(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground">
            <span>{translate("orders.fields.total", { _: "Total" })}</span>
            <span className="tabular-nums">{money(order.total)}</span>
          </div>
        </div>
      </section>

      {/* Customer + delivery + notes */}
      {order.payment && (
        <div className="mb-4">
          <PaymentDetailsSection payment={order.payment} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-lg border border-border p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound size={16} />
            {translate("orders.sections.customer", { _: "Cliente" })}
          </h2>
          <p className="text-sm font-medium text-foreground">
            {order.clientName || "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.clientEmail || "—"}
          </p>
          {canViewClient && (
            <Link
              to={`/clients/${order.clientId}`}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {translate("orders.actions.view_customer", { _: "Ver cliente" })}
              <ArrowRight size={14} />
            </Link>
          )}
        </section>
        <section className="rounded-lg border border-border p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin size={16} />
            {translate("orders.sections.delivery", { _: "Entrega" })}
          </h2>
          {order.deliveryAddress ? (
            <dl className="space-y-1 text-sm text-muted-foreground">
              {Object.entries(order.deliveryAddress).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="font-medium capitalize">{key}:</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </section>
        <section className="rounded-lg border border-border p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <StickyNote size={16} />
            {translate("orders.sections.notes", { _: "Notas del cliente" })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {order.customerNotes || "—"}
          </p>
        </section>
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-lg sm:text-left">
              {translate("orders.actions.confirm_title", {
                _: "Confirmar cambio",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center sm:text-left">
              {pending &&
                translate(
                  pending.kind === "status"
                    ? "orders.actions.confirm_status_description"
                    : "orders.actions.confirm_payment_description",
                  {
                    _: "¿Aplicar el cambio a %{value}?",
                    value: translate(
                      pending.kind === "status"
                        ? `orders.status.${pending.value}`
                        : `orders.paymentStatus.${pending.value}`,
                      { _: pending.value },
                    ),
                  },
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel disabled={mutation.isPending}>
              {translate("shared.actions.cancel", { _: "Cancelar" })}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              className={cn(
                pending?.kind === "status" &&
                  pending.value === "cancelled" &&
                  buttonVariants({ variant: "destructive" }),
              )}
              onClick={() => pending && mutation.mutate(pending)}
            >
              {/* NOT shared.actions.confirm — that key is the delete-dialog
                  label ("Eliminar"); confirm_action is the generic one. */}
              {translate("shared.actions.confirm_action", { _: "Confirmar" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
