export const rid = () => Math.random().toString(36).slice(2, 9)
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
export const fmtTime = (ts: number) => new Date(ts).toLocaleString()
