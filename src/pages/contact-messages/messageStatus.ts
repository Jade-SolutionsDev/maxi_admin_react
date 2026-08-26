export type ContactMessageStatus =
  | "nuevo"
  | "en_proceso"
  | "respondido"
  | "cerrado";

export type ContactReplyChannel =
  | "email"
  | "whatsapp"
  | "telefono"
  | "plataforma"
  | "nota";

export const MESSAGE_STATUSES: ContactMessageStatus[] = [
  "nuevo",
  "en_proceso",
  "respondido",
  "cerrado",
];

/** Tailwind classes per status for the badge chips (orders palette). */
export const MESSAGE_STATUS_CLASSES: Record<ContactMessageStatus, string> = {
  nuevo: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  en_proceso: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  respondido: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cerrado: "bg-muted text-muted-foreground",
};

export interface ContactReplyRecord {
  id: string;
  channel: ContactReplyChannel;
  templateId: string | null;
  body: string | null;
  userName: string | null;
  createdAt: string;
}
