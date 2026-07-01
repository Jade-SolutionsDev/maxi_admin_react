import { useParams } from "react-router-dom";
import { required, useTranslate } from "ra-core";

import {
  BooleanInput,
  Edit,
  SelectInput,
  SimpleForm,
  TextInput,
} from "@/components/admin";

const userTypeChoices = [
  { id: "admin", name: "Admin" },
  { id: "provider", name: "Provider" },
  { id: "staff", name: "Staff" },
];

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  return (
    <Edit id={id} mutationMode="pessimistic">
      <SimpleForm>
        <TextInput
          source="firstName"
          label={translate("list.fields.firstName")}
          validate={required()}
        />
        <TextInput
          source="lastName"
          label={translate("list.fields.lastName")}
          validate={required()}
        />
        <TextInput
          source="email"
          label={translate("list.fields.email")}
          validate={required()}
          type="email"
        />
        <TextInput
          source="phone"
          label={translate("list.fields.phone")}
        />
        <SelectInput
          source="userType"
          label={translate("list.fields.userType")}
          choices={userTypeChoices}
          validate={required()}
        />
        <BooleanInput
          source="isActive"
          label={translate("list.fields.isActive")}
        />
      </SimpleForm>
    </Edit>
  );
}
