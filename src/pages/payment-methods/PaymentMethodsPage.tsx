import { useGetList, useNotify, useRefresh, useTranslate, useUpdate } from "ra-core";
import { Bitcoin, CreditCard, HandCoins, Loader2, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export interface PaymentMethodRecord {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  enabled: boolean;
  /** Credentials present in this environment; false ⇒ cannot be enabled. */
  configured: boolean;
  kind: "redirect" | "instructions" | "manual";
}

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  CreditCard,
  Bitcoin,
  HandCoins,
  Wallet,
};

/**
 * Which payment platforms the storefront offers. Credentials live in the API's
 * environment, never here — a method the environment has no keys for reports
 * `configured: false` and its switch stays locked, so an admin can't publish a
 * checkout option that would only fail.
 */
export function PaymentMethodsPage() {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [update, { isPending }] = useUpdate();

  const { data, isLoading } = useGetList<PaymentMethodRecord>("payment-methods", {
    pagination: { page: 1, perPage: 50 },
    sort: { field: "sortOrder", order: "ASC" },
  });

  const toggle = (method: PaymentMethodRecord) => {
    update(
      "payment-methods",
      {
        id: method.id,
        data: { enabled: !method.enabled },
        previousData: method,
      },
      {
        onSuccess: () => {
          notify(
            method.enabled
              ? "payment-methods.disabled"
              : "payment-methods.enabled",
            { type: "info", messageArgs: { name: method.label } },
          );
          refresh();
        },
        onError: (error) => {
          const backendMessage = (
            error as { body?: { error?: { message?: string } } }
          )?.body?.error?.message;
          notify(backendMessage ?? translate("shared.actions.error"), {
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold text-foreground">
          {translate("payment-methods.title", { _: "Métodos de pago" })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("payment-methods.subtitle", {
            _: "Elegí qué pasarelas puede usar el cliente al finalizar la compra.",
          })}
        </p>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {(data ?? []).map((method) => {
            const Icon = (method.icon && ICONS[method.icon]) || Wallet;

            return (
              <li
                key={method.id}
                className="flex items-start gap-4 rounded-lg border border-border p-4"
              >
                <span className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground">
                  <Icon size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {method.label}
                    </span>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {method.code}
                    </Badge>
                    {!method.configured && (
                      <Badge variant="secondary">
                        {translate("payment-methods.not_configured", {
                          _: "Sin credenciales",
                        })}
                      </Badge>
                    )}
                  </div>
                  {method.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  )}
                  {!method.configured && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {translate("payment-methods.not_configured_hint", {
                        _: "Configurá las credenciales en el servidor para poder activarla.",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  <Switch
                    checked={method.enabled}
                    disabled={!method.configured || isPending}
                    onCheckedChange={() => toggle(method)}
                    aria-label={translate("payment-methods.toggle", {
                      _: "Activar método",
                    })}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
