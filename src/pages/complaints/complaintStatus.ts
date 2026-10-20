export type ComplaintStatus = "abierta" | "en_gestion" | "resuelta";

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  "abierta",
  "en_gestion",
  "resuelta",
];

/** Clases por estado para las insignias, con la paleta de pedidos. */
export const COMPLAINT_STATUS_CLASSES: Record<ComplaintStatus, string> = {
  abierta: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  en_gestion: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  resuelta: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export type ComplaintEventKind =
  | "registrada"
  | "estado"
  | "asignada"
  | "editada"
  | "nota";

export interface ComplaintEventRecord {
  id: string;
  kind: ComplaintEventKind;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus | null;
  note: string | null;
  userId: string;
  userName: string | null;
  createdAt: string;
}

export interface ComplaintRecord {
  id: string;
  clientId: string;
  clientName: string | null;
  orderId: string | null;
  orderNumber: string | null;
  motiveId: string;
  motiveLabel: string | null;
  description: string;
  status: ComplaintStatus;
  assignedUserId: string | null;
  assignedUserName: string | null;
  createdByUserId: string;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  events?: ComplaintEventRecord[];
}

/**
 * A dónde puede moverse una queja desde cada estado.
 *
 * Es la misma tabla que aplica la API: tenerla aquí evita ofrecer un botón
 * que el servidor va a rechazar. Resolver no sale de aquí porque tiene su
 * propia acción y su propio permiso.
 */
export const SIGUIENTES: Record<ComplaintStatus, ComplaintStatus[]> = {
  abierta: ["en_gestion"],
  en_gestion: ["abierta"],
  resuelta: ["en_gestion"],
};
