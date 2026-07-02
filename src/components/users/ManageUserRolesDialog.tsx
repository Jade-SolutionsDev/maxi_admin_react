import { useEffect, useState } from "react";
import {
  useDataProvider,
  useGetIdentity,
  useGetList,
  useRecordContext,
  useRefresh,
  useTranslate,
} from "ra-core";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ExtendedDataProvider, RoleSummary } from "@/providers/dataProvider";

/**
 * Admin-only dialog to assign roles to a user. Rendered from a Users list row
 * action. Loads the user's current roles on open and saves the full selection
 * with a single bulk call.
 */
export function ManageUserRolesDialog() {
  const record = useRecordContext();
  const { data: identity } = useGetIdentity();
  const translate = useTranslate();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const refresh = useRefresh();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: roles, isPending: rolesLoading } = useGetList<RoleSummary>(
    "roles",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open },
  );

  const userId = record?.id != null ? String(record.id) : undefined;

  useEffect(() => {
    if (!open || !userId) return;
    let active = true;
    dataProvider
      .getUserRoles(userId)
      .then(({ data }) => {
        if (active) setSelected(data.map((r) => String(r.id)));
      })
      .catch(() => {
        if (active) setSelected([]);
      });
    return () => {
      active = false;
    };
  }, [open, userId, dataProvider]);

  // RBAC assignment is admin-only.
  if (!record || identity?.userType !== "admin") return null;

  const targetIsAdmin = record.userType === "admin";

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await dataProvider.setUserRoles(userId, selected);
      toast.success(
        translate("roles.assign_dialog.saved", { _: "Roles updated" }),
      );
      setOpen(false);
      refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : translate("roles.assign_dialog.error", {
              _: "Failed to update roles",
            });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30"
          aria-label={translate("roles.actions.manage_user_roles", {
            _: "Manage roles",
          })}
        >
          <ShieldCheck size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {translate("roles.assign_dialog.title", { _: "Manage roles" })}
          </DialogTitle>
          <DialogDescription>
            {translate("roles.assign_dialog.description", {
              _: "Select the roles assigned to this user.",
            })}
          </DialogDescription>
        </DialogHeader>

        {targetIsAdmin && (
          <Alert>
            <AlertDescription>
              {translate("roles.assign_dialog.admin_notice", {
                _: "Admin users have full access regardless of assigned roles.",
              })}
            </AlertDescription>
          </Alert>
        )}

        <div className="max-h-80 overflow-y-auto py-2">
          {rolesLoading ? (
            <p className="text-sm text-muted-foreground">
              {translate("ra.page.loading")}
            </p>
          ) : (roles ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {translate("roles.assign_dialog.empty", { _: "No roles yet." })}
            </p>
          ) : (
            <ul className="space-y-1">
              {(roles ?? []).map((role) => {
                const id = String(role.id);
                return (
                  <li key={id}>
                    <label className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer">
                      <Checkbox
                        checked={selected.includes(id)}
                        onCheckedChange={() => toggle(id)}
                        className="mt-0.5"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium">{role.name}</span>
                        {role.description && (
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            {translate("shared.actions.cancel", { _: "Cancel" })}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving
              ? translate("ra.action.loading", { _: "Saving…" })
              : translate("roles.assign_dialog.save", { _: "Save" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
