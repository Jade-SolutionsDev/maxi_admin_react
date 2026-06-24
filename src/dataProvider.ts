import { fetchUtils, type DataProvider } from 'react-admin';
import { getApiToken } from './clerkRefs';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

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

    const { json } = await httpClient(`${API_URL}/${resource}${query}`);
    const data = Array.isArray(json) ? json : (json.data ?? []);

    return {
      data,
      total: data.length,
    };
  },

  async getOne(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resource}/${params.id}`);
    return { data: json.data ?? json };
  },

  async getMany(resource, params) {
    const query = toQueryString({ id: params.ids.join(',') });
    const { json } = await httpClient(`${API_URL}/${resource}${query}`);
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return { data };
  },

  async getManyReference(resource, params) {
    const query = toQueryString({
      ...params.filter,
      [params.target]: params.id,
    });
    const { json } = await httpClient(`${API_URL}/${resource}${query}`);
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return { data, total: data.length };
  },

  async create(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: json.data ?? json };
  },

  async update(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(params.data),
    });
    return { data: json.data ?? json };
  },

  async updateMany(resource, params) {
    await Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(params.data),
        }),
      ),
    );
    return { data: params.ids };
  },

  async delete(resource, params) {
    const { json } = await httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: json?.data ?? json ?? params.previousData };
  },

  async deleteMany(resource, params) {
    await Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'DELETE',
        }),
      ),
    );
    return { data: params.ids };
  },
};
