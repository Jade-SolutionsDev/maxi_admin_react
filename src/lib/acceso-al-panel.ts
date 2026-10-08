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
  leido = undefined;
  try {
    sessionStorage.setItem(CLAVE, motivo);
  } catch {
    // Sin dónde guardarlo: se queda sin aviso, que es lo de antes.
  }
}

/**
 * Lo ya leído en esta carga. React puede pedir el valor inicial de un estado
 * dos veces —StrictMode lo hace en desarrollo—, y sin esto la segunda llamada
 * se encontraría el aviso ya consumido y la pantalla saldría muda. Se olvida
 * en cuanto se guarda un motivo nuevo, para que un segundo intento fallido sí
 * enseñe el suyo.
 */
let leido: string | null | undefined;

/** Lo devuelve una sola vez: un aviso viejo no debe reaparecer al día siguiente. */
export function tomarMensajeSinAcceso(): string | null {
  if (leido !== undefined) return leido;
  try {
    const motivo = sessionStorage.getItem(CLAVE);
    if (!esMotivoSinAcceso(motivo)) {
      leido = null;
      return null;
    }
    sessionStorage.removeItem(CLAVE);
    leido = MENSAJES[motivo];
    return leido;
  } catch {
    leido = null;
    return null;
  }
}
