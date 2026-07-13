import { EditBase, required, useRecordContext, useTranslate } from "ra-core";
import { ShieldAlert } from "lucide-react";
import { BooleanInput, SimpleForm, TextInput } from "@/components/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PermissionMatrixInput } from "./PermissionMatrixInput";

/**
 * Inner form; reads the record to decide whether the role is a locked system
 * role (read-only) or an editable custom role.
 */
const RoleEditForm = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  const isSystem = Boolean(record?.isSystem);

  return (
    <SimpleForm
      className="max-w-4xl"
      toolbar={isSystem ? false : undefined}
    >
      {isSystem && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{translate("roles.system_role_title")}</AlertTitle>
          <AlertDescription>
            {translate("roles.system_role_notice")}
          </AlertDescription>
        </Alert>
      )}

      <TextInput
        source="name"
        label="list.fields.name"
        validate={required()}
        disabled={isSystem}
      />
      <TextInput
        source="description"
        label="list.fields.description"
        multiline
        disabled={isSystem}
      />
      <BooleanInput
        source="isActive"
        label="list.fields.isActive"
        disabled={isSystem}
      />

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">
          {translate("roles.matrix.title")}
        </h3>
        <PermissionMatrixInput source="permissionIds" disabled={isSystem} />
      </div>
    </SimpleForm>
  );
};

/**
 * Full-page role editor. Editable fields are persisted via PATCH and the
 * permission matrix via a dedicated bulk endpoint (see dataProvider.update).
 */
export default function RoleEdit() {
  const translate = useTranslate();
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">
        {translate("roles.matrix.title", { _: "Role & permissions" })}
      </h1>
      <EditBase mutationMode="pessimistic" redirect="list">
        <RoleEditForm />
      </EditBase>
    </div>
  );
}
