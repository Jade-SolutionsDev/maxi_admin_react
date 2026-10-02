import { useState } from "react";
import { MailCheck, XCircle } from "lucide-react";
import { useDataProvider, useNotify, useRecordContext, useRefresh, useTranslate } from "ra-core";

import { ConfirmIconButton } from "@/components/admin/confirm-icon-button";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { backendMessage } from "../users/errors";

/**
 * Acciones de una fila de invitación pendiente (`isPending === true`).
 *
 * Las filas normales no llevan ninguna: un cliente de verdad se gestiona desde
 * su ficha, y a esta no se puede entrar porque todavía no existe.
 */
export const ClientActionsCell = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [ocupado, setOcupado] = useState(false);

  if (!record?.isPending) return null;

  const correo = (record.email as string) ?? "";

  const ejecutar = async (
    accion: () => Promise<unknown>,
    claveExito: string,
    exito: string,
    error: string,
  ) => {
    setOcupado(true);
    try {
      await accion();
      notify(claveExito, { type: "success", messageArgs: { _: exito } });
      refresh();
    } catch (err) {
      notify(backendMessage(err, error), { type: "error" });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <ConfirmIconButton
        icon={<MailCheck size={16} />}
        label={translate("clients.actions.resend", { _: "Reenviar invitación" })}
        className="text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30"
        disabled={ocupado}
        title={translate("clients.confirm.resend.title", {
          _: "Reenviar invitación",
        })}
        description={translate("clients.confirm.resend.description", {
          email: correo,
          _: `¿Mandar otra vez la invitación a ${correo}? El enlace anterior dejará de servir.`,
        })}
        confirmLabel={translate("clients.actions.resend", { _: "Reenviar" })}
        onConfirm={() =>
          ejecutar(
            // Invitar otra vez al mismo correo retira la invitación vieja y
            // manda una nueva: es justo lo que significa reenviar.
            () =>
              dataProvider.inviteClient({
                email: correo,
                firstName: (record.firstName as string | null) ?? undefined,
                lastName: (record.lastName as string | null) ?? undefined,
              }),
            "clients.actions.resend_success",
            "Invitación reenviada",
            "No se pudo reenviar la invitación",
          )
        }
      />
      <ConfirmIconButton
        icon={<XCircle size={16} />}
        label={translate("clients.actions.revoke", { _: "Retirar invitación" })}
        className="text-destructive hover:bg-destructive/10"
        destructive
        disabled={ocupado}
        title={translate("clients.confirm.revoke.title", {
          _: "Retirar invitación",
        })}
        description={translate("clients.confirm.revoke.description", {
          email: correo,
          _: `¿Retirar la invitación de ${correo}? El enlace dejará de servir.`,
        })}
        confirmLabel={translate("clients.actions.revoke", { _: "Retirar" })}
        onConfirm={() =>
          ejecutar(
            () => dataProvider.revokeClientInvitation(String(record.id)),
            "clients.actions.revoke_success",
            "Invitación retirada",
            "No se pudo retirar la invitación",
          )
        }
      />
    </div>
  );
};
