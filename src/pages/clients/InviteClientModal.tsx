import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Mail, TriangleAlert, User, UserPlus } from "lucide-react";
import { useDataProvider, useRefresh, useTranslate } from "ra-core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { FormDialogContent } from "@/components/admin/form-dialog-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type {
  ClientInvitationResult,
  ExtendedDataProvider,
} from "@/providers/dataProvider";
import { backendMessage } from "../users/errors";

const inviteSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().trim().email(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

/**
 * Alta de un cliente que compró por WhatsApp o por teléfono.
 *
 * No crea una fila y ya: un cliente vive en Clerk, y una fila sin cuenta sería
 * alguien que existe en el listado y no puede entrar en la tienda. Lo que se
 * hace es invitarlo, y su ficha aparece cuando activa la cuenta.
 */
export default function InviteClientModal({
  onClose,
}: {
  /**
   * Qué pasa al cerrar. Por defecto vuelve al listado de clientes: es como se
   * comporta montado en la ruta `/clients/create`. El alta de un pedido lo
   * sustituye por «cerrar nada más este diálogo», para poder invitar a un
   * cliente sin perder el pedido que ya se llevaba escrito.
   */
  onClose?: () => void;
} = {}) {
  const navigate = useNavigate();
  const translate = useTranslate();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const refresh = useRefresh();
  const [resultado, setResultado] = useState<ClientInvitationResult | null>(
    null,
  );

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const cerrar =
    onClose ??
    (() => {
      refresh();
      navigate("/clients");
    });

  const onSubmit = async (values: InviteFormValues) => {
    try {
      const { data } = await dataProvider.inviteClient(values);

      if (data.emailSent) {
        toast.success(
          translate("clients.actions.invite_success", {
            _: "Invitación enviada a %{email}",
            email: data.email,
          }),
        );
        cerrar();
        return;
      }

      // El correo no salió, pero la cuenta está invitada igual: se enseña el
      // enlace para poder dárselo por WhatsApp en vez de perder el alta.
      setResultado(data);
    } catch (error) {
      toast.error(
        backendMessage(
          error,
          translate("clients.actions.invite_error", {
            _: "No se pudo invitar a este cliente",
          }),
        ),
      );
    }
  };

  const copiarEnlace = async () => {
    if (!resultado) return;
    await navigator.clipboard.writeText(resultado.url);
    toast.success(
      translate("clients.actions.link_copied", { _: "Enlace copiado" }),
    );
  };

  const t = (key: string, fallback: string) => translate(key, { _: fallback });

  return (
    <Dialog open onOpenChange={(open) => !open && cerrar()}>
      <FormDialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        {resultado ? (
          <div className="flex flex-col">
            <DialogHeader className="px-6 py-5 border-b text-left">
              <DialogTitle className="flex items-center gap-2">
                <TriangleAlert className="size-5 text-amber-600" />
                {t(
                  "clients.invite.email_failed_title",
                  "La cuenta quedó invitada, pero el correo no salió",
                )}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "clients.invite.email_failed_help",
                  "Pásale este enlace por WhatsApp. Es personal y sirve una sola vez: con él elige su contraseña y entra.",
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-5 flex flex-col gap-3">
              <code className="block w-full rounded-md bg-muted px-3 py-2 text-xs break-all">
                {resultado.url}
              </code>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={cerrar}>
                  {t("ra.action.close", "Cerrar")}
                </Button>
                <Button type="button" onClick={copiarEnlace}>
                  <Copy className="size-4" />
                  {t("clients.actions.copy_link", "Copiar enlace")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader className="px-6 py-5 border-b text-left">
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="size-5" />
                  {t("clients.invite.title", "Invitar a un cliente")}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "clients.invite.help",
                    "Le creamos la cuenta y le mandamos un correo para que elija su contraseña. Aparecerá en el listado cuando la active.",
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-5 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clients.fields.firstName", "Nombre")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Meylin"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("clients.fields.lastName", "Apellidos")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Méndez"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        {t("clients.fields.email", "Correo electrónico")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="cliente@ejemplo.com"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="px-6 py-4 border-t flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 shrink-0" />
                  {t(
                    "clients.invite.footnote",
                    "La contraseña la elige el cliente: nosotros no la vemos.",
                  )}
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={cerrar}>
                    {t("ra.action.cancel", "Cancelar")}
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? t("clients.actions.inviting", "Invitando…")
                      : t("clients.actions.invite", "Invitar")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </FormDialogContent>
    </Dialog>
  );
}
