/**
 * ¿Se puede pintar esta dirección de imagen?
 *
 * La API ya exige `http` o `https` al guardarla, así que esto no arregla un
 * agujero abierto: es la segunda puerta. **El panel pinta lo que viene de la
 * base de datos**, y ahí puede haber filas guardadas antes de que la validación
 * fuera estricta, o escritas por una versión futura de la API con otras reglas.
 * Un `javascript:` en un `href` se ejecuta en la sesión de quien abra la ficha,
 * y quien la abre es un compañero con permisos.
 *
 * Se comprueba el esquema y no el host: el almacenamiento cambia por entorno
 * —Cloudinary en producción, MinIO en local—, y fijar el host aquí rompería el
 * panel el día que se cambie de proveedor.
 */
export const esImagenSegura = (url: string): boolean => {
  try {
    // La base importa: sin ella una dirección relativa reventaría en vez de
    // resolverse, y queremos juzgarla, no que lance.
    const { protocol } = new URL(url, window.location.origin);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};
