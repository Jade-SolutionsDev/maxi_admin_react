import { AlignLeft, MessageSquareWarning, Package, Tag, User } from "lucide-react";
import { required, useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import {
  AutocompleteInput,
  ReferenceInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

const sanitize = (data: Record<string, unknown>) => ({
  clientId: data.clientId,
  orderId: data.orderId || undefined,
  motiveId: data.motiveId,
  description: data.description,
});

const nombreDelCliente = (record: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) =>
  [record.firstName, record.lastName].filter(Boolean).join(" ") ||
  record.email ||
  "";

/**
 * El pedido se elige entre los del cliente, no entre todos.
 *
 * La API rechaza una queja colgada de un pedido ajeno, así que ofrecer la
 * lista entera solo serviría para que el formulario fallara al guardar.
 */
const PedidoDelCliente = () => {
  const translate = useTranslate();
  const clientId = useWatch({ name: "clientId" }) as string | undefined;

  if (!clientId) {
    return (
      <p className="self-center text-sm text-muted-foreground">
        {translate("complaints.form.eligeClientePrimero", {
          _: "Elige primero el cliente para poder enlazar uno de sus pedidos.",
        })}
      </p>
    );
  }

  return (
    <ReferenceInput source="orderId" reference="orders" filter={{ clientId }}>
      <AutocompleteInput
        label={translate("complaints.fields.order", { _: "Pedido" })}
        optionText="orderNumber"
        icon={<Package />}
        helperText="complaints.form.hints.order"
      />
    </ReferenceInput>
  );
};

export default function ComplaintFormModal() {
  const navigate = useNavigate();
  const translate = useTranslate();

  return (
    <ResourceFormModal
      mode="create"
      onClose={() => navigate("/complaints")}
      icon={<MessageSquareWarning className="h-5 w-5" />}
      title={translate("complaints.form.title", { _: "Registrar una queja" })}
      subtitle={translate("complaints.form.subtitle", {
        _: "Lo que contó el cliente, tal como lo contó.",
      })}
      callout={{
        title: translate("shared.form.note_title"),
        description: translate("complaints.form.note", {
          _: "Nace abierta. Darla por resuelta es otra acción y pide su propio permiso.",
        }),
      }}
      transform={sanitize}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ReferenceInput source="clientId" reference="clients">
          <AutocompleteInput
            label={translate("complaints.fields.client", { _: "Cliente" })}
            optionText={nombreDelCliente}
            validate={required()}
            icon={<User />}
            helperText="complaints.form.hints.client"
          />
        </ReferenceInput>
        <PedidoDelCliente />
      </div>

      <ReferenceInput
        source="motiveId"
        reference="complaint-motives"
        filter={{ category: "complaint-motive" }}
      >
        <AutocompleteInput
          label={translate("complaints.fields.motive", { _: "Motivo" })}
          optionText="label"
          validate={required()}
          icon={<Tag />}
          helperText="complaints.form.hints.motive"
        />
      </ReferenceInput>

      <TextInput
        source="description"
        label={translate("complaints.fields.description", {
          _: "Qué pasó",
        })}
        validate={required()}
        multiline
        rows={6}
        icon={<AlignLeft />}
        helperText="complaints.form.hints.description"
      />
    </ResourceFormModal>
  );
}
