import { useState } from "react";
import {
  useCanAccess,
  useNotify,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useTranslate,
  useUpdate,
} from "ra-core";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmToggleFieldProps {
  /** Boolean field on the record, e.g. "isActive" / "featured". */
  source: string;
  /** i18n key for the switch aria-label. */
  labelKey: string;
  /**
   * i18n prefix providing per-direction copy:
   * `on_title` / `on_desc` / `on_cta` and the `off_*` variants.
   * `*_desc` receives the record name as `%{name}`; `*_cta` falls back to the
   * generic confirm label when a resource doesn't need a specific verb.
   */
  confirmKey: string;
}

/**
 * Switch that asks for confirmation before persisting a boolean field.
 * Same update flow as the plain list switches, plus an AlertDialog step.
 */
export const ConfirmToggleField = ({
  source,
  labelKey,
  confirmKey,
}: ConfirmToggleFieldProps) => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [nextValue, setNextValue] = useState<boolean | null>(null);
  const { canAccess: canEdit } = useCanAccess({ resource, action: "edit" });
  const [update, { isPending }] = useUpdate();

  if (!record) return null;
  const checked = record[source] === true;
  // Direction being confirmed. Falls back to the direction a click *would*
  // take, so the copy stays stable while the dialog animates closed.
  const dir: "on" | "off" = (nextValue ?? !checked) ? "on" : "off";
  // Catalog rows carry `name`, delivery options carry `label`; users carry
  // first/last name or an email.
  const displayName =
    (record.name as string) ||
    (record.label as string) ||
    [record.firstName, record.lastName].filter(Boolean).join(" ") ||
    (record.email as string) ||
    "";

  const handleConfirm = () => {
    if (nextValue === null) return;
    update(
      resource,
      { id: record.id, data: { [source]: nextValue }, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          setNextValue(null);
          refresh();
        },
        onError: () => {
          setNextValue(null);
          notify("shared.actions.error", {
            type: "error",
            messageArgs: { _: "Could not apply the change" },
          });
          refresh();
        },
      },
    );
  };

  return (
    <AlertDialog
      open={nextValue !== null}
      onOpenChange={(open) => !open && setNextValue(null)}
    >
      <Switch
        checked={checked}
        onCheckedChange={(value) => setNextValue(value)}
        disabled={!canEdit || isPending}
        aria-label={translate(labelKey)}
      />

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-center sm:text-left text-lg">
            {translate(`${confirmKey}.${dir}_title`, { _: "Confirm change" })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-left">
            {translate(`${confirmKey}.${dir}_desc`, {
              name: displayName,
              _: "Are you sure you want to apply this change?",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel disabled={isPending}>
            {translate("shared.actions.cancel", { _: "Cancel" })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(buttonVariants())}
          >
            {isPending
              ? translate("ra.action.loading", { _: "Saving…" })
              : translate(`${confirmKey}.${dir}_cta`, {
                  _: translate("shared.actions.confirm_action", {
                    _: "Confirm",
                  }),
                })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
