// src/api/stress.ts
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.detail || d.message || msg } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/** 列表项（含当前强度） */
export interface StressOut {
  id: number;
  title: string;
  description?: string | null;
  status: "active" | "resolved" | "snoozed" | "maintenance" | string;
  created_at: string;
  updated_at?: string | null;
  current_strength: number;        // 关键：当前强度=最新一次历史值
  last_strength_at: string;        // 最新强度的时间
}

/** 历史点 */
export interface StrengthItem {
  id: number;
  strength: number;     // 0-10
  ts: string;           // ISO 时间
  note?: string | null;
  source?: string | null; // manual/plan/practice/auto...
}

/** 详情（包含完整历史） */
export interface StressDetail {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  history: StrengthItem[];
}

export interface StressCreateBody {
  title: string;
  description?: string | null;
  strength: number; // 初始强度
}

export interface StrengthAddBody {
  strength: number;      // 0-10
  note?: string | null;
  source?: string | null;
}

export interface StressPatchBody {
  title?: string;
  description?: string | null;
  status?: string;
}

export async function listStresses(): Promise<StressOut[]> {
  const res = await fetch(`${API_BASE}/stress`, { credentials: "include" });
  return json(res);
}

export async function getStress(id: number): Promise<StressDetail> {
  const res = await fetch(`${API_BASE}/stress/${id}`, { credentials: "include" });
  return json(res);
}

export async function createStress(body: StressCreateBody): Promise<StressOut> {
  const res = await fetch(`${API_BASE}/stress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return json(res);
}

export async function addStrength(stressId: number, body: StrengthAddBody): Promise<StrengthItem> {
  const res = await fetch(`${API_BASE}/stress/${stressId}/strength`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return json(res);
}

export async function patchStress(stressId: number, body: StressPatchBody): Promise<StressDetail> {
  const res = await fetch(`${API_BASE}/stress/${stressId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return json(res);
}
