import { useState } from "react";
import { useTranslate } from "ra-core";
import {
  CheckCircle2,
  CircleDot,
  Eye,
  Loader2,
  Rocket,
} from "lucide-react";

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
import type { CmsHomeState } from "@/providers/dataProvider";
import { formatDateTime } from "./date-format";

interface PublishStatusCardProps {
  state: CmsHomeState;
  /** Local edits not saved yet: preview and publish would show stale data. */
  isDirty: boolean;
  canPublish: boolean;
  isPreviewing: boolean;
  isPublishing: boolean;
  onPreview: () => void;
  onPublish: () => Promise<void>;
}

export function PublishStatusCard({
  state,
  isDirty,
  canPublish,
  isPreviewing,
  isPublishing,
  onPreview,
  onPublish,
}: PublishStatusCardProps) {
  const translate = useTranslate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pending = state.hasUnpublishedChanges;

  return (
    <section
      aria-label={translate("cms-home.actions.publish")}
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        pending
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-border bg-card",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          {pending ? (
            <CircleDot className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          )}
          {translate(
            pending ? "cms-home.status.pending" : "cms-home.status.up_to_date",
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {state.publishedAt && state.publishedBy
            ? translate("cms-home.status.published", {
                date: formatDateTime(state.publishedAt),
                name: state.publishedBy,
              })
            : translate("cms-home.status.never_published")}
        </p>
        {state.updatedAt && state.updatedBy && (
          <p className="text-sm text-muted-foreground">
            {translate("cms-home.status.draft_updated", {
              date: formatDateTime(state.updatedAt),
              name: state.updatedBy,
            })}
          </p>
        )}
        {isDirty && (
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {translate("cms-home.status.unsaved")}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isDirty || isPreviewing}
          onClick={onPreview}
        >
          {isPreviewing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {translate("cms-home.actions.preview")}
        </Button>

        {canPublish && (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button
              type="button"
              disabled={isDirty || !pending || isPublishing}
              onClick={() => setConfirmOpen(true)}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {translate("cms-home.actions.publish")}
            </Button>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {translate("cms-home.actions.publish_confirm_title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {translate("cms-home.actions.publish_confirm_description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {translate("shared.actions.cancel", { _: "Cancelar" })}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await onPublish();
                    setConfirmOpen(false);
                  }}
                >
                  {translate("cms-home.actions.publish")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </section>
  );
}
