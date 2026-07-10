export const NETWORK_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';

/** True when the failure is a connectivity problem rather than a real auth error. */
function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  // A failed fetch (no response) surfaces as a TypeError in the browser.
  if (err instanceof TypeError) return true;
  if (err && typeof err === 'object') {
    const e = err as { code?: unknown; message?: unknown };
    if (e.code === 'network_error') return true;
    if (
      typeof e.message === 'string' &&
      /network error|failed to fetch|networkerror|load failed/i.test(e.message)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Human-readable message from a Clerk error. Connectivity failures get a friendly
 * message; otherwise we prefer Clerk's structured per-field message and never leak
 * raw ClerkJS internals (URLs, stack text) into the UI.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (isNetworkError(err)) return NETWORK_MESSAGE;

  if (err && typeof err === 'object' && 'errors' in err) {
    const arr = (err as { errors?: Array<{ message?: string; longMessage?: string }> })
      .errors;
    const first = Array.isArray(arr) ? arr[0] : undefined;
    if (first) return first.longMessage || first.message || fallback;
  }

  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      // Guard against raw ClerkJS dumps ("ClerkJS: Network error at https://…") leaking.
      if (/clerkjs|clerk\.accounts\.dev|__clerk/i.test(message)) return NETWORK_MESSAGE;
      return message;
    }
  }

  return fallback;
}
