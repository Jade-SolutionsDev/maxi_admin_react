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
