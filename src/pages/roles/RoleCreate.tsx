import { CreateBase, required, useTranslate } from "ra-core";
import { SimpleForm, TextInput } from "@/components/admin";

/**
 * Create a custom role. Only name + description are set here; the admin is
 * redirected to the edit page to configure the permission matrix.
 */
export default function RoleCreate() {
  const translate = useTranslate();
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">
        {translate("shared.actions.create_title", {
          _: "Create role",
          name: translate("resources.roles.name", { _: "role" }),
        })}
      </h1>
      <CreateBase redirect="edit">
        <SimpleForm className="max-w-2xl">
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
        </SimpleForm>
      </CreateBase>
    </div>
  );
}
