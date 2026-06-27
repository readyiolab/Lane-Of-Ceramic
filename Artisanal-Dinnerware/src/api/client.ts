const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API error");
  return json.data as T;
}

export async function apiFetchPaginated<T>(path: string): Promise<{ data: T[]; total: number; page: number; limit: number }> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API error");
  return {
    data: json.data as T[],
    total: json.meta?.total ?? 0,
    page: json.meta?.page ?? 1,
    limit: json.meta?.limit ?? 20,
  };
}

export { API_BASE };
