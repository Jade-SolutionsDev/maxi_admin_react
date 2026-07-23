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

export interface ProductStockLocation {
  locationId: string;
  locationName: string;
  provinces: string[];
  quantity: number;
}

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
  getProductStock: (
    productId: string,
  ) => Promise<{ data: ProductStockLocation[] }>;
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
 * flat (`{ data: [...] }`, e.g. clients/products). `serverPaginated` tells
 * getList whether the backend already applied paging/sorting (use as-is) or
 * returned the full list (page + sort on the client — see getList).
 */
function unwrapList(json: unknown): {
  rows: unknown[];
  total: number;
  serverPaginated: boolean;
} {
  const body = json as { data?: unknown } | unknown[] | null;
  const payload = Array.isArray(body) ? body : (body?.data ?? body);

  if (Array.isArray(payload)) {
    return { rows: payload, total: payload.length, serverPaginated: false };
  }

  const paginated = payload as {
    data?: unknown[];
    meta?: { total?: number };
  } | null;

  if (paginated && Array.isArray(paginated.data) && paginated.meta) {
    return {
      rows: paginated.data,
      total: paginated.meta.total ?? paginated.data.length,
      serverPaginated: true,
    };
  }

  const rows = (paginated?.data as unknown[] | undefined) ?? [];
  return { rows, total: rows.length, serverPaginated: false };
}

/**
 * Client-side sort for endpoints that return the whole list unsorted (the
 * backend keeps the catalog small and returns everything). Compares numbers,
 * booleans, numeric strings and ISO dates sensibly; `id`/no field keeps the
 * server's own order (react-admin's default sort sentinel is `id`).
 */
function sortRecords(
  rows: unknown[],
  field: string,
  order: "ASC" | "DESC",
): unknown[] {
  if (!field || field === "id") return rows;
  const dir = order === "DESC" ? -1 : 1;
  const get = (r: unknown) => (r as Record<string, unknown>)?.[field];
  return [...rows].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1; // nulls last
    if (bv == null) return -1;
    if (typeof av === "boolean" || typeof bv === "boolean") {
      return (Number(av) - Number(bv)) * dir;
    }
    const an = typeof av === "number" ? av : Number(av);
    const bn = typeof bv === "number" ? bv : Number(bv);
    const numeric =
      !Number.isNaN(an) &&
      !Number.isNaN(bn) &&
      String(av).trim() !== "" &&
      String(bv).trim() !== "";
    if (numeric) return (an - bn) * dir;
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
  });
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
    const { rows, total, serverPaginated } = unwrapList(json);

    // Server already paged/sorted (e.g. users) → use as-is.
    if (serverPaginated) {
      return { data: rows as never[], total };
    }

    // Backend returned the full list → sort + slice on the client so the
    // pagination controls and column sorting actually work.
    //
    // SCALABILITY: this refetches the entire list on every page/sort change. It
    // is intentional while every catalog here is small. When a resource becomes
    // high-load / large, move THAT resource to server-side paging so only one
    // page crosses the wire. Transition recipe:
    //   1. Backend: have the list endpoint return `{ data, meta:{ total, ... } }`
    //      via `src/common/dto/pagination.dto.ts` (`GET /users` is the template),
    //      applying LIMIT/OFFSET + ORDER BY + getManyAndCount for page/limit/
    //      sortBy/sortOrder — AND add an `id` (comma-list) filter so this
    //      provider's getMany/getManyReference + <ReferenceField>/dropdowns keep
    //      resolving records beyond the first page.
    //   2. Frontend: nothing — unwrapList already detects the `{ data, meta }`
    //      shape (serverPaginated) and this branch is skipped automatically.
    const sorted = sortRecords(rows, field, order);
    const start = (page - 1) * perPage;
    return {
      data: sorted.slice(start, start + perPage) as never[],
      total: sorted.length,
    };
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

  async getProductStock(productId: string) {
    const { json } = await httpClient(
      `${API_URL}/inventory/product/${productId}`,
    );
    const { rows } = unwrapList(json);
    return { data: rows as ProductStockLocation[] };
  },
} as ExtendedDataProvider;
