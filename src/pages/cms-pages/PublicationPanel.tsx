import { useState } from "react";
import { useCanAccess, useDataProvider, useNotify, useTranslate } from "ra-core";
import { Loader2, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/pages/cms-home/date-format";
import { backendMessage } from "@/pages/users/errors";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import type { CmsText } from "./cms-text";
import type { CmsTextScreen } from "./cms-text-screens";
import { PublicationStatusBadge } from "./PublicationStatusBadge";

interface PublicationPanelProps {
  screen: CmsTextScreen;
  record: CmsText;
  onPublished: () => void;
}

/**
 * Where the draft stands against the store, and the only way to change what
 * the store shows: publishing freezes the draft as a new version.
 */
export function PublicationPanel({
  screen,
  record,
  onPublished,
}: PublicationPanelProps) {
  const translate = useTranslate();
  const notify = useNotify();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { canAccess: canPublish } = useCanAccess({
    resource: screen.resource,
    action: "publish",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const status = record.publicationStatus;
  const isEmpty = !record.content.trim();
  const pending = status !== "published";

  const publish = async () => {
    setPublishing(true);
    try {
      await dataProvider.publishCmsText(screen.resource, record.id);
      notify("cms-texts.notify.published", { type: "info" });
      onPublished();
    } catch (error) {
      notify(backendMessage(error, translate("shared.actions.error")), {
        type: "error",
      });
    } finally {
      setPublishing(false);
      setConfirmOpen(false);
    }
  };

  return (
    <section
      aria-label={translate("cms-texts.publication.title")}
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between",
        pending ? "border-amber-500/40 bg-amber-500/10" : "border-border bg-card",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5 text-sm">
        <PublicationStatusBadge status={status} />
        <p className="text-muted-foreground">
          {record.published
            ? translate("cms-texts.publication.published", {
                date: formatDateTime(record.published.publishedAt),
                name: record.published.publishedBy,
                version: record.published.version,
              })
            : translate("cms-texts.publication.never_published")}
        </p>
        {record.draftUpdatedAt && record.draftUpdatedBy && (
          <p className="text-muted-foreground">
            {translate("cms-texts.publication.draft_updated", {
              date: formatDateTime(record.draftUpdatedAt),
              name: record.draftUpdatedBy,
            })}
          </p>
        )}
        {status === "pending-changes" && (
          <p className="font-medium text-amber-700 dark:text-amber-400">
            {translate("cms-texts.publication.pending")}
          </p>
        )}
        {isEmpty && (
          <p className="font-medium text-destructive">
            {translate("cms-texts.publication.empty")}
          </p>
        )}
        {!record.isActive && (
          <p className="text-muted-foreground">
            {translate(`${screen.i18n}.publication.inactive`)}
          </p>
        )}
        {!canPublish && pending && (
          <p className="text-muted-foreground">
            {translate("cms-texts.publication.read_only")}
          </p>
        )}
      </div>

      {canPublish && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button
            type="button"
            className="shrink-0"
            disabled={!pending || isEmpty || publishing}
            onClick={() => setConfirmOpen(true)}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            {translate("cms-texts.publication.publish")}
          </Button>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {translate("cms-texts.publication.publish_confirm_title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {translate(`${screen.i18n}.publication.publish_confirm_description`)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {translate("shared.actions.cancel", { _: "Cancelar" })}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={publishing}
                onClick={(event) => {
                  event.preventDefault();
                  void publish();
                }}
              >
                {translate("cms-texts.publication.publish")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
}
