import { Link, Outlet } from "react-router-dom";
import {
  RecordContextProvider,
  ResourceContextProvider,
  useGetList,
  useTranslate,
} from "ra-core";
import { Globe2, MapPin, Pencil, Plus, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmToggleField } from "@/components/admin/confirm-toggle-field";
import { FulfillmentSettingsCard } from "./FulfillmentSettingsCard";
import type { DeliveryZone } from "./deliveryZones";

export interface DeliveryOptionRecord {
  id: string;
  label: string;
  description: string | null;
  fee: number;
  sortOrder: number;
  enabled: boolean;
  zones: DeliveryZone[];
}

/**
 * How the shop delivers. An empty catalogue is a legitimate state — it leaves
 * pickup as the only thing a customer can choose, which is where the business
 * is today.
 */
export function DeliveryOptionsPage() {
  const translate = useTranslate();

  const { data, isLoading } = useGetList<DeliveryOptionRecord>(
    "delivery-options",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "sortOrder", order: "ASC" },
    },
  );

  return (
    // The create/edit modals render through <CustomRoutes>, so nothing supplies
    // the resource their CreateBase/EditBase need — this does.
    <ResourceContextProvider value="delivery-options">
        <div className="flex flex-col gap-6">
        <FulfillmentSettingsCard />

        <section className="rounded-lg border bg-card p-4 sm:p-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Truck className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold">
                  {translate("delivery-options.title", { _: "Delivery options" })}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {translate("delivery-options.subtitle", { _: "" })}
                </p>
              </div>
            </div>

            <Button asChild size="sm">
              <Link to="/delivery-options/create">
                <Plus className="mr-1 size-4" aria-hidden="true" />
                {translate("shared.actions.create")}
              </Link>
            </Button>
          </header>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : data && data.length > 0 ? (
            <ul className="flex flex-col divide-y">
              {data.map((option) => (
                <li
                  key={option.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium">
                      {option.label}
                      <Badge variant="secondary">
                        {option.fee > 0
                          ? option.fee.toFixed(2)
                          : translate("delivery-options.free", { _: "Free" })}
                      </Badge>
                    </p>
                    {option.description && (
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {option.zones.length === 0 ? (
                        <>
                          <Globe2 className="size-3.5" aria-hidden="true" />
                          {translate("delivery-options.everywhere", {
                            _: "Available everywhere",
                          })}
                        </>
                      ) : (
                        <>
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {translate("delivery-options.zone_count", {
                            smart_count: option.zones.length,
                            _: `${option.zones.length} zones`,
                          })}
                        </>
                      )}
                    </p>
                  </div>

                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/delivery-options/edit/${option.id}`}>
                      <Pencil className="size-4" aria-hidden="true" />
                      <span className="sr-only">
                        {translate("shared.actions.edit", { _: "Edit" })}
                      </span>
                    </Link>
                  </Button>

                  <RecordContextProvider value={option}>
                    <ConfirmToggleField
                      source="enabled"
                      labelKey="delivery-options.fields.enabled"
                      confirmKey="delivery-options.confirm.toggle_enabled"
                    />
                  </RecordContextProvider>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {translate("delivery-options.empty", {
                _: "No delivery options yet — customers can only collect their orders.",
              })}
            </p>
          )}
        </section>

        <Outlet />
      </div>
    </ResourceContextProvider>
  );
}
