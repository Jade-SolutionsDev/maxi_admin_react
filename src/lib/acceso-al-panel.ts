/**
 * Por qué una cuenta de Clerk válida no pudo entrar al panel, y qué se le dice.
 *
 * MxH-0158: quien no estaba dado de alta escribía su correo y su contraseña,
 * Clerk lo autenticaba —la cuenta existe de verdad— y la API lo rechazaba. El
 * panel lo devolvía a la pantalla de acceso **sin una palabra**, así que
 * parecía que la contraseña estaba mal y se volvía a intentar.
 *
 * El motivo viaja en `error.code` de la API (`NOT_REGISTERED`,
 * `ACCOUNT_INACTIVE`) y se guarda aquí mientras se cierra la sesión y se vuelve
 * al acceso, que es el único sitio donde la persona está mirando.
 */
export type MotivoSinAcceso = "NOT_REGISTERED" | "ACCOUNT_INACTIVE";

const CLAVE = "maxi.acceso-denegado";

export const MENSAJES: Record<MotivoSinAcceso, string> = {
  NOT_REGISTERED:
    "Tu cuenta existe, pero todavía no tiene acceso a la administración. Pide a un administrador que te dé de alta.",
  ACCOUNT_INACTIVE:
    "Tu cuenta está desactivada y no puede entrar a la administración. Habla con un administrador.",
};

export function esMotivoSinAcceso(code: unknown): code is MotivoSinAcceso {
  return code === "NOT_REGISTERED" || code === "ACCOUNT_INACTIVE";
}

/**
 * `sessionStorage` y no un módulo en memoria: entre el rechazo y la pantalla de
 * acceso puede haber una recarga entera, y el aviso tiene que sobrevivirla. Si
 * el navegador no lo deja (modo privado, almacenamiento bloqueado), se pierde
 * el aviso pero no se rompe el acceso.
 */
export function guardarMotivo(motivo: MotivoSinAcceso): void {
  try {
    sessionStorage.setItem(CLAVE, motivo);
  } catch {
    // Sin dónde guardarlo: se queda sin aviso, que es lo de antes.
  }
}

/**
 * Lo lee **sin borrarlo**, y esto es lo importante: cerrar la sesión de Clerk
 * recarga la página entera. Medido en staging, el motivo se guardaba a los
 * 598 ms y desaparecía 200 ms después — la pantalla de acceso lo leía, lo
 * consumía, y la recarga que venía detrás se llevaba por delante ese render.
 * El aviso se escribía y no lo veía nadie.
 *
 * Se olvida cuando la persona vuelve a intentar entrar, que es cuando deja de
 * tener sentido enseñarlo.
 */
export function leerMensajeSinAcceso(): string | null {
  try {
    const motivo = sessionStorage.getItem(CLAVE);
    return esMotivoSinAcceso(motivo) ? MENSAJES[motivo] : null;
  } catch {
    return null;
  }
}

export function olvidarMensajeSinAcceso(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Si no se puede borrar tampoco se pudo guardar: no hay nada que olvidar.
  }
}
