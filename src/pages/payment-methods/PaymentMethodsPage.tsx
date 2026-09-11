import { useState } from "react";
import {
  useDelete,
  useGetList,
  useNotify,
  useRefresh,
  useTranslate,
  useUpdate,
} from "ra-core";
import {
  Bitcoin,
  CreditCard,
  HandCoins,
  Landmark,
  Link2,
  Loader2,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  Wallet,
} from "lucide-react";

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
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaymentMethodFormDialog } from "./PaymentMethodFormDialog";

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
  /** Lo creó un admin: se puede editar y borrar. */
  isCustom: boolean;
  instructions: Record<string, unknown> | null;
}

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  CreditCard,
  Bitcoin,
  HandCoins,
  Wallet,
  Landmark,
  QrCode,
  Link: Link2,
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
  const [deleteOne] = useDelete();
  const [editing, setEditing] = useState<PaymentMethodRecord | undefined>();
  const [isFormOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    PaymentMethodRecord | undefined
  >();

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
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {translate("payment-methods.title", { _: "Métodos de pago" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate("payment-methods.subtitle", {
              _: "Elige qué pasarelas puede usar el cliente al finalizar la compra.",
            })}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus size={16} />
          {translate("payment-methods.create", { _: "Nuevo método" })}
        </Button>
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
                        _: "Configura las credenciales en el servidor para poder activarla.",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  {method.isCustom && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(method);
                          setFormOpen(true);
                        }}
                        aria-label={translate("shared.actions.edit", {
                          _: "Editar",
                        })}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setPendingDelete(method)}
                        aria-label={translate("shared.actions.delete", {
                          _: "Borrar",
                        })}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
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

      {isFormOpen && (
        <PaymentMethodFormDialog
          open={isFormOpen}
          method={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
        />
      )}

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => !next && setPendingDelete(undefined)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-lg sm:text-left">
              {translate("payment-methods.delete.title", {
                _: "¿Borrar este método de pago?",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center sm:text-left">
              {translate("payment-methods.delete.description", {
                _: "Dejará de aparecer al finalizar la compra. Los pedidos que ya lo usaron conservan sus instrucciones.",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>
              {translate("shared.actions.cancel", { _: "Cancelar" })}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={() => {
                if (!pendingDelete) return;
          deleteOne(
            "payment-methods",
            { id: pendingDelete.id, previousData: pendingDelete },
            {
              onSuccess: () => {
                notify("shared.notifications.deleted", { type: "info" });
                setPendingDelete(undefined);
                refresh();
              },
              onError: (error) => {
                const backendMessage = (
                  error as { body?: { error?: { message?: string } } }
                )?.body?.error?.message;
                notify(backendMessage ?? translate("shared.actions.error"), {
                  type: "error",
                });
                setPendingDelete(undefined);
                  },
                },
              );
              }}
            >
              {translate("shared.actions.delete", { _: "Borrar" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
