import { useTranslate } from "ra-core";

import { formatDateTime } from "@/pages/cms-home/date-format";
import { noticeScheduleState, type CmsText } from "./cms-text";

/** "Visible · hasta el 11 oct" — when a home notice shows, in one line. */
export function NoticeSchedule({
  notice,
}: {
  notice: Pick<CmsText, "startsAt" | "endsAt">;
}) {
  const translate = useTranslate();
  const state = noticeScheduleState(notice, new Date());
  const from = notice.startsAt ? formatDateTime(notice.startsAt) : null;
  const to = notice.endsAt ? formatDateTime(notice.endsAt) : null;

  const range =
    from && to
      ? translate("cms-home-notices.schedule.range", { from, to })
      : from
        ? translate("cms-home-notices.schedule.from", { from })
        : to
          ? translate("cms-home-notices.schedule.until", { to })
          : translate("cms-home-notices.schedule.always");

  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-medium">
        {translate(`cms-home-notices.schedule.${state}`)}
      </span>
      <span className="text-xs text-muted-foreground">{range}</span>
    </span>
  );
}
