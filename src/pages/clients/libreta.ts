/**
 * El título de una dirección de la libreta (MxH-0178).
 *
 * Vive aparte del componente porque la regla de `react-refresh` no deja
 * exportar funciones junto a componentes, y porque esto es lo único de la
 * pestaña con una decisión dentro.
 *
 * **El problema que resuelve se vio en staging, no en el código:** casi ninguna
 * dirección tiene alias —la tienda no lo pide al pagar, que es donde nace la
 * primera dirección de casi todo cliente—, así que el título caía en la calle y
 * la calle volvía a salir en la línea de debajo, idéntica.
 */
export interface TituloDeDireccion {
  titulo: string;
  /** Si la calle va además como primera línea, o el título ya la dice. */
  calleAparte: boolean;
}

export const tituloDeLaDireccion = (
  label: string | null,
  street: string,
): TituloDeDireccion => {
  const alias = label?.trim() ?? "";
  const calle = street?.trim() ?? "";

  // Un alias que repite la calle vale lo mismo que no tener alias: el cliente
  // escribió dos veces lo mismo, y enseñarlo dos veces es cosa nuestra.
  const esAlias = alias !== "" && alias.toLowerCase() !== calle.toLowerCase();

  return esAlias
    ? { titulo: alias, calleAparte: true }
    : { titulo: calle, calleAparte: false };
};
