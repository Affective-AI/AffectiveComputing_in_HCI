const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.detail || d.message || msg } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function apiRegister(input: {username: string; name: string; password: string}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return json(res);
}

export async function apiLogin(input: {username: string; password: string}) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return json(res);
}

export async function apiMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
  return json(res);
}

export async function apiLogout() {
  const res = await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
  return json(res);
}
