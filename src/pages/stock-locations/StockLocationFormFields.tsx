import { required, useTranslate } from "ra-core";
import { MapPin, Map, Users, Warehouse } from "lucide-react";

import { BooleanInput, FormSection, TextInput } from "@/components/admin";
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
        <FormSection
          icon={<Warehouse />}
          title={translate("stockLocations.sections.info", {
            _: "Información del almacén",
          })}
          subtitle={translate("stockLocations.sections.info_hint", {
            _: "Nombre y disponibilidad del almacén.",
          })}
        >
          <TextInput
            source="name"
            label={translate("list.fields.name")}
            validate={required()}
            icon={<Warehouse />}
          />
          <BooleanInput
            source="isActive"
            label={translate("stockLocations.fields.available", {
              _: "Disponible",
            })}
            defaultValue={true}
            helperText={translate("stockLocations.fields.available_hint", {
              _: "Los almacenes deshabilitados no estarán disponibles para los usuarios.",
            })}
          />
        </FormSection>

        {isManager && (
          <FormSection
            icon={<Users />}
            title={translate("stockLocations.sections.grocers", {
              _: "Encargados",
            })}
            subtitle={translate("stockLocations.sections.grocers_hint", {
              _: "Usuarios GROCER que pueden gestionar este almacén.",
            })}
            className="gap-2 pt-2"
          >
            <GrocerAssignInput />
          </FormSection>
        )}

        <FormSection
          icon={<MapPin />}
          title={translate("stockLocations.sections.pickupAddresses", {
            _: "Direcciones de recogida",
          })}
          subtitle={translate("stockLocations.sections.pickupAddresses_hint", {
            _: "Puntos donde los clientes pueden recoger sus pedidos.",
          })}
          className="gap-2 pt-2"
        >
          <PickupAddressesInput />
        </FormSection>
      </div>

      <FormSection
        icon={<Map />}
        title={translate("stockLocations.sections.coverage", {
          _: "Zona de compra",
        })}
        subtitle={translate("stockLocations.sections.coverage_hint", {
          _: "Seleccione las provincias y municipios donde opera este almacén.",
        })}
        className="gap-3"
      >
        <CoverageSelector />
      </FormSection>
    </div>
  );
}
