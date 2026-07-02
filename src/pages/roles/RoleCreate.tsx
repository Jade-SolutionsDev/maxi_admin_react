import { required } from "ra-core";
import { Create, SimpleForm, TextInput } from "@/components/admin";

/**
 * Create a custom role. Only name + description are set here; the admin is
 * redirected to the edit page to configure the permission matrix.
 */
export default function RoleCreate() {
  return (
    <Create redirect="edit">
      <SimpleForm>
        <TextInput
          source="name"
          label="list.fields.firstName"
          validate={required()}
        />
        <TextInput
          source="description"
          label="list.fields.description"
          multiline
        />
      </SimpleForm>
    </Create>
  );
}
