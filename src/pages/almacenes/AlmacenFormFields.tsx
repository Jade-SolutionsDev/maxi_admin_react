import { required, useTranslate } from "ra-core";

import { BooleanInput, TextInput } from "@/components/admin";
import { CoverageSelector } from "./CoverageSelector";
import { GrocerAssignInput } from "./GrocerAssignInput";

// Shared fields for the create modal and the detail "Datos generales" tab.
export function AlmacenFormFields({ isManager }: { isManager: boolean }) {
  const translate = useTranslate();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {translate("almacenes.sections.info", {
              _: "Información del almacén",
            })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {translate("almacenes.sections.info_hint", {
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
          label={translate("almacenes.fields.available", { _: "Disponible" })}
          defaultValue={true}
          helperText={translate("almacenes.fields.available_hint", {
            _: "Los almacenes deshabilitados no estarán disponibles para los usuarios.",
          })}
        />

        {isManager && (
          <div className="space-y-2 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {translate("almacenes.sections.grocers", { _: "Encargados" })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {translate("almacenes.sections.grocers_hint", {
                  _: "Usuarios GROCER que pueden gestionar este almacén.",
                })}
              </p>
            </div>
            <GrocerAssignInput />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {translate("almacenes.sections.coverage", { _: "Zona de compra" })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {translate("almacenes.sections.coverage_hint", {
              _: "Seleccione las provincias y municipios donde opera este almacén.",
            })}
          </p>
        </div>
        <CoverageSelector />
      </div>
    </div>
  );
}
