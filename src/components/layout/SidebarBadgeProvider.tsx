import { useCallback, useMemo, useState } from "react";
import {
  normalizeBadge,
  SidebarBadgeContext,
  type SidebarBadge,
} from "./sidebarBadges";

/** In-memory store for sidebar notification badges. See sidebarBadges.ts. */
export function SidebarBadgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [badges, setBadges] = useState<Record<string, SidebarBadge>>({});

  const setBadge = useCallback((key: string, value: unknown) => {
    const next = normalizeBadge(value);
    setBadges((prev) => {
      if (next === null) {
        if (!(key in prev)) return prev; // nothing to clear
        const rest = { ...prev };
        delete rest[key];
        return rest;
      }
      if (prev[key] === next) return prev; // no-op, keep reference stable
      return { ...prev, [key]: next };
    });
  }, []);

  const value = useMemo(() => ({ badges, setBadge }), [badges, setBadge]);
  return (
    <SidebarBadgeContext.Provider value={value}>
      {children}
    </SidebarBadgeContext.Provider>
  );
}
