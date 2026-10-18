/** Extracts the backend error message from an HttpError-like value, or falls back. */
export function backendMessage(error: unknown, fallback: string): string {
  const e = error as {
    body?: { error?: { message?: string | string[] } };
    message?: string;
  };
  const msg = e?.body?.error?.message;
  // Validation errors arrive as an array of strings; join them so the toast
  // isn't blank.
  if (Array.isArray(msg)) return msg.join(". ") || fallback;
  return msg ?? e?.message ?? fallback;
}

/**
 * Si el error es el 409 de «ese correo pertenece a un usuario borrado»
 * (`UsuarioBorradoException` en la API, MxH-0122), el id del usuario a
 * restaurar; si no, `null`. El `code` del sobre es el nombre de la clase y
 * el id viaja en `details`, como el `available` del carrito.
 */
export function usuarioBorradoARestaurar(error: unknown): string | null {
  const e = error as {
    body?: { error?: { code?: string; details?: { userId?: string }[] } };
  };
  if (e?.body?.error?.code !== "UsuarioBorradoException") return null;
  return e.body.error.details?.find((d) => d.userId)?.userId ?? null;
}
