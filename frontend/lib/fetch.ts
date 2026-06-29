const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions {
  method?: string;
  data?: unknown;
  token?: string;
  params?: Record<string, string>;
  baseUrl?: string;
}

interface FetchResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

export async function safeFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const { method = "GET", data, token, params, baseUrl } = options;
  const root = baseUrl || API;

  let url = `${root}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (method === "GET" || method === "DELETE") {
    headers["Accept"] = "application/json";
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    let body: unknown = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      const text = await res.text();
      if (res.ok) {
        return { ok: true, status: res.status, data: text as unknown as T, error: null };
      }
      return { ok: false, status: res.status, data: null, error: text || `HTTP ${res.status}` };
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: { status: res.status } }));
        }
      }
      const detail =
        (body as Record<string, unknown>)?.detail ||
        (body as Record<string, unknown>)?.message ||
        `HTTP ${res.status}`;
      return { ok: false, status: res.status, data: null, error: String(detail) };
    }

    return { ok: true, status: res.status, data: body as T, error: null };
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      return { ok: false, status: 0, data: null, error: "Koneksi terputus. Periksa koneksi internetmu." };
    }
    return { ok: false, status: 0, data: null, error: "Terjadi kesalahan jaringan." };
  }
}
