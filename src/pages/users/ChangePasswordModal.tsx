import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useDataProvider, useGetOne, useTranslate } from "ra-core";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

import {
  Dialog,
  DialogContent,
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
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import type { ExtendedDataProvider } from "@/providers/dataProvider";

/**
 * Admin action to set another user's password. A user's own password is changed
 * from their profile, not here — the backend also rejects self-service.
 */
export default function ChangePasswordModal() {
  const navigate = useNavigate();
  const translate = useTranslate();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const { id } = useParams<{ id: string }>();
  const { data: record } = useGetOne("users", { id: id! }, { enabled: !!id });

  const t = (key: string, fallback: string, args?: Record<string, unknown>) =>
    translate(key, { _: fallback, ...args });

  const schema = z
    .object({
      password: z.string().min(8, t("users.password.too_short", "Minimum 8 characters")),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, {
      message: t("users.password.mismatch", "Passwords do not match"),
      path: ["confirm"],
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onClose = () => navigate("/users");

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await dataProvider.setUserPassword(id!, values.password);
      toast.success(t("users.password.success", "Password updated"));
      navigate("/users");
    } catch (error) {
      const message =
        (error as { body?: { error?: { message?: string } } })?.body?.error
          ?.message ??
        (error instanceof Error ? error.message : "") ??
        t("users.password.error", "Could not update the password");
      toast.error(message);
    }
  };

  const displayName =
    [record?.firstName, record?.lastName].filter(Boolean).join(" ") ||
    (record?.email as string | undefined) ||
    "";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="px-6 py-5 border-b text-left">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <DialogTitle className="text-xl">
                    {t("users.password.title", "Change password")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {displayName
                      ? t("users.password.subtitle_named", "Set a new password for %{name}.", {
                          name: displayName,
                        })
                      : t("users.password.subtitle", "Set a new password for this user.")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("users.password.new_label", "New password")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("users.password.confirm_label", "Confirm password")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
              >
                {t("users.actions.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <KeyRound className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting
                  ? t("users.password.saving", "Saving…")
                  : t("users.password.submit", "Update password")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
