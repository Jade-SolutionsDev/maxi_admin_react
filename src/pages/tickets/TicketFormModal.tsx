import { AlignLeft, Flag, Tag, Ticket as TicketIcon, User } from "lucide-react";
import { required, useTranslate } from "ra-core";
import { useNavigate } from "react-router-dom";

import {
  AutocompleteInput,
  ReferenceInput,
  ResourceFormModal,
  SelectInput,
  TextInput,
} from "@/components/admin";
import { TicketImagesInput } from "./TicketImagesInput";
import { TICKET_PRIORITIES } from "./ticketStatus";

const sanitize = (data: Record<string, unknown>) => ({
  title: data.title,
  description: data.description,
  categoryId: data.categoryId,
  priority: data.priority || undefined,
  assignedUserId: data.assignedUserId || undefined,
  images:
    Array.isArray(data.images) && data.images.length ? data.images : undefined,
});

const nombreDelUsuario = (record: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) =>
  [record.firstName, record.lastName].filter(Boolean).join(" ") ||
  record.email ||
  "";

export default function TicketFormModal() {
  const navigate = useNavigate();
  const translate = useTranslate();

  return (
    <ResourceFormModal
      mode="create"
      onClose={() => navigate("/tickets")}
      icon={<TicketIcon className="h-5 w-5" />}
      title={translate("tickets.form.title", { _: "Abrir un ticket" })}
      subtitle={translate("tickets.form.subtitle", {
        _: "Qué pasó, dónde y qué hace falta para arreglarlo.",
      })}
      callout={{
        title: translate("shared.form.note_title"),
        description: translate("tickets.form.note", {
          _: "Nace abierto. Si lo asignas, esa persona recibe un correo.",
        }),
      }}
      transform={sanitize}
      defaultValues={{ priority: "media" }}
    >
      <TextInput
        source="title"
        label={translate("tickets.fields.title", { _: "Qué pasa" })}
        validate={required()}
        icon={<TicketIcon />}
        helperText="tickets.form.hints.title"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ReferenceInput
          source="categoryId"
          reference="ticket-categories"
          filter={{ category: "ticket-category" }}
        >
          <AutocompleteInput
            label={translate("tickets.fields.category", { _: "Categoría" })}
            optionText="label"
            validate={required()}
            icon={<Tag />}
            helperText="tickets.form.hints.category"
          />
        </ReferenceInput>

        <SelectInput
          source="priority"
          label={translate("tickets.fields.priority", { _: "Prioridad" })}
          choices={TICKET_PRIORITIES.map((p) => ({
            id: p,
            name: `tickets.priority.${p}`,
          }))}
          validate={required()}
          icon={<Flag />}
          helperText="tickets.form.hints.priority"
        />
      </div>

      <ReferenceInput source="assignedUserId" reference="users">
        <AutocompleteInput
          label={translate("tickets.fields.assigned", { _: "Se lo asigno a" })}
          optionText={nombreDelUsuario}
          icon={<User />}
          helperText="tickets.form.hints.assigned"
        />
      </ReferenceInput>

      <TextInput
        source="description"
        label={translate("tickets.fields.description", {
          _: "Cuéntalo con detalle",
        })}
        validate={required()}
        multiline
        rows={6}
        icon={<AlignLeft />}
        helperText="tickets.form.hints.description"
      />

      <TicketImagesInput source="images" />
    </ResourceFormModal>
  );
}
