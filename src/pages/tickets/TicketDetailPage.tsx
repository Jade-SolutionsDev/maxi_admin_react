import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Flag,
  MessageSquare,
  RotateCcw,
  Tag,
  Ticket as TicketIcon,
  User as UserIcon,
} from "lucide-react";
import {
  useCanAccess,
  useDataProvider,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { DateField } from "@/components/admin/date-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { TicketPriorityBadge, TicketStatusBadge } from "./TicketBadges";
import {
  SIGUIENTES,
  type TicketEventRecord,
  type TicketRecord,
} from "./ticketStatus";

const Dato = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <span className="mt-0.5 text-muted-foreground">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  </div>
);

/**
 * Qué dice cada línea del historial.
 *
 * El texto se arma aquí y no en la API porque es texto de pantalla: el
 * servidor guarda qué pasó, no cómo se cuenta.
 */
const comoSeLee = (
  evento: TicketEventRecord,
  translate: (clave: string, opciones?: Record<string, unknown>) => string,
): string => {
  const estado = (valor: string | null) =>
    valor ? translate(`tickets.status.${valor}`, { _: valor }) : "";
  switch (evento.kind) {
    case "abierto":
      return translate("tickets.history.abierto", { _: "Abrió el ticket" });
    case "estado":
      return translate("tickets.history.estado", {
        _: `Cambió el estado: ${estado(evento.fromStatus)} → ${estado(evento.toStatus)}`,
        from: estado(evento.fromStatus),
        to: estado(evento.toStatus),
      });
    case "asignado":
      return translate("tickets.history.asignado", {
        _: "Cambió a quién lo atiende",
      });
    case "editado":
      return translate("tickets.history.editado", {
        _: "Corrigió los datos del ticket",
      });
    default:
      return translate("tickets.history.comentario", { _: "Comentó" });
  }
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const [comentario, setComentario] = useState("");
  const [resolucion, setResolucion] = useState("");
  const [motivoReapertura, setMotivoReapertura] = useState("");

  const { data, isPending } = useGetOne<TicketRecord>(
    "tickets",
    { id: id! },
    { enabled: Boolean(id) },
  );

  const { canAccess: puedeGestionar } = useCanAccess({
    resource: "tickets",
    action: "update",
  });
  const { canAccess: puedeCerrar } = useCanAccess({
    resource: "tickets",
    action: "close",
  });
  const { canAccess: puedeComentar } = useCanAccess({
    resource: "tickets",
    action: "create",
  });

  const alTerminar = (mensaje: string) => {
    notify(mensaje, { type: "success" });
    setComentario("");
    setResolucion("");
    setMotivoReapertura("");
    refresh();
  };
  const alFallar = (error: unknown) =>
    notify(error instanceof Error ? error.message : String(error), {
      type: "error",
    });

  const mover = useMutation({
    mutationFn: (estado: string) =>
      dataProvider.changeTicketStatus(id!, estado),
    onSuccess: () =>
      alTerminar(
        translate("tickets.notify.estado", { _: "Estado actualizado" }),
      ),
    onError: alFallar,
  });

  const resolver = useMutation({
    mutationFn: () =>
      dataProvider.changeTicketStatus(id!, "resuelto", resolucion.trim()),
    onSuccess: () =>
      alTerminar(
        translate("tickets.notify.resuelto", { _: "Ticket resuelto" }),
      ),
    onError: alFallar,
  });

  const cerrar = useMutation({
    mutationFn: () => dataProvider.closeTicket(id!),
    onSuccess: () =>
      alTerminar(translate("tickets.notify.cerrado", { _: "Ticket cerrado" })),
    onError: alFallar,
  });

  const reabrir = useMutation({
    mutationFn: () => dataProvider.reopenTicket(id!, motivoReapertura.trim()),
    onSuccess: () =>
      alTerminar(
        translate("tickets.notify.reabierto", { _: "Ticket reabierto" }),
      ),
    onError: alFallar,
  });

  const comentar = useMutation({
    mutationFn: () => dataProvider.addTicketComment(id!, comentario.trim()),
    onSuccess: () =>
      alTerminar(
        translate("tickets.notify.comentario", { _: "Comentario añadido" }),
      ),
    onError: alFallar,
  });

  if (isPending || !data) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        {translate("ra.page.loading", { _: "Cargando…" })}
      </p>
    );
  }

  const siguientes = SIGUIENTES[data.status];
  const eventos = data.events ?? [];
  const hayAcciones =
    puedeComentar ||
    (puedeGestionar && (siguientes.length > 0 || data.status !== "cerrado")) ||
    puedeCerrar;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          {translate("tickets.volver", { _: "Volver a los tickets" })}
        </Link>
        <div className="flex items-center gap-2">
          <TicketPriorityBadge priority={data.priority} />
          <TicketStatusBadge status={data.status} />
        </div>
      </div>

      <section className="rounded-lg border border-border p-5">
        <h1 className="mb-4 text-base font-semibold text-foreground">
          {data.title}
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Dato
            icon={<Tag size={16} />}
            label={translate("tickets.fields.category", { _: "Categoría" })}
          >
            {data.categoryLabel || "—"}
          </Dato>
          <Dato
            icon={<Flag size={16} />}
            label={translate("tickets.fields.priority", { _: "Prioridad" })}
          >
            {translate(`tickets.priority.${data.priority}`, {
              _: data.priority,
            })}
          </Dato>
          <Dato
            icon={<UserIcon size={16} />}
            label={translate("tickets.fields.assigned", { _: "Lo atiende" })}
          >
            {data.assignedUserName || (
              <span className="text-muted-foreground">
                {translate("tickets.sinAsignar", { _: "Sin asignar" })}
              </span>
            )}
          </Dato>
          <Dato
            icon={<CalendarDays size={16} />}
            label={translate("tickets.fields.openedBy", { _: "Lo abrió" })}
          >
            {data.createdByUserName || "—"}
            <span className="block text-xs text-muted-foreground">
              <DateField record={data} source="createdAt" showTime />
            </span>
          </Dato>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {translate("tickets.fields.description", { _: "Qué pasa" })}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {data.description}
          </p>
        </div>

        {data.images.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {data.images.map((url) => (
              <li key={url}>
                {/* Se abre a tamaño completo en otra pestaña: una foto de una
                    pantalla de error no se lee en 96 píxeles. */}
                <a href={url} target="_blank" rel="noreferrer">
                  <img
                    src={url}
                    alt=""
                    className="h-24 w-24 rounded-md border border-border object-cover transition hover:opacity-80"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}

        {data.resolution && (
          <div className="mt-4 rounded-md bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              {translate("tickets.fields.resolution", { _: "Qué se hizo" })}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
              {data.resolution}
            </p>
            {data.closedAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                {translate("tickets.cerradoEl", { _: "Cerrado el" })}{" "}
                <DateField record={data} source="closedAt" showTime />
              </p>
            )}
          </div>
        )}
      </section>

      {hayAcciones && (
        <section className="space-y-4 rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground">
            {translate("tickets.acciones", { _: "Qué hacer con él" })}
          </h2>

          {puedeGestionar && siguientes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {siguientes.map((estado) => (
                <Button
                  key={estado}
                  variant="outline"
                  disabled={mover.isPending}
                  onClick={() => mover.mutate(estado)}
                >
                  {translate(`tickets.mover.${estado}`, {
                    _: translate(`tickets.status.${estado}`, { _: estado }),
                  })}
                </Button>
              ))}
            </div>
          )}

          {/* Resolver: lo hace quien arregló, con `tickets:update`. No pide el
              permiso de cerrar a propósito — el visto bueno es el paso
              siguiente, y lo da otro. */}
          {puedeGestionar &&
            (data.status === "abierto" || data.status === "en_curso") && (
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  {translate("tickets.resolverAviso", {
                    _: "Di qué hiciste: lo lee quien tenga que confirmarlo y el próximo que se tropiece con lo mismo.",
                  })}
                </p>
                <Textarea
                  value={resolucion}
                  onChange={(e) => setResolucion(e.target.value)}
                  rows={3}
                  placeholder={translate("tickets.resolucionPlaceholder", {
                    _: "Era el cabezal: lo limpié y volvió a imprimir.",
                  })}
                />
                <Button
                  disabled={resolucion.trim().length < 3 || resolver.isPending}
                  onClick={() => resolver.mutate()}
                >
                  <CheckCircle2 size={16} />
                  {translate("tickets.resolver", { _: "Marcar como resuelto" })}
                </Button>
              </div>
            )}

          {/* Cerrar: el visto bueno, con `tickets:close`. Solo desde resuelto,
              que es lo que confirma. */}
          {puedeCerrar && data.status === "resuelto" && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {translate("tickets.cerrarAviso", {
                  _: "Cerrarlo confirma que lo resuelto está resuelto. No borra lo que escribió quien lo arregló.",
                })}
              </p>
              <Button
                disabled={cerrar.isPending}
                onClick={() => cerrar.mutate()}
              >
                <CheckCircle2 size={16} />
                {translate("tickets.cerrar", { _: "Cerrar el ticket" })}
              </Button>
            </div>
          )}

          {puedeCerrar && data.status === "cerrado" && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {translate("tickets.reabrirAviso", {
                  _: "Reabrirlo lo devuelve a «en curso» y borra la resolución anterior, que ya no describe la verdad. Di por qué.",
                })}
              </p>
              <Textarea
                value={motivoReapertura}
                onChange={(e) => setMotivoReapertura(e.target.value)}
                rows={3}
                placeholder={translate("tickets.reaperturaPlaceholder", {
                  _: "Volvió a pasar esta mañana.",
                })}
              />
              <Button
                variant="outline"
                disabled={
                  motivoReapertura.trim().length < 3 || reabrir.isPending
                }
                onClick={() => reabrir.mutate()}
              >
                <RotateCcw size={16} />
                {translate("tickets.reabrir", { _: "Reabrir el ticket" })}
              </Button>
            </div>
          )}

          {puedeComentar && (
            <div className="space-y-2 border-t border-border pt-4">
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                placeholder={translate("tickets.comentarioPlaceholder", {
                  _: "Qué probaste, qué viste, qué falta…",
                })}
              />
              <Button
                variant="secondary"
                disabled={comentario.trim().length < 3 || comentar.isPending}
                onClick={() => comentar.mutate()}
              >
                <MessageSquare size={16} />
                {translate("tickets.comentar", { _: "Comentar" })}
              </Button>
            </div>
          )}
        </section>
      )}

      <section className="rounded-lg border border-border p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <TicketIcon size={16} />
          {translate("tickets.historial", { _: "Historial" })}
        </h2>
        {eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {translate("tickets.sinHistorial", {
              _: "Todavía no ha pasado nada más.",
            })}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {eventos.map((evento) => (
              <li key={evento.id} className="py-3">
                <p className="text-sm text-foreground">
                  {comoSeLee(evento, translate)}
                </p>
                {evento.note && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {evento.note}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {evento.userName ||
                    translate("tickets.alguien", { _: "Alguien" })}{" "}
                  · <DateField record={evento} source="createdAt" showTime />
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
