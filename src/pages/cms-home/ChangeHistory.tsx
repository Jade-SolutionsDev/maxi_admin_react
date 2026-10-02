import { useTranslate } from "ra-core";
import { History } from "lucide-react";

import { FormSection } from "@/components/admin";
import { Skeleton } from "@/components/ui/skeleton";
import type { CmsHomeChange } from "@/providers/dataProvider";
import { formatDateTime } from "./date-format";

export function ChangeHistory({ changes }: { changes: CmsHomeChange[] | null }) {
  const translate = useTranslate();

  return (
    <FormSection
      icon={<History />}
      title={translate("cms-home.history.title")}
    >
      {!changes ? (
        <Skeleton className="h-20 w-full" />
      ) : changes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate("cms-home.history.empty")}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {changes.map((change) => (
            <li
              key={change.id}
              className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span>
                <span className="font-medium text-foreground">
                  {change.actorName}
                </span>{" "}
                <span className="text-muted-foreground">
                  {translate(`cms-home.history.actions.${change.action}`, {
                    subject: change.subject ?? "",
                  })}
                </span>
              </span>
              <time
                dateTime={change.createdAt}
                className="shrink-0 text-xs tabular-nums text-muted-foreground"
              >
                {formatDateTime(change.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </FormSection>
  );
}
