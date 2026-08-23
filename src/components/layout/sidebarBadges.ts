import { createContext, useContext } from "react";

/**
 * Generic notification badges for sidebar items.
 *
 * A badge is intentionally limited to a small counter or one of two words, so
 * the feature nudges the admin toward pending actions without turning the
 * sidebar into a dashboard:
 *   - a positive number (a count of things waiting)
 *   - "new"    — something fresh to look at
 *   - "urgent" — something that needs attention now
 *
 * Values are keyed by a nav item's `labelKey`. Any code under
 * <SidebarBadgeProvider> can push a value via useSetSidebarBadge(); the sidebar
 * reads it with useSidebarBadge(). The store is in-memory (per session) — live
 * counts, not persisted preferences.
 */

export type SidebarBadge = number | "new" | "urgent";

/** The guard that keeps the feature from being over-exploited: only a positive
 *  integer or the words "new"/"urgent" survive; everything else clears the badge. */
export function normalizeBadge(value: unknown): SidebarBadge | null {
  if (value === "new" || value === "urgent") return value;
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return null;
}

export interface BadgeContextValue {
  badges: Record<string, SidebarBadge>;
  setBadge: (key: string, value: unknown) => void;
}

export const SidebarBadgeContext = createContext<BadgeContextValue | null>(null);

/** Read the current badge for a nav item (null when none). */
export function useSidebarBadge(key: string): SidebarBadge | null {
  return useContext(SidebarBadgeContext)?.badges[key] ?? null;
}

/** Imperative setter: setBadge(itemLabelKey, number | 'new' | 'urgent' | null). */
export function useSetSidebarBadge(): (key: string, value: unknown) => void {
  return useContext(SidebarBadgeContext)?.setBadge ?? (() => {});
}

if (import.meta.env.DEV) {
  // ponytail: self-check for the guard — the whole feature's constraint lives here.
  console.assert(
    normalizeBadge(0) === null && normalizeBadge(-1) === null,
    "badge: non-positive → null",
  );
  console.assert(
    normalizeBadge(5) === 5 && normalizeBadge(3.7) === 3,
    "badge: positive number floored",
  );
  console.assert(
    normalizeBadge("new") === "new" && normalizeBadge("urgent") === "urgent",
    "badge: words pass",
  );
  console.assert(
    normalizeBadge("nope") === null && normalizeBadge(null) === null,
    "badge: junk → null",
  );
}
