import { useState } from "react";
import { useDataProvider, useListContext, useNotify, useTranslate } from "ra-core";
import { FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ExtendedDataProvider } from "@/providers/dataProvider";

/**
 * Saca en PDF los pedidos que estén filtrados en ese momento (MxH-0120).
 *
 * Lee los filtros del propio listado en vez de tener los suyos: lo que se ve
 * en pantalla es lo que sale en el papel, y no hay dos sitios donde ajustar lo
 * mismo. El servidor recibe esos filtros tal cual y aplica la misma consulta
 * que la tabla.
 */
export const ExportOrdersButton = () => {
  const { filterValues, total } = useListContext();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const notify = useNotify();
  const translate = useTranslate();
  const [generando, setGenerando] = useState(false);

  const exportar = async () => {
    setGenerando(true);
    try {
      const { blob, filename } =
        await dataProvider.downloadOrdersReport(filterValues);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = filename;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : translate("orders.actions.report_error", {
              _: "No se pudo generar el reporte",
            }),
        { type: "error" },
      );
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportar}
      // Con cero resultados el PDF saldría con una sola línea diciendo que no
      // hay nada: mejor no dejar pulsar y ahorrarse el viaje.
      disabled={generando || total === 0}
    >
      {generando ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {generando
        ? translate("orders.actions.report_loading", { _: "Generando…" })
        : translate("orders.actions.report", { _: "Exportar a PDF" })}
    </Button>
  );
};
