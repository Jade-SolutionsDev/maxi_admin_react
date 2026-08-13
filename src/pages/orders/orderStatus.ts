import type { OrderStatus, OrderPaymentStatus } from "@/providers/dataProvider";

// Mirrors the backend TRANSITIONS map (orders.service.ts) so the detail page
// only offers legal moves; the API re-validates anyway.
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

// Fulfillment targets a GROCER may set; confirm/cancel are manager-only.
export const GROCER_TARGETS: OrderStatus[] = [
  "processing",
  "shipped",
  "delivered",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_STATUSES: OrderPaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

/** Tailwind classes per status for the badge chips. */
export const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  confirmed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  processing: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  shipped: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

export const PAYMENT_CLASSES: Record<OrderPaymentStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export type ProviderChargeStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

// Mi Billetera MerchantCharge statuses — a different vocabulary than the
// order's own paymentStatus (which stays lowercase).
export const PROVIDER_STATUS_CLASSES: Record<ProviderChargeStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  REQUIRES_ACTION: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  PROCESSING: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  SUCCEEDED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  FAILED: "bg-destructive/15 text-destructive",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

export interface OrderPayment {
  provider: string;
  reference: string;
  status: ProviderChargeStatus;
  depositAddress: string | null;
  amount: string | null;
  token: string | null;
  blockchain: string | null;
  expiresAt: string | null;
  feeAmount: string | null;
  settlementAmount: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export const money = (value: unknown) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
