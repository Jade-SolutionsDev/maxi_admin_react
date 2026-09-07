import { useTranslate } from "ra-core";

import { Badge } from "@/components/ui/badge";
import type { CmsBannerTarget } from "./cms-banner-target";

export function CmsBannerTargetSummary({
  target,
  showSlug = false,
}: {
  target?: CmsBannerTarget | null;
  showSlug?: boolean;
}) {
  const translate = useTranslate();

  if (!target) {
    return (
      <span className="text-sm text-muted-foreground">
        {translate("cms-banners.target.none")}
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="font-medium text-foreground">{target.name ?? target.id}</p>
      {showSlug && target.slug ? (
        <p className="font-mono text-xs text-muted-foreground">/{target.slug}</p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">
          {translate(`cms-banners.target.types.${target.type}`)}
        </Badge>
        <Badge variant={target.isAvailable ? "outline" : "destructive"}>
          {translate(
            target.isAvailable
              ? "cms-banners.target.available"
              : "cms-banners.target.unavailable",
          )}
        </Badge>
      </div>
    </div>
  );
}
