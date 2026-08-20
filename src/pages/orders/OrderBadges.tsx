import { useTranslate } from "ra-core";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderPaymentStatus } from "@/providers/dataProvider";
import {
  PAYMENT_CLASSES,
  PROVIDER_STATUS_CLASSES,
  type ProviderChargeStatus,
  STATUS_CLASSES,
} from "./orderStatus";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const translate = useTranslate();
  return (
    <Badge
      variant="secondary"
      className={cn("capitalize", STATUS_CLASSES[status])}
    >
      {translate(`orders.status.${status}`, { _: status })}
    </Badge>
  );
}

export function PaymentStatusBadge({
  status,
}: {
  status: OrderPaymentStatus;
}) {
  const translate = useTranslate();
  return (
    <Badge
      variant="secondary"
      className={cn("capitalize", PAYMENT_CLASSES[status])}
    >
      {translate(`orders.paymentStatus.${status}`, { _: status })}
    </Badge>
  );
}

export function ProviderStatusBadge({
  status,
}: {
  status: ProviderChargeStatus;
}) {
  const translate = useTranslate();
  return (
    <Badge variant="secondary" className={PROVIDER_STATUS_CLASSES[status]}>
      {translate(`orders.providerStatus.${status}`, { _: status })}
    </Badge>
  );
}
