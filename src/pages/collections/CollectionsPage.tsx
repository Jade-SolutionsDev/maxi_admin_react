import { useState } from "react";
import { Link } from "react-router-dom";
import { useDataProvider, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Banknote, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  CollectionOrigin,
  CollectionRow,
  CollectionStatus,
  CollectionsFilters,
  ExtendedDataProvider,
} from "@/providers/dataProvider";

const money = (amount: string): string =>
  `$${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** El techo que admite `GET /payments/collections`. */
const MAXIMO_POR_PETICION = 500;

/**
 * Hasta dónde se exporta de una vez. No es un límite de la API: es para que
 * un filtro vacío sobre el histórico no se traiga decenas de miles de filas al
 * navegador en silencio. Si se alcanza, el fichero se marca «-parcial» y se
 * dice cuántas quedaron fuera.
 */
const TOPE_DE_EXPORTACION = 5000;

const escapaCsv = (valor: string | null) =>
  valor === null ? "" : `"${valor.replace(/"/g, '""')}"`;

const aCsv = (filas: CollectionRow[]): string => {
  const cabecera = [
    "fecha",
    "pedido",
    "cliente",
    "metodo",
    "estado",
    "origen",
    "sin_cobro_registrado",
    "referencia",
    "importe",
  ].join(",");
  const cuerpo = filas.map((f) =>
    [
      new Date(f.date).toISOString().slice(0, 10),
      escapaCsv(f.orderNumber),
      escapaCsv(f.clientName),
      escapaCsv(f.method),
      f.status,
      f.origin,
      f.unreconciled ? "si" : "no",
      escapaCsv(f.reference),
      f.amount,
    ].join(","),
  );
  return [cabecera, ...cuerpo].join("\n");
};

const descargaCsv = (csv: string, nombre: string) => {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
};

const ESTADOS: CollectionStatus[] = ["cobrado", "pendiente", "reembolsado"];
const ORIGENES: CollectionOrigin[] = ["pasarela", "manual"];

/**
 * El dinero que entró por las ventas de la tienda. MxH-0063.
 *
 * **Una fila por pedido, conciliada contra los cobros registrados**, y el
 * descuadre a la vista en vez de escondido: una fila que diga «cobrado · sin
 * cobro registrado» es exactamente lo que la tarjeta pide poder ver —«hay que
 * poder saber qué entró de verdad y qué apuntó alguien»—.
 *
 * Los totales vienen del servidor y son **del periodo filtrado completo**, no
 * de la página: un total que solo sume lo que se ve engaña en cuanto hay más
 * de una página.
 */
