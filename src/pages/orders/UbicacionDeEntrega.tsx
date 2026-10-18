import { Check, Copy, ExternalLink, MapPin, MapPinOff } from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type PuntoDeEntrega,
  enlaceDeNavegacion,
  formatearPunto,
} from "./punto-de-entrega";

const MapaDeEntrega = lazy(() => import("./MapaDeEntrega"));

/**
 * El punto de entrega en el detalle del pedido (MxH-0073).
 *
 * **El número manda y el mapa acompaña.** Quien reparte abre esto desde el
 * teléfono, con datos móviles, y lo que de verdad usa son las coordenadas:
 * para copiarlas o para pasarlas a su aplicación de navegación. Así que el
 * texto está siempre y el mapa va detrás de un botón.
 *
 * Hay una segunda razón para que el mapa sea un gesto explícito: pintar uno
 * por fila en un listado violaría la política de uso de las teselas de
 * OpenStreetMap, que es gratis pero no ilimitada.
 */

export function UbicacionDeEntrega({
  punto,
  etiqueta,
}: {
  punto: PuntoDeEntrega | null;
  /** La dirección escrita, para el globo del marcador. */
  etiqueta?: string;
}) {
  const translate = useTranslate();
  const [verMapa, setVerMapa] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Sin punto se dice con claridad, en vez de enseñar un mapa vacío: la
  // ubicación es opcional a propósito (D-011) y su ausencia es lo normal, no
  // un fallo.
  if (!punto) {
    return (
      <div className="mt-3 flex items-start gap-2 border-border border-t pt-3 text-sm text-muted-foreground">
        <MapPinOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          {translate("orders.location.empty", {
            _: "Sin ubicación en el mapa. La dirección escrita es la única referencia.",
          })}
        </p>
      </div>
    );
  }

  const coordenadas = formatearPunto(punto);

  const copiar = () => {
    navigator.clipboard
      ?.writeText(coordenadas)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      // Sin portapapeles —contexto no seguro, o permiso denegado— el texto
      // sigue en pantalla para seleccionarlo a mano. No hay nada que avisar.
      .catch(() => undefined);
  };

  return (
    <div className="mt-3 space-y-2 border-border border-t pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="font-medium text-foreground text-sm tabular-nums">
          {coordenadas}
        </span>

        {/**
         * La procedencia con colores distintos, no solo con palabras: la del
         * GPS es exacta y la marcada a mano puede estar a dos cuadras. Quien
         * sale a repartir necesita saber de un vistazo cuánto fiarse.
         */}
        <Badge
          variant={punto.source === "device" ? "default" : "secondary"}
          className="font-normal"
        >
          {punto.source === "device"
            ? translate("orders.location.source.device", {
                _: "Del dispositivo",
              })
            : translate("orders.location.source.manual", {
                _: "Marcada a mano",
              })}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setVerMapa((abierto) => !abierto)}
        >
          {verMapa
            ? translate("orders.location.hideMap", { _: "Ocultar el mapa" })
            : translate("orders.location.showMap", { _: "Ver en el mapa" })}
        </Button>

        <Button type="button" size="sm" variant="outline" asChild>
          <a
            href={enlaceDeNavegacion(punto)}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            {translate("orders.location.navigate", {
              _: "Abrir en navegación",
            })}
          </a>
        </Button>

        <Button type="button" size="sm" variant="ghost" onClick={copiar}>
          {copiado ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copiado
            ? translate("orders.location.copied", { _: "Copiado" })
            : translate("orders.location.copy", { _: "Copiar" })}
        </Button>
      </div>

      {verMapa && (
        <Suspense
          fallback={
            <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
          }
        >
          <MapaDeEntrega
            latitude={punto.latitude}
            longitude={punto.longitude}
            etiqueta={etiqueta}
          />
        </Suspense>
      )}
    </div>
  );
}
