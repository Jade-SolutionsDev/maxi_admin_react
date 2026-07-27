import { useInput, useTranslate } from "ra-core";
import { MapPin, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PickupAddress {
  id?: string;
  label?: string | null;
  address: string;
}

/**
 * Repeatable list of storage pickup points (optional label + free-text address).
 * Bound to the `pickupAddresses` form field. Same useInput + field.onChange([...])
 * pattern as CoverageSelector / GrocerAssignInput (no useFieldArray in this app).
 */
export function PickupAddressesInput({
  source = "pickupAddresses",
}: {
  source?: string;
}) {
  const translate = useTranslate();
  const { field } = useInput({ source });
  const rows: PickupAddress[] = Array.isArray(field.value) ? field.value : [];

  const update = (next: PickupAddress[]) => field.onChange(next);
  const addRow = () => update([...rows, { label: "", address: "" }]);
  const removeRow = (i: number) => update(rows.filter((_, idx) => idx !== i));
  const patchRow = (i: number, patch: Partial<PickupAddress>) =>
    update(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {translate("stockLocations.pickupAddresses.empty", {
            _: "No hay direcciones de recogida.",
          })}
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-border p-2"
            >
              <MapPin
                size={15}
                className="mt-2.5 shrink-0 text-muted-foreground"
              />
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <Input
                  value={row.label ?? ""}
                  onChange={(e) => patchRow(i, { label: e.target.value })}
                  placeholder={translate("stockLocations.pickupAddresses.label", {
                    _: "Etiqueta (opcional)",
                  })}
                />
                <Input
                  value={row.address ?? ""}
                  onChange={(e) => patchRow(i, { address: e.target.value })}
                  placeholder={translate(
                    "stockLocations.pickupAddresses.address",
                    { _: "Dirección" },
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(i)}
                aria-label={translate("shared.actions.delete")}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus size={15} className="mr-1" />
        {translate("stockLocations.pickupAddresses.add", {
          _: "Agregar dirección",
        })}
      </Button>
    </div>
  );
}
