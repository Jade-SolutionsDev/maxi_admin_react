/** Palabras reales de un campo de texto, sin espacios de más. */
const words = (value: string) => value.trim().split(/\s+/).filter(Boolean);

/**
 * Two letters to stand in for a person when there is no picture.
 *
 * Falls through the identifiers a person may or may not have: a name and a
 * surname give one letter each, a name on its own gives the initials of its
 * two words (or its first two letters when it is a single word), and the email
 * is the last resort. Returns "" when there is nothing to work with — the
 * caller decides what to draw then, because an empty circle is still better
 * than a broken image.
 */
export function personInitials({
  firstName,
  lastName,
  email,
}: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const first = words(firstName ?? "");
  const last = words(lastName ?? "");

  if (first.length > 0 && last.length > 0) {
    return (first[0].charAt(0) + last[0].charAt(0)).toUpperCase();
  }

  // Only one of the two fields is filled. "María José" still yields "MJ";
  // a single word falls back to its first two letters.
  const name = first.length > 0 ? first : last;
  if (name.length > 1) {
    return (name[0].charAt(0) + name[1].charAt(0)).toUpperCase();
  }
  if (name.length === 1) {
    return name[0].slice(0, 2).toUpperCase();
  }

  // The local part, so a one-letter address does not render as "A@".
  return (email ?? "").trim().split("@")[0].slice(0, 2).toUpperCase();
}
