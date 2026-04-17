type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;
type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiFetchOptions = {
  method?: ApiMethod;
  query?: QueryParams;
  body?: unknown;
  suppressAuthRedirect?: boolean;
};

const DEFAULT_BASE_URL = "http://localhost:8000";
const BASE_URL_KEY = "zeropoint_api_base_url";
const API_KEY_KEY = "zeropoint_api_key";

export function getApiConfig(): { baseUrl: string; apiKey: string } {
  return {
    baseUrl: localStorage.getItem(BASE_URL_KEY) || import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
    apiKey: localStorage.getItem(API_KEY_KEY) || "",
  };
}

export function setApiConfig(baseUrl: string, apiKey = ""): void {
  const cleaned = (baseUrl || "").trim().replace(/\/+$/, "");
  localStorage.setItem(BASE_URL_KEY, cleaned || DEFAULT_BASE_URL);
  localStorage.setItem(API_KEY_KEY, apiKey.trim());
}

function appendQueryParams(url: URL, query?: QueryParams): void {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
}

function normalizeOptions(
  methodOrOptions?: string | ApiFetchOptions | QueryParams,
  body?: unknown,
): ApiFetchOptions {
  if (!methodOrOptions) return { method: "GET", body };

  if (typeof methodOrOptions === "string") {
    return { method: methodOrOptions.toUpperCase() as ApiMethod, body };
  }

  if ("method" in methodOrOptions || "query" in methodOrOptions || "body" in methodOrOptions) {
    const opts = methodOrOptions as ApiFetchOptions;
    return { method: opts.method || "GET", query: opts.query, body: opts.body ?? body, suppressAuthRedirect: opts.suppressAuthRedirect };
  }

  // Backward-compat mode: second arg passed as query params object.
  return { method: "GET", query: methodOrOptions as QueryParams, body };
}

export async function apiFetch<T>(
  path: string,
  methodOrOptions?: string | ApiFetchOptions | QueryParams,
  body?: unknown,
): Promise<T> {
  const cfg = getApiConfig();
  const baseUrl = cfg.baseUrl || DEFAULT_BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const { method = "GET", query, body: requestBody, suppressAuthRedirect } = normalizeOptions(methodOrOptions, body);
  const url = new URL(`${baseUrl}${normalizedPath}`);
  appendQueryParams(url, query);

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (requestBody !== undefined && requestBody !== null && method !== "GET") {
    options.body = JSON.stringify(requestBody);
  }

  const res = await fetch(url.toString(), options);

  if (res.status === 401 || res.status === 403) {
    if (!suppressAuthRedirect) {
      window.location.href = "/login";
    }
    throw new Error("AUTH_FAILED");
  }
  if (!res.ok) {
    let errorDetail = `API error: ${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // No-op: non-JSON error body
    }
    throw new Error(errorDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export function getSelectedProgram(): string {
  return localStorage.getItem("zeropoint_program") || "";
}

export function setSelectedProgram(id: string) {
  localStorage.setItem("zeropoint_program", id);
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout", "POST");
  } catch (e) {
    console.error("Logout failed:", e);
  } finally {
    // Always redirect to login after logout attempt, regardless of backend success
    window.location.href = '/login';
  }
}

