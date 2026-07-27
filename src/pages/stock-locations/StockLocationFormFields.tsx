import { required, useTranslate } from "ra-core";

import { BooleanInput, TextInput } from "@/components/admin";
import { cn } from "@/lib/utils";
import { CoverageSelector } from "./CoverageSelector";
import { GrocerAssignInput } from "./GrocerAssignInput";
import { PickupAddressesInput } from "./PickupAddressesInput";

// Shared fields for the create modal and the detail "Datos generales" tab.
// `stacked` (create modal) drops the 2-column split so the coverage grid gets
// the full width — otherwise the province cards are too narrow and collide.
export function StockLocationFormFields({
  isManager,
  stacked = false,
}: {
  isManager: boolean;
  stacked?: boolean;
}) {
  const translate = useTranslate();

  return (
    <div className={cn("grid grid-cols-1 gap-6", !stacked && "lg:grid-cols-2")}>
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {translate("stockLocations.sections.info", {
              _: "Información del almacén",
            })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {translate("stockLocations.sections.info_hint", {
              _: "Nombre y disponibilidad del almacén.",
            })}
          </p>
        </div>

        <TextInput
          source="name"
          label={translate("list.fields.name")}
          validate={required()}
        />
        <BooleanInput
          source="isActive"
          label={translate("stockLocations.fields.available", { _: "Disponible" })}
          defaultValue={true}
          helperText={translate("stockLocations.fields.available_hint", {
            _: "Los almacenes deshabilitados no estarán disponibles para los usuarios.",
          })}
        />

        {isManager && (
          <div className="space-y-2 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {translate("stockLocations.sections.grocers", { _: "Encargados" })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {translate("stockLocations.sections.grocers_hint", {
                  _: "Usuarios GROCER que pueden gestionar este almacén.",
                })}
              </p>
            </div>
            <GrocerAssignInput />
          </div>
        )}

        <div className="space-y-2 pt-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {translate("stockLocations.sections.pickupAddresses", {
                _: "Direcciones de recogida",
              })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {translate("stockLocations.sections.pickupAddresses_hint", {
                _: "Puntos donde los clientes pueden recoger sus pedidos.",
              })}
            </p>
          </div>
          <PickupAddressesInput />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {translate("stockLocations.sections.coverage", { _: "Zona de compra" })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {translate("stockLocations.sections.coverage_hint", {
              _: "Seleccione las provincias y municipios donde opera este almacén.",
            })}
          </p>
        </div>
        <CoverageSelector />
      </div>
    </div>
  );
}
