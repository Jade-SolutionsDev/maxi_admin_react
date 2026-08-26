import { useEffect, useState } from "react";
import { useDataProvider, useNotify, useTranslate } from "ra-core";
import { AlertTriangle, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExtendedDataProvider,
  FulfillmentSettings,
} from "@/providers/dataProvider";

/**
 * The pickup switch and the message customers see when the shop can fulfil
 * nothing. Warns about the one configuration that silently strands them:
 * pickup on with no storage address anywhere.
 */
export function FulfillmentSettingsCard() {
  const translate = useTranslate();
  const notify = useNotify();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const [data, setData] = useState<FulfillmentSettings | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  // Turning pickup off can leave customers with nothing to choose, so it is
  // confirmed rather than applied on a stray click.
  const [pendingPickup, setPendingPickup] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    dataProvider
      .getFulfillmentSettings()
      .then(({ data: settings }) => {
        if (cancelled) return;
        setData(settings);
        setMessage(settings.supportMessage);
      })
      .catch(() => {
        if (!cancelled) notify("shared.actions.error", { type: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [dataProvider, notify]);

  const save = async (changes: Partial<FulfillmentSettings>) => {
    setIsPending(true);
    try {
      const result = await dataProvider.updateFulfillmentSettings(changes);
      setData(result.data);
      setMessage(result.data.supportMessage);
      notify("fulfillment.saved", { type: "info", _: "Changes saved" });
    } catch {
      notify("shared.actions.error", {
        type: "error",
        messageArgs: { _: "Could not apply the change" },
      });
    } finally {
      setIsPending(false);
    }
  };

  if (!data) return <Skeleton className="h-40 w-full" />;

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6">
      <header className="flex items-center gap-2">
        <Store className="size-5 text-muted-foreground" aria-hidden="true" />
        <div>
          <h2 className="text-base font-semibold">
            {translate("fulfillment.pickup.title", { _: "Pickup in store" })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {translate("fulfillment.pickup.subtitle", { _: "" })}
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">
          {translate("fulfillment.pickup.toggle", {
            _: "Let customers collect their orders",
          })}
        </span>
        <AlertDialog
          open={pendingPickup !== null}
          onOpenChange={(open) => !open && setPendingPickup(null)}
        >
          <Switch
            checked={data.pickupEnabled}
            disabled={isPending}
            onCheckedChange={(checked) => setPendingPickup(checked)}
            aria-label={translate("fulfillment.pickup.toggle", { _: "Pickup" })}
          />

          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-lg">
                {translate(
                  `fulfillment.pickup.confirm.${pendingPickup ?? !data.pickupEnabled ? "on" : "off"}_title`,
                  { _: "Confirm change" },
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {translate(
                  `fulfillment.pickup.confirm.${pendingPickup ?? !data.pickupEnabled ? "on" : "off"}_desc`,
                  { _: "Are you sure you want to apply this change?" },
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-end">
              <AlertDialogCancel disabled={isPending}>
                {translate("shared.actions.cancel", { _: "Cancel" })}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                className={cn(buttonVariants())}
                onClick={() => {
                  if (pendingPickup === null) return;
                  void save({ pickupEnabled: pendingPickup });
                  setPendingPickup(null);
                }}
              >
                {translate(
                  `fulfillment.pickup.confirm.${pendingPickup ?? !data.pickupEnabled ? "on" : "off"}_cta`,
                  { _: translate("shared.actions.confirm_action", { _: "Confirm" }) },
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {data.pickupEnabledWithoutAddresses && (
        <p className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {translate("fulfillment.pickup.no_addresses", {
            _: "Pickup is on, but no active storage has a pickup address. Customers cannot choose anything.",
          })}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="supportMessage">
          {translate("fulfillment.support_message.label", {
            _: "Message when nothing can be fulfilled",
          })}
        </label>
        <Textarea
          id="supportMessage"
          value={message}
          rows={3}
          onChange={(event) => setMessage(event.target.value)}
        />
        <Button
          type="button"
          size="sm"
          className="self-end"
          disabled={isPending || message === data.supportMessage}
          onClick={() => void save({ supportMessage: message })}
        >
          {translate("shared.actions.save", { _: "Save" })}
        </Button>
      </div>
    </section>
  );
}
