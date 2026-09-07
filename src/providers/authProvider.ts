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

/**
 * Drop the cached identity + permission map so the next canAccess/getIdentity
 * refetches /auth/me. Called by the dataProvider after role or user-role
 * writes so the acting admin sees their changes without a full reload (other
 * users pick them up on their next page load).
 */
export function resetIdentityCache(): void {
  identityCache = null;
  permissionsCache = {};
}

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

/**
 * Frontend resource → backend permission module (+ per-resource action
 * overrides where the mapping isn't 1:1). Mirrors the backend MODULE_ACTIONS
 * catalog — a resource with no rule here is DENIED for non-admins, exactly
 * like an undecorated backend route. When you add a module, register it in
 * both places (see the workspace CLAUDE.md).
 */
const RESOURCE_RULES: Record<
  string,
  { module: string; actions?: Record<string, string> }
> = {
  products: { module: "products" },
  categories: { module: "categories" },
  departments: { module: "departments" },
  "stock-locations": { module: "stock-locations" },
  nomenclators: { module: "nomenclators" },
  "contact-motives": { module: "nomenclators" },
  "delivery-options": { module: "delivery-options" },
  clients: { module: "clients" },
  "cms-pages": { module: "cms-pages" },
  "cms-banners": { module: "cms-banners" },
  "cms-services": { module: "cms-services" },
  "cms-staff": { module: "cms-staff" },
  "cms-settings": {
    module: "cms-settings",
    actions: { list: "read", show: "read", edit: "update" },
  },
  "fulfillment-settings": {
    module: "fulfillment-settings",
    actions: { list: "read", show: "read", edit: "update" },
  },
  "payment-methods": { module: "payment-methods" },
  // Inbox + reply templates share the backend `contact` module.
  "contact-messages": { module: "contact" },
  "contact-templates": { module: "contact" },
  orders: {
    module: "orders",
    actions: { edit: "update-status", update: "update-status" },
  },
  // The frontend "inventory" list IS the backend /inventory/aggregate view;
  // the per-storage rows live under "storage-inventory".
  inventory: { module: "inventory", actions: { list: "aggregate" } },
  "storage-inventory": { module: "inventory" },
  "dashboard-stats": {
    module: "dashboard",
    actions: { list: "view", read: "view", show: "view" },
  },
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

  // Gating happens through `canAccess` below (permission-map driven); this only
  // keeps `usePermissions()` resolving with the system role.
  async getPermissions() {
    const identity = await loadIdentity();
    return [identity.role];
  },

  /**
   * DEFAULT-DENY mirror of the backend PermissionGuard: managers bypass;
   * `users`/`roles` are hard admin-only; every other resource resolves through
   * RESOURCE_RULES + the /auth/me permission map; an unknown resource is
   * denied — a new module stays invisible until it is registered and granted.
   */
  async canAccess({ resource, action }) {
    const identity = identityCache ?? (await loadIdentity());

    // System admins bypass every check (mirrors the backend).
    if (MANAGER_ROLES.includes(identity.role)) return true;

    // Hard admin-only surfaces — never grantable.
    if (
      [
        "users",
        "roles",
        "cms-faq-categories",
        "cms-faq-questions",
      ].includes(resource)
    ) {
      return false;
    }

    const rule = RESOURCE_RULES[resource];
    if (!rule) return false;

    const raw = action ?? "list";
    const backendAction = rule.actions?.[raw] ?? ACTION_MAP[raw] ?? raw;
    return permissionsCache[rule.module]?.includes(backendAction) ?? false;
  },
};
