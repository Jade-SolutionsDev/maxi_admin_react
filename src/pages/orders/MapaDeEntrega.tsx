import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useRef } from "react";

/**
 * El punto de entrega en un mapa, **solo para mirar**: ni marcador arrastrable
 * ni clics. Aquí nadie elige nada, el punto lo marcó el cliente al comprar.
 *
 * Es el único fichero del panel que importa Leaflet, y se carga con
 * `React.lazy` desde donde se usa: así el paquete no entra en el bundle de
 * quien abre un pedido y no despliega el mapa. Importa (MxH-0073): quien
 * reparte abre esto desde el teléfono, con datos móviles.
 */

const ZOOM = 17;

/**
 * Un pin dibujado, no una imagen. El icono por omisión de Leaflet se sirve por
 * rutas relativas al CSS que el empaquetador reescribe, y acaba invisible.
 */
const pin = L.divIcon({
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  html: `<span style="display:block;width:28px;height:28px">
    <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
      <path d="M14 1c-5 0-9 4-9 9 0 6.6 9 17 9 17s9-10.4 9-17c0-5-4-9-9-9z"
            fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
      <circle cx="14" cy="10" r="3.2" fill="#ffffff"/>
    </svg>
  </span>`,
});

export default function MapaDeEntrega({
  latitude,
  longitude,
  etiqueta,
}: {
  latitude: number;
  longitude: number;
  /** Lo que se lee al llegar al marcador: la calle, para no abrir un pin mudo. */
  etiqueta?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!contenedor.current || mapa.current) return;

    const instancia = L.map(contenedor.current, {
      center: [latitude, longitude],
      zoom: ZOOM,
      // La rueda dentro de una página larga secuestra el desplazamiento; los
      // botones + y − siguen ahí, y en el teléfono se pellizca.
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      // Obligatoria por licencia, no decorativa.
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(instancia);

    const marcador = L.marker([latitude, longitude], { icon: pin }).addTo(
      instancia,
    );
    if (etiqueta) marcador.bindPopup(etiqueta);

    mapa.current = instancia;

    /**
     * Leaflet mide el contenedor al crearse y calcula contra ese tamaño. Este
     * mapa nace dentro de un bloque que se despliega, así que el tamaño cambia
     * justo después: sin reajustar, las teselas no cubren.
     */
    const observador = new ResizeObserver(() => instancia.invalidateSize());
    observador.observe(contenedor.current);

    return () => {
      observador.disconnect();
      instancia.remove();
      mapa.current = null;
    };
  }, [latitude, longitude, etiqueta]);

  return (
    <div
      ref={contenedor}
      className="h-64 w-full overflow-hidden rounded-lg border border-border"
      role="img"
      aria-label={
        etiqueta
          ? `Mapa con el punto de entrega: ${etiqueta}`
          : "Mapa con el punto de entrega"
      }
    />
  );
}
