import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MessageSquareWarning,
  NotebookPen,
  Package,
  Tag,
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
import { ComplaintStatusBadge } from "./ComplaintBadges";
import {
  type ComplaintEventRecord,
  type ComplaintRecord,
  SIGUIENTES,
} from "./complaintStatus";

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
  evento: ComplaintEventRecord,
  translate: (clave: string, opciones?: Record<string, unknown>) => string,
): string => {
  const estado = (valor: string | null) =>
    valor ? translate(`complaints.status.${valor}`, { _: valor }) : "";
  switch (evento.kind) {
    case "registrada":
      return translate("complaints.history.registrada", {
        _: "Registró la queja",
      });
    case "estado":
      return translate("complaints.history.estado", {
        _: `Cambió el estado: ${estado(evento.fromStatus)} → ${estado(evento.toStatus)}`,
        from: estado(evento.fromStatus),
        to: estado(evento.toStatus),
      });
    case "asignada":
      return translate("complaints.history.asignada", {
        _: "Cambió a quién la atiende",
      });
    case "editada":
      return translate("complaints.history.editada", {
        _: "Corrigió los datos de la queja",
      });
    default:
      return translate("complaints.history.nota", { _: "Añadió una nota" });
  }
};

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const [nota, setNota] = useState("");
  const [resolucion, setResolucion] = useState("");

  const { data, isPending } = useGetOne<ComplaintRecord>(
    "complaints",
    { id: id! },
    { enabled: Boolean(id) },
  );

  const { canAccess: puedeGestionar } = useCanAccess({
    resource: "complaints",
    action: "update",
  });
  const { canAccess: puedeCerrar } = useCanAccess({
    resource: "complaints",
    action: "close",
  });

  const alTerminar = (mensaje: string) => {
    notify(mensaje, { type: "success" });
    setNota("");
    setResolucion("");
    refresh();
  };
  const alFallar = (error: unknown) =>
    notify(error instanceof Error ? error.message : String(error), {
      type: "error",
    });

  const mover = useMutation({
    mutationFn: (estado: string) =>
      dataProvider.changeComplaintStatus(id!, estado),
    onSuccess: () =>
      alTerminar(
        translate("complaints.notify.estado", { _: "Estado actualizado" }),
      ),
    onError: alFallar,
  });

  const resolver = useMutation({
    mutationFn: () => dataProvider.resolveComplaint(id!, resolucion.trim()),
    onSuccess: () =>
      alTerminar(
        translate("complaints.notify.resuelta", { _: "Queja resuelta" }),
      ),
    onError: alFallar,
  });

  const anotar = useMutation({
    mutationFn: () => dataProvider.addComplaintNote(id!, nota.trim()),
    onSuccess: () =>
      alTerminar(translate("complaints.notify.nota", { _: "Nota añadida" })),
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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          {translate("complaints.volver", { _: "Volver a las quejas" })}
        </Link>
        <ComplaintStatusBadge status={data.status} />
      </div>

      <section className="rounded-lg border border-border p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Dato
            icon={<UserIcon size={16} />}
            label={translate("complaints.fields.client", { _: "Cliente" })}
          >
            <Link
              to={`/clients/${data.clientId}`}
              className="text-primary hover:underline"
            >
              {data.clientName || data.clientId}
            </Link>
          </Dato>
          <Dato
            icon={<Package size={16} />}
            label={translate("complaints.fields.order", { _: "Pedido" })}
          >
            {data.orderId ? (
              <Link
                to={`/orders/${data.orderId}`}
                className="text-primary hover:underline"
              >
                {data.orderNumber || data.orderId}
              </Link>
            ) : (
              <span className="text-muted-foreground">
                {translate("complaints.sinPedido", { _: "Sin pedido" })}
              </span>
            )}
          </Dato>
          <Dato
            icon={<Tag size={16} />}
            label={translate("complaints.fields.motive", { _: "Motivo" })}
          >
            {data.motiveLabel || "—"}
          </Dato>
          <Dato
            icon={<CalendarDays size={16} />}
            label={translate("list.fields.createdAt", { _: "Registrada" })}
          >
            <DateField record={data} source="createdAt" showTime />
          </Dato>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {translate("complaints.fields.description", { _: "Qué pasó" })}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {data.description}
          </p>
        </div>

        {data.resolution && (
          <div className="mt-4 rounded-md bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              {translate("complaints.fields.resolution", {
                _: "Cómo se resolvió",
              })}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
              {data.resolution}
            </p>
          </div>
        )}
      </section>

      {(puedeGestionar || puedeCerrar) && (
        <section className="space-y-4 rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground">
            {translate("complaints.acciones", { _: "Qué hacer con ella" })}
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
                  {translate(`complaints.mover.${estado}`, {
                    _: translate(`complaints.status.${estado}`, { _: estado }),
                  })}
                </Button>
              ))}
            </div>
          )}

          {puedeGestionar && (
            <div className="space-y-2">
              <Textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={3}
                placeholder={translate("complaints.notaPlaceholder", {
                  _: "Una nota para el historial: qué se habló, qué se comprobó…",
                })}
              />
              <Button
                variant="secondary"
                disabled={nota.trim().length < 3 || anotar.isPending}
                onClick={() => anotar.mutate()}
              >
                <NotebookPen size={16} />
                {translate("complaints.anotar", { _: "Añadir nota" })}
              </Button>
            </div>
          )}

          {puedeCerrar && data.status !== "resuelta" && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {translate("complaints.resolverAviso", {
                  _: "Di cómo se resolvió: lo lee quien atienda la próxima llamada de este cliente.",
                })}
              </p>
              <Textarea
                value={resolucion}
                onChange={(e) => setResolucion(e.target.value)}
                rows={3}
                placeholder={translate("complaints.resolucionPlaceholder", {
                  _: "Se repuso el producto faltante y se avisó al cliente.",
                })}
              />
              <Button
                disabled={resolucion.trim().length < 3 || resolver.isPending}
                onClick={() => resolver.mutate()}
              >
                <CheckCircle2 size={16} />
                {translate("complaints.resolver", { _: "Dar por resuelta" })}
              </Button>
            </div>
          )}
        </section>
      )}

      <section className="rounded-lg border border-border p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageSquareWarning size={16} />
          {translate("complaints.historial", { _: "Historial" })}
        </h2>
        {eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {translate("complaints.sinHistorial", {
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
                    translate("complaints.alguien", { _: "Alguien" })}{" "}
                  ·{" "}
                  <DateField record={evento} source="createdAt" showTime />
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
