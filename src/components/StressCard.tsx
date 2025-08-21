// src/components/StressCard.tsx
import { StressOut } from "../api/stress"

export default function StressCard({
  s,
  onOpen,
}: {
  s: StressOut
  onOpen: () => void
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{s.title}</div>
        <span className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
          强度 {s.current_strength}
        </span>
      </div>

      {s.description ? (
        <div className="text-sm text-slate-600 line-clamp-2">{s.description}</div>
      ) : null}

      <div className="text-xs text-slate-500">最近强度：{new Date(s.last_strength_at).toLocaleString()}</div>

      <div className="mt-1 flex flex-wrap gap-2">
        <button
          onClick={onOpen}
          className="rounded-xl px-3 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-500"
        >
          打开
        </button>
      </div>
    </div>
  )
}
