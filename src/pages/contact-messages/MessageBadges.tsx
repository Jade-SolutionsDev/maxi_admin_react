import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import {
  type ContactMessageStatus,
  MESSAGE_STATUS_CLASSES,
} from "./messageStatus";

export function MessageStatusBadge({
  status,
}: {
  status: ContactMessageStatus;
}) {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        MESSAGE_STATUS_CLASSES[status],
      )}
    >
      {translate(`contact-messages.status.${status}`, { _: status })}
    </span>
  );
}
