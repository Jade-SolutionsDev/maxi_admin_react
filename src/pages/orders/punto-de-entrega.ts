/**
 * El punto de entrega que viaja en la foto del pedido (MxH-0071), leído de un
 * `jsonb` sin tipar.
 *
 * Vive aparte del componente por dos razones: la regla de `react-refresh` no
 * deja exportar funciones junto a componentes, y esto es lo único con lógica de
 * verdad de toda la tarjeta.
 */

export interface PuntoDeEntrega {
  latitude: number;
  longitude: number;
  source: "device" | "manual";
}

/**
 * Exige **las tres partes y del tipo correcto**.
 *
 * `deliveryAddress` es una columna `jsonb`: nada garantiza su forma, y la API
 * escribe las tres columnas juntas pero una fila tocada a mano podría tener
 * media. Sin esta comprobación, un `0` colado centraría el mapa en el golfo de
 * Guinea —la «isla» que no existe— en vez de avisar de que no hay ubicación,
 * que es justo lo que la tarjeta pide evitar.
 */
export const leerPunto = (valor: unknown): PuntoDeEntrega | null => {
  if (!valor || typeof valor !== "object") return null;

  const { latitude, longitude, source } = valor as Record<string, unknown>;

  if (typeof latitude !== "number" || !Number.isFinite(latitude)) return null;
  if (typeof longitude !== "number" || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  if (source !== "device" && source !== "manual") return null;

  return { latitude, longitude, source };
};

/** Seis decimales son unos 11 cm; más es fingir precisión. */
export const formatearPunto = ({ latitude, longitude }: PuntoDeEntrega) =>
  `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

/**
 * El enlace para navegar hasta el punto.
 *
 * Es una URL de Google Maps, y **no contradice** la decisión de usar Leaflet y
 * OpenStreetMap para el mapa: eso se decidió por la facturación de la API de
 * Google, y aquí no hay API, ni clave, ni cuenta. Es el enlace que abre la
 * aplicación nativa de navegación en Android y en iPhone, que es lo que usa
 * quien va conduciendo.
 */
export const enlaceDeNavegacion = ({ latitude, longitude }: PuntoDeEntrega) =>
  `https://www.google.com/maps?q=${latitude},${longitude}`;
