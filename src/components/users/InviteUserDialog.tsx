import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDataProvider,
  usePermissions,
  useRefresh,
  useTranslate,
} from "ra-core";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { ExtendedDataProvider } from "@/providers/dataProvider";

const userTypeChoices = [
  { id: "admin", name: "Admin" },
  { id: "provider", name: "Provider" },
  { id: "staff", name: "Staff" },
];

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  userType: z.enum(["admin", "provider", "staff"] as const, {
    message: "Please select a user type",
  }),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteUserDialog() {
  const translate = useTranslate();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const refresh = useRefresh();
  const { permissions } = usePermissions();
  const [open, setOpen] = useState(false);

  const canInvite = permissions?.users?.includes("create");
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    try {
      await dataProvider.inviteUser({
        email: values.email,
        userType: values.userType,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
      });

      toast.success(`Invitation sent to ${values.email}`);
      form.reset();
      setOpen(false);
      refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send invitation";
      toast.error(message);
    }
  };

  if (!canInvite) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <UserPlus />
          Invite user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Invite a new user</DialogTitle>
              <DialogDescription>
                Send an invitation email to join the backoffice.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {translate("list.fields.email", { _: "Email" })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userTypeChoices.map((choice) => (
                          <SelectItem key={choice.id} value={choice.id}>
                            {choice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {translate("list.fields.firstName", {
                          _: "First Name",
                        })}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        {translate("list.fields.lastName", {
                          _: "Last Name",
                        })}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
