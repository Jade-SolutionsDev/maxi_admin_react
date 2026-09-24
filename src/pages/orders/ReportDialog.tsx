import { FileDown, Loader2 } from "lucide-react";
import { useGetList, useListContext, useNotify, useTranslate } from "ra-core";
import { useDataProvider } from "ra-core";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "./orderStatus";
import { SIN_METODO } from "./PaymentMethodFilter";

/** Lo que se le manda al servidor. Vacío = sin filtrar por eso. */
export interface CriteriosDelReporte {
  from: string;
  to: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  fulfillmentType: string;
  pickupLocationId: string;
  minTotal: string;
  maxTotal: string;
  groupBy: string;
}

const VACIO: CriteriosDelReporte = {
  from: "",
  to: "",
  status: "",
  paymentStatus: "",
  paymentMethod: "",
  fulfillmentType: "",
  pickupLocationId: "",
  minTotal: "",
  maxTotal: "",
  groupBy: "",
};

interface MetodoDePago {
  id: string;
  code: string;
  label: string;
}

interface Almacen {
  id: string;
  name: string;
}

const claseSelect =
  "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Fuera del diálogo a propósito: definido dentro, React lo trata como un
 * componente nuevo en cada render, desmonta el campo y **el cursor se sale del
 * input a cada tecla**. Lo caza el linter y se nota al escribir un importe.
 */
const Campo = ({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-xs font-medium text-muted-foreground">
      {etiqueta}
    </Label>
    {children}
  </div>
);

/**
 * El formulario del reporte de pedidos (MxH-0120).
 *
 * Arranca con lo que tenga puesto la tabla: si acabas de filtrar por
 * «Cancelado» en pantalla, el formulario se abre con eso y lo puedes cambiar.
 * No obliga a repetir trabajo y no sorprende — lo que ves es el punto de
 * partida, no un formulario en blanco que ignora dónde estabas.
 */
export const ReportDialog = ({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
}) => {
  const { filterValues } = useListContext();
  const dataProvider = useDataProvider() as ExtendedDataProvider;
  const notify = useNotify();
  const translate = useTranslate();
  const t = (clave: string, porDefecto: string) =>
    translate(clave, { _: porDefecto });

  const [criterios, setCriterios] = useState<CriteriosDelReporte>({
    ...VACIO,
    ...Object.fromEntries(
      Object.entries(filterValues ?? {}).map(([k, v]) => [k, String(v ?? "")]),
    ),
  });
  const [generando, setGenerando] = useState(false);

  const { data: metodos } = useGetList<MetodoDePago>("payment-methods", {
    pagination: { page: 1, perPage: 50 },
    sort: { field: "sortOrder", order: "ASC" },
  });
  const { data: almacenes } = useGetList<Almacen>("stock-locations", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "name", order: "ASC" },
  });

  const cambiar = (campo: keyof CriteriosDelReporte) => (valor: string) =>
    setCriterios((previos) => ({ ...previos, [campo]: valor }));

  const generar = async () => {
    setGenerando(true);
    try {
      const { blob, filename } =
        await dataProvider.downloadOrdersReport(criterios);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = filename;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      onCerrar();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : t("orders.report.error", "No se pudo generar el reporte"),
        { type: "error" },
      );
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("orders.report.title", "Reporte de pedidos")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "orders.report.description",
              "Elige qué pedidos entran. Los campos que dejes vacíos no filtran nada.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Campo etiqueta={t("orders.report.from", "Fecha de inicio")}>
            <Input
              type="date"
              value={criterios.from}
              onChange={(e) => cambiar("from")(e.target.value)}
            />
          </Campo>
          <Campo etiqueta={t("orders.report.to", "Fecha de fin")}>
            <Input
              type="date"
              value={criterios.to}
              onChange={(e) => cambiar("to")(e.target.value)}
            />
          </Campo>

          <Campo etiqueta={t("orders.report.status", "Estado del pedido")}>
            <select
              className={claseSelect}
              value={criterios.status}
              onChange={(e) => cambiar("status")(e.target.value)}
            >
              <option value="">{t("orders.report.all", "Todos")}</option>
              {ORDER_STATUSES.map((estado) => (
                <option key={estado} value={estado}>
                  {translate(`orders.status.${estado}`, { _: estado })}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta={t("orders.report.paymentStatus", "Estado de pago")}>
            <select
              className={claseSelect}
              value={criterios.paymentStatus}
              onChange={(e) => cambiar("paymentStatus")(e.target.value)}
            >
              <option value="">{t("orders.report.all", "Todos")}</option>
              {PAYMENT_STATUSES.map((estado) => (
                <option key={estado} value={estado}>
                  {translate(`orders.paymentStatus.${estado}`, { _: estado })}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta={t("orders.report.paymentMethod", "Método de pago")}>
            <select
              className={claseSelect}
              value={criterios.paymentMethod}
              onChange={(e) => cambiar("paymentMethod")(e.target.value)}
            >
              <option value="">{t("orders.report.all", "Todos")}</option>
              {(metodos ?? []).map((metodo) => (
                <option key={metodo.id} value={metodo.code}>
                  {metodo.label}
                </option>
              ))}
              <option value={SIN_METODO}>
                {t("orders.filters.withoutPaymentMethod", "Sin intento de pago")}
              </option>
            </select>
          </Campo>

          <Campo etiqueta={t("orders.report.fulfillment", "Tipo de entrega")}>
            <select
              className={claseSelect}
              value={criterios.fulfillmentType}
              onChange={(e) => cambiar("fulfillmentType")(e.target.value)}
            >
              <option value="">{t("orders.report.all", "Todos")}</option>
              <option value="delivery">
                {t("orders.report.delivery", "A domicilio")}
              </option>
              <option value="pickup">
                {t("orders.report.pickup", "Recogida en tienda")}
              </option>
            </select>
          </Campo>

          <Campo
            etiqueta={t("orders.report.pickupLocation", "Punto de recogida")}
          >
            <select
              className={claseSelect}
              value={criterios.pickupLocationId}
              onChange={(e) => cambiar("pickupLocationId")(e.target.value)}
            >
              <option value="">{t("orders.report.all", "Todos")}</option>
              {(almacenes ?? []).map((almacen) => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.name}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta={t("orders.report.groupBy", "Resumen por")}>
            <select
              className={claseSelect}
              value={criterios.groupBy}
              onChange={(e) => cambiar("groupBy")(e.target.value)}
            >
              <option value="">{t("orders.report.noGroup", "Sin resumen")}</option>
              <option value="day">{t("orders.report.day", "Días")}</option>
              <option value="week">{t("orders.report.week", "Semanas")}</option>
              <option value="month">{t("orders.report.month", "Meses")}</option>
            </select>
          </Campo>

          <Campo etiqueta={t("orders.report.minTotal", "Importe desde")}>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={criterios.minTotal}
              onChange={(e) => cambiar("minTotal")(e.target.value)}
            />
          </Campo>
          <Campo etiqueta={t("orders.report.maxTotal", "Importe hasta")}>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={criterios.maxTotal}
              onChange={(e) => cambiar("maxTotal")(e.target.value)}
            />
          </Campo>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCriterios(VACIO)}
            disabled={generando}
          >
            {t("orders.report.reset", "Limpiar")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCerrar}
            disabled={generando}
          >
            {t("ra.action.cancel", "Cancelar")}
          </Button>
          <Button type="button" onClick={generar} disabled={generando}>
            {generando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FileDown className="mr-2 h-4 w-4" aria-hidden />
            )}
            {generando
              ? t("orders.report.loading", "Generando…")
              : t("orders.report.submit", "Generar PDF")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
