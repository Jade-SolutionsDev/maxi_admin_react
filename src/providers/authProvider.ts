import { AuthProvider } from "ra-core";
import { getApiToken, clerkSignOut } from "../lib/clerk/clerkRefs";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

/** Backoffice system roles (mirrors the backend `Role` enum). */
export type Role = "SUPER_ADMIN" | "ADMIN" | "GROCER" | "KARDIST";

/** Roles allowed to manage users and other privileged backoffice areas. */
export const MANAGER_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export interface Identity {
  id: string;
  fullName: string;
  avatar?: string;
  email?: string;
  role: Role;
}

/** Effective permissions map: `{ module: [action, ...] }` from GET /auth/me. */
type PermissionMap = Record<string, string[]>;

let identityCache: Identity | null = null;
let permissionsCache: PermissionMap = {};

// Modules governed by managed permissions; other resources gate by role only.
const MANAGED_MODULES = [
  "products",
  "categories",
  "departments",
  "stock-locations",
];

// react-admin actions -> backend permission actions.
const ACTION_MAP: Record<string, string> = {
  list: "list",
  show: "read",
  read: "read",
  create: "create",
  edit: "update",
  update: "update",
  delete: "delete",
};

async function api(path: string, init: RequestInit = {}) {
  const token = await getApiToken();
  const headers = new Headers(init.headers ?? {});

  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const err = new Error(response.statusText) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  const { data } = await response.json();

  return data;
}

async function loadIdentity(): Promise<Identity> {
  if (identityCache) {
    return identityCache;
  }

  const user = (await api("/auth/me")) as {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    email: string | null;
    role: Role;
    permissions?: PermissionMap;
  };

  identityCache = {
    id: user.id,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.id,
    avatar: user.avatarUrl ?? undefined,
    email: user.email ?? undefined,
    role: user.role,
  };
  permissionsCache = user.permissions ?? {};

  return identityCache;
}

export const authProvider: AuthProvider = {
  // Clerk provides its own sign-in UI; this method is intentionally a no-op.
  async login() {
    return Promise.resolve();
  },

  async logout() {
    identityCache = null;
    permissionsCache = {};
    await clerkSignOut();
    return Promise.resolve();
  },

  async checkAuth() {
    const token = await getApiToken();
    if (!token) {
      return Promise.reject(new Error("Not authenticated"));
    }
    return Promise.resolve();
  },

  async checkError(error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401
    ) {
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: loadIdentity,

  // The permission-by-module RBAC is parked on the backend; authorization is
  // now role-based. We expose the current role so `usePermissions()` keeps
  // resolving, but gating is done through `canAccess` below.
  async getPermissions() {
    const identity = await loadIdentity();
    return [identity.role];
  },

  async canAccess({ resource, action }) {
    const identity = identityCache ?? (await loadIdentity());
    const isManager = MANAGER_ROLES.includes(identity.role);

    // System admins bypass every check (mirrors the backend).
    if (isManager) return true;

    switch (resource) {
      // Admin-only surfaces.
      // Admin-only surfaces; CMS content is an admin task too (managers
      // already returned true above).
      case "users":
      case "clients":
      case "roles":
      case "settings":
      case "cms-pages":
      case "cms-banners":
      case "cms-services":
      case "cms-staff":
      case "cms-settings":
      case "payment-methods":
      case "nomenclators":
      case "contact-motives":
      case "delivery-options":
      case "fulfillment-settings":
        return false;
      // Cross-storage inventory overview: managers (handled above) + kardist.
      // Grocers use the per-storage Almacenes tab instead.
      case "inventory":
        return identity.role === "KARDIST";
      // Support inbox + reply drafts: governed by the 'contact' permission
      // module so non-admin staff can be granted access via the Roles UI.
      case "contact-messages":
      case "contact-templates": {
        const backendAction = ACTION_MAP[action ?? ""] ?? action ?? "";
        return permissionsCache.contact?.includes(backendAction) ?? false;
      }
      default:
        // Catalog + operational modules are governed by the effective
        // permission map (products, categories, departments, stock-locations).
        if (MANAGED_MODULES.includes(resource)) {
          const backendAction = ACTION_MAP[action ?? ""] ?? action ?? "";
          return permissionsCache[resource]?.includes(backendAction) ?? false;
        }
        // Anything else stays readable by any authenticated backoffice user.
        return true;
    }
  },
};
