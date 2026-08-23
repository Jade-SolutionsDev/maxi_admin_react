import { useState } from "react";
import { useNotify, useTranslate } from "ra-core";
import { Check, Copy, CreditCard, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProviderStatusBadge } from "./OrderBadges";
import type { OrderPayment } from "./orderStatus";

const CopyValue = ({ value, label }: { value: string; label: string }) => {
  const notify = useNotify();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("orders.payment.copy_failed", {
        type: "warning",
        messageArgs: { _: "Could not copy" },
      });
    }
  };

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <code className="truncate text-xs font-medium text-foreground">
        {value}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </span>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <dt className="shrink-0 text-xs font-medium text-muted-foreground">
      {label}
    </dt>
    <dd className="flex min-w-0 items-center justify-end text-right text-xs">
      {children}
    </dd>
  </div>
);

/**
 * Gateway payment details, whatever the platform: the crypto rows only render
 * when the gateway reported them, the hosted-checkout link only when there is
 * one. Absent entirely when the order has no attempt.
 */
export function PaymentDetailsSection({ payment }: { payment: OrderPayment }) {
  const translate = useTranslate();
  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString() : "—";

  return (
    <section className="rounded-lg border border-border p-4">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <CreditCard size={16} />
        {translate("orders.sections.payment", { _: "Pago (pasarela)" })}
      </h2>
      <dl className="divide-y divide-border/50">
        <Row label={translate("orders.payment.provider", { _: "Proveedor" })}>
          <Badge variant="outline" className="capitalize">
            {payment.provider}
          </Badge>
        </Row>
        <Row label={translate("orders.payment.status", { _: "Estado" })}>
          <ProviderStatusBadge status={payment.status} />
        </Row>
        <Row label={translate("orders.payment.reference", { _: "Referencia" })}>
          <CopyValue
            value={payment.reference}
            label={translate("orders.payment.copy_reference", {
              _: "Copiar referencia",
            })}
          />
        </Row>
        {payment.depositAddress && (
          <Row label={translate("orders.payment.address", { _: "Dirección" })}>
            <CopyValue
              value={payment.depositAddress}
              label={translate("orders.payment.copy_address", {
                _: "Copiar dirección",
              })}
            />
          </Row>
        )}
        {payment.amount && (
          <Row label={translate("orders.payment.amount", { _: "Monto" })}>
            <span className="font-medium tabular-nums">
              {payment.amount}{" "}
              {payment.token?.toUpperCase() ?? payment.currency ?? ""}
              {payment.blockchain ? ` · ${payment.blockchain}` : ""}
            </span>
          </Row>
        )}
        {payment.redirectUrl && (
          <Row label={translate("orders.payment.link", { _: "Enlace de pago" })}>
            <a
              href={payment.redirectUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {translate("orders.payment.open_link", { _: "Abrir" })}
              <ExternalLink size={12} />
            </a>
          </Row>
        )}
        {payment.feeAmount && (
          <Row label={translate("orders.payment.fee", { _: "Comisión" })}>
            <span className="tabular-nums">{payment.feeAmount}</span>
          </Row>
        )}
        {payment.settlementAmount && (
          <Row
            label={translate("orders.payment.settlement", { _: "Liquidación" })}
          >
            <span className="font-medium tabular-nums">
              {payment.settlementAmount}
            </span>
          </Row>
        )}
        <Row label={translate("orders.payment.createdAt", { _: "Creado" })}>
          {formatDate(payment.createdAt)}
        </Row>
        {payment.expiresAt && (
          <Row label={translate("orders.payment.expiresAt", { _: "Expira" })}>
            {formatDate(payment.expiresAt)}
          </Row>
        )}
      </dl>
      {payment.errorMessage && (
        <p className="mt-2 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
          {payment.errorMessage}
        </p>
      )}
    </section>
  );
}
