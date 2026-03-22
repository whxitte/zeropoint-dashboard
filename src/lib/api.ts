const STORAGE_KEY_API = "zeropoint_api_url";
const STORAGE_KEY_KEY = "zeropoint_api_key";

export function getApiConfig() {
  return {
    baseUrl: localStorage.getItem(STORAGE_KEY_API) || "http://localhost:8000",
    apiKey: localStorage.getItem(STORAGE_KEY_KEY) || "",
  };
}

export function setApiConfig(baseUrl: string, apiKey: string) {
  localStorage.setItem(STORAGE_KEY_API, baseUrl);
  localStorage.setItem(STORAGE_KEY_KEY, apiKey);
}

export function isConfigured(): boolean {
  return !!localStorage.getItem(STORAGE_KEY_KEY);
}

export async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const { baseUrl, apiKey } = getApiConfig();
  const url = new URL(`${baseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("AUTH_FAILED");
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getSelectedProgram(): string {
  return localStorage.getItem("zeropoint_program") || "";
}

export function setSelectedProgram(id: string) {
  localStorage.setItem("zeropoint_program", id);
}
