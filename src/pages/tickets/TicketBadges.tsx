import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import {
  TICKET_PRIORITY_CLASSES,
  TICKET_STATUS_CLASSES,
  type TicketPriority,
  type TicketStatus,
} from "./ticketStatus";

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const translate = useTranslate();
  return (
    <span className={cn(base, TICKET_STATUS_CLASSES[status])}>
      {translate(`tickets.status.${status}`, { _: status })}
    </span>
  );
}

export function TicketPriorityBadge({
  priority,
}: {
  priority: TicketPriority;
}) {
  const translate = useTranslate();
  return (
    <span className={cn(base, TICKET_PRIORITY_CLASSES[priority])}>
      {translate(`tickets.priority.${priority}`, { _: priority })}
    </span>
  );
}
