import { FormDialogContent } from "@/components/admin/form-dialog-content";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useDataProvider, useRefresh, useTranslate } from "ra-core";
import { toast } from "sonner";
import { Info, Mail, Shield, User, UserPlus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { ROLE_IDS } from "./roleChoices";

const inviteSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  role: z.enum(ROLE_IDS),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

/**
 * Invitation-only user creation. Collects name + email + role and sends a Clerk
 * invitation via `POST /users/invite`; the invited user sets their own password
 * through the emailed `/confirm-invite` link. No password is set here.
 */
export default function InviteUserModal() {
  const navigate = useNavigate();
  const translate = useTranslate();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const refresh = useRefresh();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const onClose = () => navigate("/users");

  const onSubmit = async (values: InviteFormValues) => {
    try {
      await dataProvider.inviteUser({
        email: values.email,
        role: values.role,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast.success(
        translate("users.actions.invite_success", {
          _: "Invitation sent to %{email}",
          email: values.email,
        }),
      );
      refresh();
      navigate("/users");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : translate("users.actions.invite_error", {
              _: "Could not send the invitation",
            });
      toast.error(message);
    }
  };

  const t = (key: string, fallback: string) => translate(key, { _: fallback });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <FormDialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="px-6 py-5 border-b text-left">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserPlus className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <DialogTitle className="text-xl">
                    {t("users.actions.create_title", "Crear nuevo usuario")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {t(
                      "users.actions.create_subtitle",
                      "Completa la información para invitar a un nuevo usuario.",
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("list.fields.firstName", "Nombre")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <IconInput icon={<User className="h-4 w-4" />}>
                          <Input
                            className="pl-9"
                            placeholder={t(
                              "users.actions.firstName_placeholder",
                              "Ingrese el nombre",
                            )}
                            {...field}
                          />
                        </IconInput>
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
                        {t("list.fields.lastName", "Apellidos")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <IconInput icon={<User className="h-4 w-4" />}>
                          <Input
                            className="pl-9"
                            placeholder={t(
                              "users.actions.lastName_placeholder",
                              "Ingrese los apellidos",
                            )}
                            {...field}
                          />
                        </IconInput>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("list.fields.email", "Correo")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <IconInput icon={<Mail className="h-4 w-4" />}>
                        <Input
                          type="email"
                          className="pl-9"
                          placeholder={t(
                            "users.actions.email_placeholder",
                            "Ingrese el correo electrónico",
                          )}
                          {...field}
                        />
                      </IconInput>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("list.fields.role", "Rol")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-9 relative">
                          <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <SelectValue
                            placeholder={t(
                              "users.actions.role_placeholder",
                              "Seleccione un rol",
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_IDS.map((id) => (
                          <SelectItem key={id} value={id}>
                            {translate(`users.roles.${id}`, { _: id })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                <Info className="h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {t("users.actions.invite_note_title", "Información importante")}
                  </p>
                  <p className="text-muted-foreground">
                    {t(
                      "users.actions.invite_note",
                      "El usuario recibirá un correo para crear su contraseña y activar su cuenta.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
              >
                {t("users.actions.cancel", "Cancelar")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <UserPlus className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting
                  ? t("users.actions.invite_sending", "Enviando…")
                  : t("users.actions.invite_submit", "Enviar invitación")}
              </Button>
            </div>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  );
}

function IconInput({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      {children}
    </div>
  );
}
