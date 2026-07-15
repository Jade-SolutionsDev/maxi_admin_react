import { DataProvider, fetchUtils } from 'ra-core';
import { getApiToken } from '../lib/clerk/clerkRefs';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface InviteUserPayload {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
}

export interface RoleSummary {
  id: string;
  name: string;
  description?: string | null;
}

export type InventoryOperationType = "IN" | "OUT" | "TRANSFER";

export interface CreateInventoryOperationPayload {
  locationId: string;
  type: InventoryOperationType;
  targetLocationId?: string;
  note?: string;
  items: { productId: string; quantity: number }[];
}

export interface ExtendedDataProvider extends DataProvider {
  inviteUser: (payload: InviteUserPayload) => Promise<{ data: unknown }>;
  revokeInvitation: (id: string) => Promise<{ data: unknown }>;
  resendInvitation: (id: string) => Promise<{ data: unknown }>;
  restoreUser: (id: string) => Promise<{ data: unknown }>;
  setUserPassword: (id: string, password: string) => Promise<void>;
  getUserRoles: (userId: string) => Promise<{ data: RoleSummary[] }>;
  setUserRoles: (userId: string, roleIds: string[]) => Promise<{ data: unknown }>;
  createInventoryOperation: (
    payload: CreateInventoryOperationPayload,
  ) => Promise<{ data: unknown }>;
}

// The managed-roles resource lives under the nested /permissions route.
const RESOURCE_PATHS: Record<string, string> = {
  roles: 'permissions/roles',
};

function resourcePath(resource: string): string {
  return RESOURCE_PATHS[resource] ?? resource;
}

async function httpClient(url: string, options: fetchUtils.Options = {}) {
  const token = await getApiToken();

  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }

  const headers = options.headers as Headers;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetchUtils.fetchJson(url, options);
}

function toQueryString(filter: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * The API wraps every response as `{ data }`; `fetchJson` returns that as
 * `json`, so the payload lives at `json.data`. List endpoints come in two
 * shapes: paginated (`{ data: { data: [...], meta } }`, e.g. GET /users) and
 * flat (`{ data: [...] }`, e.g. clients/products). Handle both.
 */
function unwrapList(json: unknown): { rows: unknown[]; total: number } {
  const body = json as { data?: unknown } | unknown[] | null;
  const payload = Array.isArray(body) ? body : (body?.data ?? body);

  if (Array.isArray(payload)) {
    return { rows: payload, total: payload.length };
  }

  const paginated = payload as {
    data?: unknown[];
    meta?: { total?: number };
  } | null;

  if (paginated && Array.isArray(paginated.data) && paginated.meta) {
    return {
      rows: paginated.data,
      total: paginated.meta.total ?? paginated.data.length,
    };
  }

  const rows = (paginated?.data as unknown[] | undefined) ?? [];
  return { rows, total: rows.length };
}

function unwrapOne(json: unknown): unknown {
  const body = json as { data?: unknown } | null;
  return body?.data ?? json;
}

export const dataProvider: DataProvider = {
  async getList(resource, params) {
    const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
    const { field, order } = params.sort ?? { field: 'id', order: 'ASC' };

    const query = toQueryString({
      ...params.filter,
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
    });

    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}${query}`);
    const { rows, total } = unwrapList(json);
    return { data: rows as never[], total };
  },

  async getOne(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}/${params.id}`);
    return { data: unwrapOne(json) as never };
  },

  async getMany(resource, params) {
    const query = toQueryString({ id: params.ids.join(',') });
    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}${query}`);
    const { rows } = unwrapList(json);
    return { data: rows as never[] };
  },

  async getManyReference(resource, params) {
    const query = toQueryString({
      ...params.filter,
      [params.target]: params.id,
    });
    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}${query}`);
    const { rows, total } = unwrapList(json);
    return { data: rows as never[], total };
  },

  async create(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: unwrapOne(json) as never };
  },

  async update(resource, params) {
    // A managed role stores its editable fields and its permission matrix on two
    // separate endpoints — PATCH the fields, then bulk-set the permissions.
    if (resource === 'roles') {
      const data = params.data as Record<string, unknown>;
      const { json } = await httpClient(
        `${API_URL}/permissions/roles/${params.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            isActive: data.isActive,
          }),
        },
      );
      let result = unwrapOne(json);
      if (Array.isArray(data.permissionIds)) {
        const { json: permJson } = await httpClient(
          `${API_URL}/permissions/roles/${params.id}/permissions`,
          {
            method: 'PUT',
            body: JSON.stringify({ permissionIds: data.permissionIds }),
          },
        );
        result = unwrapOne(permJson) ?? result;
      }
      return { data: result as never };
    }

    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(params.data),
    });
    return { data: unwrapOne(json) as never };
  },

  async updateMany(resource, params) {
    await Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resourcePath(resource)}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(params.data),
        }),
      ),
    );
    return { data: params.ids };
  },

  async delete(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: (unwrapOne(json) ?? params.previousData) as never };
  },

  async deleteMany(resource, params) {
    await Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resourcePath(resource)}/${id}`, {
          method: 'DELETE',
        }),
      ),
    );
    return { data: params.ids };
  },

  async inviteUser(payload: InviteUserPayload) {
    const { json } = await httpClient(`${API_URL}/users/invite`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { data: unwrapOne(json) };
  },

  async revokeInvitation(id: string) {
    const { json } = await httpClient(
      `${API_URL}/users/invitations/${id}/revoke`,
      { method: 'POST' },
    );
    return { data: unwrapOne(json) };
  },

  async resendInvitation(id: string) {
    const { json } = await httpClient(
      `${API_URL}/users/invitations/${id}/resend`,
      { method: 'POST' },
    );
    return { data: unwrapOne(json) };
  },

  async restoreUser(id: string) {
    const { json } = await httpClient(`${API_URL}/users/${id}/restore`, {
      method: 'POST',
    });
    return { data: unwrapOne(json) };
  },

  async setUserPassword(id: string, password: string) {
    await httpClient(`${API_URL}/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  },

  async getUserRoles(userId: string) {
    const { json } = await httpClient(
      `${API_URL}/permissions/users/${userId}/roles`,
    );
    const { rows } = unwrapList(json);
    return { data: rows as RoleSummary[] };
  },

  async setUserRoles(userId: string, roleIds: string[]) {
    const { json } = await httpClient(
      `${API_URL}/permissions/users/${userId}/roles`,
      { method: 'PUT', body: JSON.stringify({ roleIds }) },
    );
    return { data: unwrapOne(json) };
  },

  async createInventoryOperation(payload: CreateInventoryOperationPayload) {
    const { json } = await httpClient(`${API_URL}/inventory/operations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { data: unwrapOne(json) };
  },
} as ExtendedDataProvider;
