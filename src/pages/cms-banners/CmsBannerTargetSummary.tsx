import { useTranslate } from "ra-core";
import { Link } from "react-router-dom";

import type { CmsBannerTarget } from "./cms-banner-target";
import { getCmsBannerTargetAdminPath } from "./cms-banner-target";

export function CmsBannerTargetSummary({
  target,
}: {
  target?: CmsBannerTarget | null;
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
    <Link
      to={getCmsBannerTargetAdminPath(target)}
      className="font-medium text-primary hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {target.name ?? target.id}
    </Link>
  );
}