export default function CollectionsPage() {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const [filtros, setFiltros] = useState<CollectionsFilters>({
    page: 1,
    limit: 50,
  });
  const [exportando, setExportando] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["collections", filtros],
    queryFn: () => dataProvider.getCollections(filtros).then((r) => r.data),
  });

  const filas = data?.rows ?? [];
  const totales = data?.totals;

  const cambia = (cambio: Partial<CollectionsFilters>) =>
    setFiltros((previo) => ({ ...previo, ...cambio, page: 1 }));

  /**
   * Exporta **el periodo filtrado entero**, no la página.
   *
   * Es lo que pide `MxH-0063`, y exportar solo lo que se ve engaña: con 50
   * filas por página, un informe del mes se queda en el primer puñado sin que
   * nada lo avise. El periodo se trae paginando de `MAXIMO_POR_PETICION` en
   * `MAXIMO_POR_PETICION` —el tope que admite la API— y con un techo por si
   * alguien filtra el histórico completo.
   */
  const descarga = async () => {
    setExportando(true);
    try {
      const todas: CollectionRow[] = [];
      let page = 1;
      let total = Number.POSITIVE_INFINITY;

      while (todas.length < Math.min(total, TOPE_DE_EXPORTACION)) {
        const pagina = await dataProvider
          .getCollections({ ...filtros, page, limit: MAXIMO_POR_PETICION })
          .then((r) => r.data);
        total = pagina.total;
        if (pagina.rows.length === 0) break;
        todas.push(...pagina.rows);
        page += 1;
      }

      const recortado = todas.length >= TOPE_DE_EXPORTACION && total > todas.length;
      descargaCsv(
        aCsv(todas.slice(0, TOPE_DE_EXPORTACION)),
        `cobros-${new Date().toISOString().slice(0, 10)}${recortado ? "-parcial" : ""}.csv`,
      );
      if (recortado) {
        window.alert(
          translate("collections.export_truncated", {
            smart_count: TOPE_DE_EXPORTACION,
            _: `El periodo tiene ${total} filas y se exportaron las primeras ${TOPE_DE_EXPORTACION}. Acota las fechas para llevártelo entero.`,
          }),
        );
      }
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Banknote size={24} />
          {translate("collections.title", { _: "Cobros de la tienda" })}
        </h1>
        <Button
          type="button"
          variant="outline"
          onClick={descarga}
          disabled={filas.length === 0 || exportando}
        >
          <Download size={16} className="mr-2" />
          {exportando
            ? translate("collections.exporting", { _: "Exportando…" })
            : translate("collections.export", { _: "Exportar" })}
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Label htmlFor="desde">
            {translate("collections.from", { _: "Desde" })}
          </Label>
          <Input
            id="desde"
            type="date"
            value={filtros.from ?? ""}
            onChange={(e) => cambia({ from: e.target.value || undefined })}
          />
        </div>
        <div>
          <Label htmlFor="hasta">
            {translate("collections.to", { _: "Hasta" })}
          </Label>
          <Input
            id="hasta"
            type="date"
            value={filtros.to ?? ""}
            onChange={(e) => cambia({ to: e.target.value || undefined })}
          />
        </div>
        <div>
          <Label htmlFor="estado">
            {translate("collections.status", { _: "Estado" })}
          </Label>
          <select
            id="estado"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={filtros.status ?? ""}
            onChange={(e) =>
              cambia({
                status: (e.target.value || undefined) as
                  | CollectionStatus
                  | undefined,
              })
            }
          >
            <option value="">
              {translate("collections.any", { _: "Todos" })}
            </option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {translate(`collections.statuses.${e}`, { _: e })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="origen">
            {translate("collections.origin", { _: "Origen" })}
          </Label>
          <select
            id="origen"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={filtros.origin ?? ""}
            onChange={(e) =>
              cambia({
                origin: (e.target.value || undefined) as
                  | CollectionOrigin
                  | undefined,
              })
            }
          >
            <option value="">
              {translate("collections.any", { _: "Todos" })}
            </option>
            {ORIGENES.map((o) => (
              <option key={o} value={o}>
                {translate(`collections.origins.${o}`, { _: o })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="metodo">
            {translate("collections.method", { _: "Método" })}
          </Label>
          <Input
            id="metodo"
            placeholder="tropipay, usdt-bep-20…"
            value={filtros.method ?? ""}
            onChange={(e) => cambia({ method: e.target.value || undefined })}
          />
        </div>
      </div>

      {/* Totales del periodo */}
      {totales && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Total
            label={translate("collections.totals.collected", {
              _: "Cobrado",
            })}
            value={money(totales.collected)}
          />
          <Total
            label={translate("collections.totals.pending", {
              _: "Pendiente",
            })}
            value={money(totales.pending)}
          />
          <Total
            label={translate("collections.totals.refunded", {
              _: "Reembolsado",
            })}
            value={money(totales.refunded)}
          />
          <Total
            label={translate("collections.totals.unreconciled", {
              _: "Sin cobro registrado",
            })}
            value={money(totales.unreconciledAmount)}
            hint={translate("collections.totals.unreconciled_count", {
              smart_count: totales.unreconciledCount,
              _: `${totales.unreconciledCount} pedidos`,
            })}
            alerta={totales.unreconciledCount > 0}
          />
        </div>
      )}

      {isPending ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : filas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <Banknote className="mb-3 h-9 w-9 text-muted-foreground" />
          <p className="font-medium">
            {translate("collections.empty_title", { _: "Sin cobros" })}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {translate("collections.empty_hint", {
              _: "No hay pedidos con actividad de pago en este periodo.",
            })}
          </p>
        </div>
      ) : (
        <section className="rounded-lg border border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {translate("collections.date", { _: "Fecha" })}
                  </TableHead>
                  <TableHead>
                    {translate("collections.order", { _: "Pedido" })}
                  </TableHead>
                  <TableHead>
                    {translate("collections.client", { _: "Cliente" })}
                  </TableHead>
                  <TableHead>
                    {translate("collections.method", { _: "Método" })}
                  </TableHead>
                  <TableHead>
                    {translate("collections.origin", { _: "Origen" })}
                  </TableHead>
                  <TableHead>
                    {translate("collections.status", { _: "Estado" })}
                  </TableHead>
                  <TableHead className="text-right">
                    {translate("collections.amount", { _: "Importe" })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filas.map((f) => (
                  <Fila key={f.orderId} fila={f} translate={translate} />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {data && data.total > data.limit && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {translate("collections.showing", {
              _: `${filas.length} de ${data.total}`,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(filtros.page ?? 1) <= 1}
              onClick={() =>
                setFiltros((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
              }
            >
              {translate("ra.navigation.previous", { _: "Anterior" })}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(filtros.page ?? 1) * (filtros.limit ?? 50) >= data.total}
              onClick={() =>
                setFiltros((p) => ({ ...p, page: (p.page ?? 1) + 1 }))
              }
            >
              {translate("ra.navigation.next", { _: "Siguiente" })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Total({
  label,
  value,
  hint,
  alerta,
}: {
  label: string;
  value: string;
  hint?: string;
  alerta?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        alerta ? "border-amber-500/40 bg-amber-500/5" : "border-border",
      )}
    >
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {alerta && <AlertTriangle size={14} className="text-amber-600" />}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Fila({
  fila,
  translate,
}: {
  fila: CollectionRow;
  translate: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
        {new Date(fila.date).toLocaleDateString("es-CU")}
      </TableCell>
      <TableCell>
        <Link
          to={`/orders/${fila.orderId}`}
          className="font-medium text-primary hover:underline"
        >
          {fila.orderNumber ?? fila.orderId.slice(0, 8)}
        </Link>
      </TableCell>
      <TableCell>
        {fila.clientId ? (
          <Link
            to={`/clients/${fila.clientId}`}
            className="hover:underline"
          >
            {fila.clientName ?? "—"}
          </Link>
        ) : (
          (fila.clientName ?? "—")
        )}
      </TableCell>
      <TableCell className="text-sm">{fila.method ?? "—"}</TableCell>
      <TableCell>
        <Badge variant={fila.origin === "pasarela" ? "secondary" : "outline"}>
          {translate(`collections.origins.${fila.origin}`, { _: fila.origin })}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            className={cn(
              fila.status === "cobrado" &&
                "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              fila.status === "reembolsado" &&
                "bg-destructive/15 text-destructive",
              fila.status === "pendiente" && "bg-muted text-muted-foreground",
            )}
          >
            {translate(`collections.statuses.${fila.status}`, {
              _: fila.status,
            })}
          </Badge>
          {fila.unreconciled && (
            <Badge
              variant="outline"
              className="border-amber-500/40 text-amber-700 dark:text-amber-400"
            >
              {translate("collections.unreconciled", {
                _: "Sin cobro registrado",
              })}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {money(fila.amount)}
      </TableCell>
    </TableRow>
  );
}
