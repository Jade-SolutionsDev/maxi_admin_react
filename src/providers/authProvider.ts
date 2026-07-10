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

let identityCache: Identity | null = null;

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
  };

  identityCache = {
    id: user.id,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.id,
    avatar: user.avatarUrl ?? undefined,
    email: user.email ?? undefined,
    role: user.role,
  };

  return identityCache;
}

export const authProvider: AuthProvider = {
  // Clerk provides its own sign-in UI; this method is intentionally a no-op.
  async login() {
    return Promise.resolve();
  },

  async logout() {
    identityCache = null;
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

    switch (resource) {
      case "users":
        return isManager;
      case "categories":
      case "departments":
        // Everyone reads the shared taxonomy; only managers write.
        return ["create", "edit", "delete"].includes(action ?? "")
          ? isManager
          : true;
      default:
        // Clients / products remain readable by any authenticated backoffice
        // user for now; tighten per-resource when needed.
        return true;
    }
  },
};
