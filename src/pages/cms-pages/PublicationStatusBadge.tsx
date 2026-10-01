import { useTranslate } from "ra-core";
import { CheckCircle2, CircleDashed, CircleDot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CmsTextPublicationStatus } from "./cms-text";

const STYLES: Record<CmsTextPublicationStatus, string> = {
  published: "border-primary/30 bg-primary/10 text-primary",
  "pending-changes":
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  unpublished: "border-border bg-muted text-muted-foreground",
};

const ICONS = {
  published: CheckCircle2,
  "pending-changes": CircleDot,
  unpublished: CircleDashed,
} as const;

export function PublicationStatusBadge({
  status,
}: {
  status: CmsTextPublicationStatus;
}) {
  const translate = useTranslate();
  const Icon = ICONS[status];

  return (
    <Badge variant="outline" className={cn(STYLES[status])}>
      <Icon aria-hidden />
      {translate(`cms-texts.status.${status}`)}
    </Badge>
  );
}
