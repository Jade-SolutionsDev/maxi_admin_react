export const NETWORK_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Known Clerk error codes → localized message keys, so Clerk's English strings
 *  (e.g. "You're already signed in.") never leak into the UI. */
const CLERK_CODE_KEYS: Record<string, string> = {
  session_exists: 'login.errors.already_signed_in',
  identifier_already_signed_in: 'login.errors.already_signed_in',
  form_password_incorrect: 'login.errors.invalid_credentials',
  form_identifier_not_found: 'login.errors.account_not_found',
  form_param_format_invalid: 'login.errors.invalid_credentials',
  form_code_incorrect: 'login.errors.code_invalid',
  verification_expired: 'login.errors.code_invalid',
  verification_failed: 'login.errors.code_invalid',
  too_many_requests: 'login.errors.too_many_requests',
};

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

function firstClerkError(
  err: unknown,
): { code?: string; message?: string; longMessage?: string } | undefined {
  if (err && typeof err === 'object' && 'errors' in err) {
    const arr = (
      err as { errors?: Array<{ code?: string; message?: string; longMessage?: string }> }
    ).errors;
    return Array.isArray(arr) ? arr[0] : undefined;
  }
  return undefined;
}

/**
 * Localized, human-readable message from a Clerk error. Connectivity failures
 * and known Clerk error codes map to translated messages; otherwise we prefer
 * Clerk's structured per-field message and never leak raw ClerkJS internals
 * (URLs, stack text) into the UI. Falls back to `fallbackKey`.
 */
export function getErrorMessage(
  err: unknown,
  translate: Translate,
  fallbackKey: string,
  fallbackArgs?: Record<string, unknown>,
): string {
  const fallback = translate(fallbackKey, fallbackArgs);

  if (isNetworkError(err)) {
    return translate('login.errors.network', { _: NETWORK_MESSAGE });
  }

  const clerk = firstClerkError(err);
  if (clerk?.code && CLERK_CODE_KEYS[clerk.code]) {
    return translate(CLERK_CODE_KEYS[clerk.code]);
  }
  if (clerk && (clerk.longMessage || clerk.message)) {
    return clerk.longMessage || clerk.message || fallback;
  }

  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      // Guard against raw ClerkJS dumps ("ClerkJS: Network error at https://…") leaking.
      if (/clerkjs|clerk\.accounts\.dev|__clerk/i.test(message)) {
        return translate('login.errors.network', { _: NETWORK_MESSAGE });
      }
      return message;
    }
  }

  return fallback;
}
