import { useCanAccess } from "ra-core";
import type { ReactNode } from "react";
import Loading from "@/pages/Loading";
import AccessDenied from "@/pages/AccessDenied";

/**
 * Route guard for the CustomRoutes (which ra-core does not gate automatically).
 * Renders the access-denied page when the user lacks the permission, mirroring
 * what <Admin accessDenied> does for Resource routes.
 */
export function RequireAccess({
  resource,
  action = "list",
  children,
}: {
  resource: string;
  action?: string;
  children: ReactNode;
}) {
  const { canAccess, isPending } = useCanAccess({ resource, action });
  if (isPending) return <Loading />;
  return canAccess ? <>{children}</> : <AccessDenied />;
}
