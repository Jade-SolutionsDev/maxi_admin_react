import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import {
  COMPLAINT_STATUS_CLASSES,
  type ComplaintStatus,
} from "./complaintStatus";

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        COMPLAINT_STATUS_CLASSES[status],
      )}
    >
      {translate(`complaints.status.${status}`, { _: status })}
    </span>
  );
}
