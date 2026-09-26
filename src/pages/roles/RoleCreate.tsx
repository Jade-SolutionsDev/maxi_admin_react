import { CreateBase, required, useTranslate } from "ra-core";
import { SimpleForm, TextInput } from "@/components/admin";
import { PermissionMatrixInput } from "./PermissionMatrixInput";

/** Un rol tiene que dar acceso a algo; si no, quien lo tenga entra y no ve nada. */
const alMenosUnPermiso = (value: unknown) =>
  Array.isArray(value) && value.length > 0
    ? undefined
    : "roles.matrix.al_menos_uno";

/**
 * Alta de un rol, en una sola pantalla: nombre, descripción y permisos.
 *
 * Antes se creaba con nombre y descripción y se redirigía a la edición para
 * los permisos, así que el rol existía un rato sin dar acceso a nada. La API
 * acepta los permisos en la misma llamada.
 */
export default function RoleCreate() {
  const translate = useTranslate();
  return (
    <div className="p-6">
      <h1 className="mx-auto mb-4 max-w-4xl text-2xl font-semibold text-foreground">
        {translate("shared.actions.create_title", {
          _: "Crear rol",
          name: translate("resources.roles.name", { _: "rol" }),
        })}
      </h1>
      <CreateBase redirect="list">
        <SimpleForm className="mx-auto max-w-4xl">
          <TextInput
            source="name"
            label="list.fields.name"
            validate={required()}
          />
          <TextInput
            source="description"
            label="list.fields.description"
            multiline
          />

          <div className="mt-4 w-full">
            <h3 className="mb-2 text-sm font-medium">
              {translate("roles.matrix.title")}
            </h3>
            <PermissionMatrixInput
              source="permissionIds"
              validate={alMenosUnPermiso}
            />
          </div>
        </SimpleForm>
      </CreateBase>
    </div>
  );
}
