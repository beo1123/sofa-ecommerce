import { sdk } from "@repo/sdk";

type RequestConfig = {
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  data?: unknown;
};

function toApiPath(path: string) {
  if (path.startsWith("/api/")) return path;
  if (path.startsWith("/admin/")) return `/api${path}`;
  if (path.startsWith("/auth/")) return `/api/v1${path}`;
  return `/api/v1${path}`;
}

function toQuery(params?: Record<string, unknown>) {
  if (!params) return undefined;
  const query: Record<string, string | number | boolean | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    query[key] = value as string | number | boolean;
  }
  return query;
}

async function withEnvelope<T = any>(executor: () => Promise<T>) {
  const data = await executor();
  return { data };
}

const axiosClient = {
  get: <T = any>(path: string, config?: RequestConfig) =>
    withEnvelope<T>(() => sdk.http.get<T>(toApiPath(path), toQuery(config?.params))),

  post: <T = any>(path: string, body?: unknown, config?: RequestConfig) =>
    withEnvelope<T>(() =>
      sdk.http.post<T>(toApiPath(path), body, {
        signal: config?.signal,
        headers: config?.headers,
      })
    ),

  put: <T = any>(path: string, body?: unknown, config?: RequestConfig) =>
    withEnvelope<T>(() =>
      sdk.http.put<T>(toApiPath(path), body, {
        signal: config?.signal,
        headers: config?.headers,
      })
    ),

  patch: <T = any>(path: string, body?: unknown, config?: RequestConfig) =>
    withEnvelope<T>(() =>
      sdk.http.patch<T>(toApiPath(path), body, {
        signal: config?.signal,
        headers: config?.headers,
      })
    ),

  delete: <T = any>(path: string, config?: RequestConfig) =>
    withEnvelope<T>(() =>
      sdk.http.delete<T>(toApiPath(path), config?.data, {
        signal: config?.signal,
        headers: config?.headers,
      })
    ),
};

export default axiosClient;
