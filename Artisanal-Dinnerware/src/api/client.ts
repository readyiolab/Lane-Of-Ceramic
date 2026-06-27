const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("accessToken");
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API error");
  return json.data as T;
}

export async function apiFetchPaginated<T>(path: string): Promise<{ data: T[]; total: number; page: number; limit: number }> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
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
