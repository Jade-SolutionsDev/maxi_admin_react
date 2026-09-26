import { FileDown } from "lucide-react";
import { useTranslate } from "ra-core";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ReportDialog } from "./ReportDialog";

/**
 * Abre el formulario del reporte de pedidos (MxH-0120).
 *
 * El botón no genera nada por su cuenta: la primera versión exportaba lo que
 * hubiera filtrado en la tabla, y Jade pidió poder elegir los criterios —sobre
 * todo el rango de fechas y el resumen por periodos— sin tener que dejar la
 * pantalla filtrada de una manera concreta.
 */
export const ExportOrdersButton = () => {
  const translate = useTranslate();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setAbierto(true)}>
        <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
        {translate("orders.report.open", { _: "Reporte" })}
      </Button>
      {abierto && (
        <ReportDialog abierto={abierto} onCerrar={() => setAbierto(false)} />
      )}
    </>
  );
};
