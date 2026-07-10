/** Friendly message from a Clerk error, preferring its structured field message. */
export function clerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "errors" in err) {
    const arr = (err as { errors?: Array<{ message?: string; longMessage?: string }> })
      .errors;
    const first = Array.isArray(arr) ? arr[0] : undefined;
    if (first) return first.longMessage || first.message || fallback;
  }
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    // Never surface raw ClerkJS internals (network dumps with URLs/stack text).
    if (typeof m === "string" && m.length > 0 && !/clerkjs|clerk\.accounts\.dev/i.test(m)) {
      return m;
    }
  }
  return fallback;
}
