import {
  BadgeField,
  BooleanField,
  ColumnsButton, CreateButton, DateField,
  FilterButton,
  RefreshButton,
  SearchInput,
  SelectInput
} from "@/components/admin";
import { DataTable } from "@/components/admin/data-table";
import { List } from "@/components/admin/list";
import { ReferenceField } from "@/components/admin/reference-field";
import { RowNumberField } from "@/components/admin/row-number-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { personInitials } from "@/lib/initials";
import { useRecordContext, useTranslate } from "ra-core";
import { User } from "lucide-react";
import { ClientActionsCell } from "./clients/clientRowActions";

/**
 * Avatar del cliente, con iniciales de respaldo.
 *
 * Radix cambia solo a `AvatarFallback` cuando la imagen no carga o cuando no
 * hay `src`, que es lo que este listado necesitaba: antes pintaba un
 * placeholder remoto fijo y lo que se veía era el icono de imagen rota.
 */
const ClientAvatar = () => {
  const record = useRecordContext();
  if (!record) return null;

  const firstName = (record.firstName as string | null) ?? "";
  const lastName = (record.lastName as string | null) ?? "";
  const email = (record.email as string | null) ?? "";
  const initials = personInitials({ firstName, lastName, email });
  const name = `${firstName} ${lastName}`.trim() || email;

  return (
    <Avatar className="h-10 w-10 border border-border/50">
      <AvatarImage
        src={(record.avatarUrl as string | null) ?? undefined}
        alt={name || "Avatar"}
      />
      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
        {initials || <User size={16} aria-hidden />}
      </AvatarFallback>
    </Avatar>
  );
};

/**
 * Estado del cliente. Una invitación pendiente no es un cliente desactivado:
 * sin esto saldría «Inactivo», que es otra cosa y lleva a desactivar a alguien
 * que ni siquiera tiene cuenta todavía.
 */
const ClientStatusCell = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  if (record.isPending) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        {translate("clients.status.pending", { _: "Pendiente" })}
      </span>
    );
  }

  return (
    <BooleanField
      valueLabelFalse="users.status.inactive"
      valueLabelTrue="users.status.active"
      source="isActive"
    />
  );
};

const ClientActions = () => (
  <div className="flex gap-2">
    <RefreshButton />
    <CreateButton label="clients.actions.invite" />
    <ColumnsButton />
    <FilterButton variant="default" size="lg" />
  </div>
);

export const ClientList = () => {
  const translate = useTranslate();
  const clientFilters = [
    <SearchInput
      source="q"
      placeholder={translate("clients.search_placeholder", {
        _: "Buscar por nombre, apellidos, correo o teléfono",
      })}
      alwaysOn
    />,
    <SelectInput
      label="list.fields.isActive"
      source="isActive"
      choices={[
        { id: "true", name: "Yes" },
        { id: "false", name: "No" },
      ]}
    />,
  ];

  return (
    <List
      /*
        Las invitaciones pendientes salen con los clientes: sin esto, a quien
        invitas desaparece del panel hasta que activa su cuenta.
      */
      filter={{ includeInvitations: true }}
      filters={clientFilters}
      actions={<ClientActions />}
      resource="clients"
      title={translate("resources.clients.name_plural")}
    >
      <DataTable
        hasBulkActions={false}
        hiddenColumns={["id", "onboardingCompleted", "isPending"]}
        // Una invitación no tiene ficha: su `id` es el de la invitación en
        // Clerk y `GET /clients/:id` no la encuentra.
        rowClick={(_id, _resource, record) =>
          record.isPending ? false : `/clients/${record.id}`
        }
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col source="id" label="list.fields.id">
          <BadgeField source="id" variant="default" truncate />
        </DataTable.Col>
        <DataTable.Col
          source="avatarUrl"
          disableSort
          label="list.fields.avatar"
        >
          <ClientAvatar />
        </DataTable.Col>
        <DataTable.Col source="email" label="list.fields.email" />
        <DataTable.Col source="firstName" label="list.fields.firstName" />
        <DataTable.Col source="lastName" label="list.fields.lastName" />
        <DataTable.Col source="phone" label="list.fields.phone" disableSort />
        <DataTable.Col
          source="defaultMunicipalityId"
          label="list.fields.defaultMunicipality"
          disableSort
        >
          <ReferenceField
            source="defaultMunicipalityId"
            reference="defaultMunicipalities"
          />
        </DataTable.Col>
        <DataTable.Col source="isActive" label="list.fields.isActive">
          <ClientStatusCell />
        </DataTable.Col>
        <DataTable.Col
          source="onboardingCompleted"
          label="list.fields.onboardingStatus"
        >
          <BooleanField
            source="onboardingCompleted"
            valueLabelFalse="list.fields.incomplete"
            valueLabelTrue="list.fields.complete"
          />
        </DataTable.Col>
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.actions"
          disableSort
          cellClassName="w-24 text-center"
        >
          <ClientActionsCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};
