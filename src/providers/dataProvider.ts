
import { DataProvider, fetchUtils } from 'ra-core';
import { getApiToken } from '../lib/clerk/clerkRefs';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface InviteUserPayload {
  email: string;
  userType: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
}

export interface RoleSummary {
  id: string;
  name: string;
  description?: string | null;
}

export interface ExtendedDataProvider extends DataProvider {
  inviteUser: (payload: InviteUserPayload) => Promise<{ data: unknown }>;
  getUserRoles: (userId: string) => Promise<{ data: RoleSummary[] }>;
  setUserRoles: (
    userId: string,
    roleIds: string[],
  ) => Promise<{ data: unknown }>;
}

// Some backend resources live under a different path than their react-admin
// resource name. The RBAC roles endpoints are nested under /permissions.
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
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const dataProvider: DataProvider = {
  async getList(resource, params) {
    const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
    const { field, order } = params.sort ?? { field: 'id', order: 'ASC' };

    const query = toQueryString({
      ...params.filter,
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _end: page * perPage,
    });

    const { json } = await httpClient(
      `${API_URL}/${resourcePath(resource)}${query}`,
    );
    const data = Array.isArray(json) ? json : (json.data ?? []);

    return {
      data,
      total: data.length,
    };
  },

  async getOne(resource, params) {
    const { json } = await httpClient(
      `${API_URL}/${resourcePath(resource)}/${params.id}`,
    );
    return { data: json.data ?? json };
  },

  async getMany(resource, params) {
    const query = toQueryString({ id: params.ids.join(',') });
    const { json } = await httpClient(
      `${API_URL}/${resourcePath(resource)}${query}`,
    );
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return { data };
  },

  async getManyReference(resource, params) {
    const query = toQueryString({
      ...params.filter,
      [params.target]: params.id,
    });
    const { json } = await httpClient(
      `${API_URL}/${resourcePath(resource)}${query}`,
    );
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return { data, total: data.length };
  },

  async create(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resourcePath(resource)}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: json.data ?? json };
  },

  async update(resource, params) {
    // Roles keep their editable fields and their permission matrix on two
    // separate backend endpoints, so split the payload accordingly.
    if (resource === 'roles') {
      const data = params.data as Record<string, unknown>;
      const roleFields = {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      };
      const { json } = await httpClient(
        `${API_URL}/permissions/roles/${params.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(roleFields),
        },
      );
      let result = json.data ?? json;

      if (Array.isArray(data.permissionIds)) {
        const { json: permJson } = await httpClient(
          `${API_URL}/permissions/roles/${params.id}/permissions`,
          {
            method: 'PUT',
            body: JSON.stringify({ permissionIds: data.permissionIds }),
          },
        );
        result = permJson.data ?? result;
      }
      return { data: result };
    }

    const { json } = await httpClient(
      `${API_URL}/${resourcePath(resource)}/${params.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(params.data),
      },
    );
    return { data: json.data ?? json };
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
    const { json } = await httpClient(
      `${API_URL}/${resourcePath(resource)}/${params.id}`,
      {
        method: 'DELETE',
      },
    );
    return { data: json?.data ?? json ?? params.previousData };
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
    return { data: json?.data ?? json };
  },

  async getUserRoles(userId: string) {
    const { json } = await httpClient(
      `${API_URL}/permissions/users/${userId}/roles`,
    );
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return { data };
  },

  async setUserRoles(userId: string, roleIds: string[]) {
    const { json } = await httpClient(
      `${API_URL}/permissions/users/${userId}/roles`,
      {
        method: 'PUT',
        body: JSON.stringify({ roleIds }),
      },
    );
    return { data: json?.data ?? json };
  },
} as ExtendedDataProvider;
