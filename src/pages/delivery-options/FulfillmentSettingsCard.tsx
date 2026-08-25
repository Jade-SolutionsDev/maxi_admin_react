import { useEffect, useState } from "react";
import { useDataProvider, useNotify, useTranslate } from "ra-core";
import { AlertTriangle, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
      notify("shared.notifications.updated", { type: "info" });
    } catch {
      notify("shared.notifications.error", { type: "warning" });
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
        <Switch
          checked={data.pickupEnabled}
          disabled={isPending}
          onCheckedChange={(checked) => void save({ pickupEnabled: checked })}
          aria-label={translate("fulfillment.pickup.toggle", { _: "Pickup" })}
        />
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
