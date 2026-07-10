/** Extracts the backend error message from an HttpError-like value, or falls back. */
export function backendMessage(error: unknown, fallback: string): string {
  const e = error as { body?: { error?: { message?: string } }; message?: string };
  return e?.body?.error?.message ?? e?.message ?? fallback;
}
