import type { AuthProvider } from "react-admin";
import { getApiToken, clerkSignOut } from "./clerkRefs";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

type PermissionsMap = Record<string, string[]>;

interface Identity {
  id: string;
  fullName: string;
  avatar?: string;
  userType: string;
}

let identityCache: Identity | null = null;
let permissionsCache: PermissionsMap | null = null;

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

function mapAction(action: string): string {
  const mapping: Record<string, string> = {
    list: "list",
    create: "create",
    show: "read",
    edit: "update",
    delete: "delete",
  };
  return mapping[action] ?? action;
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
    userType: string;
  };

  identityCache = {
    id: user.id,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.id,
    avatar: user.avatarUrl ?? undefined,
    userType: user.userType,
  };

  return identityCache;
}

async function loadPermissions(): Promise<PermissionsMap> {
  if (permissionsCache) {
    return permissionsCache;
  }

  const user = await loadIdentity();
  const payload = (await api(`/permissions/users/${user.id}`)) as {
    permissions: PermissionsMap;
  };

  permissionsCache = payload.permissions ?? {};
  return permissionsCache;
}

export const authProvider: AuthProvider = {
  // Clerk provides its own sign-in UI; this method is intentionally a no-op.
  async login() {
    return Promise.resolve();
  },

  async logout() {
    identityCache = null;
    permissionsCache = null;
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

  getPermissions: loadPermissions,

  async canAccess({ resource, action }) {
    if (!permissionsCache) {
      await loadPermissions();
    }

    const backendAction = mapAction(action ?? "");
    return permissionsCache?.[resource ?? ""]?.includes(backendAction) ?? false;
  },
};
