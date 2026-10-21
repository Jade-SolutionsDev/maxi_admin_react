export type TicketStatus = "abierto" | "en_curso" | "resuelto" | "cerrado";
export type TicketPriority = "baja" | "media" | "alta";

export const TICKET_STATUSES: TicketStatus[] = [
  "abierto",
  "en_curso",
  "resuelto",
  "cerrado",
];

export const TICKET_PRIORITIES: TicketPriority[] = ["baja", "media", "alta"];

/** Clases por estado para las insignias, con la paleta de pedidos y quejas. */
export const TICKET_STATUS_CLASSES: Record<TicketStatus, string> = {
  abierto: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  en_curso: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  resuelto: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cerrado: "bg-muted text-muted-foreground",
};

/**
 * La prioridad se ve de un vistazo o no sirve de nada: quien entra al listado
 * busca lo urgente, no lee tres columnas. «Media» va en gris a propósito —es
 * lo normal, y pintarla de color haría que todo pareciera urgente—.
 */
export const TICKET_PRIORITY_CLASSES: Record<TicketPriority, string> = {
  baja: "bg-muted text-muted-foreground",
  media: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  alta: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export type TicketEventKind =
  "abierto" | "estado" | "asignado" | "editado" | "comentario";

export interface TicketEventRecord {
  id: string;
  kind: TicketEventKind;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  note: string | null;
  userId: string;
  userName: string | null;
  createdAt: string;
}

export interface TicketRecord {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryLabel: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  assignedUserId: string | null;
  assignedUserName: string | null;
  createdByUserId: string;
  createdByUserName: string | null;
  images: string[];
  resolution: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  events?: TicketEventRecord[];
}

/**
 * A dónde puede moverse un ticket desde cada estado, con el permiso de
 * gestionar.
 *
 * Es la misma tabla que aplica la API, menos las dos transiciones que piden el
 * permiso de cerrar: tenerla aquí evita ofrecer un botón que el servidor va a
 * rechazar. **`cerrado` no sale de aquí nunca** —cerrar tiene su propia acción
 * y su propio permiso— y de `cerrado` no sale nada, porque reabrir también lo
 * pide.
 */
export const SIGUIENTES: Record<TicketStatus, TicketStatus[]> = {
  abierto: ["en_curso"],
  en_curso: ["abierto"],
  resuelto: ["en_curso"],
  cerrado: [],
};

/** Cuántas imágenes acepta la API por ticket. */
export const MAX_IMAGENES = 6;
