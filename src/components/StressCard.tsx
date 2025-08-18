import { fmtTime } from "../lib/utils"
import MiniSparkline from "./MiniSparkline"
import type { Stress } from "../types"

function strengthTone(n:number){
  if (n >= 8) return "bg-red-500/90 text-white"
  if (n >= 6) return "bg-orange-500/90 text-white"
  if (n >= 4) return "bg-amber-500/90 text-white"
  if (n >= 2) return "bg-emerald-500/90 text-white"
  return "bg-slate-300 text-slate-800"
}

export default function StressCard({s, onOpen}:{s:Stress; onOpen:()=>void}) {
  const last = s.history.at(-1)?.strength ?? 0
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4 hover:shadow-xl transition"
    >
      <div className="flex items-center justify-between">
        <div className="font-medium truncate pr-3">{s.title}</div>
        <span className={`inline-flex items-center rounded-full text-[11px] px-2 py-0.5 ${strengthTone(last)}`}>强度 {last}</span>
      </div>
      <div className="mt-3">
        <MiniSparkline data={s.history.map(h=>h.strength)} />
      </div>
      <div className="mt-2 text-xs text-slate-500">最近更新：{fmtTime(s.history.at(-1)?.ts ?? Date.now())}</div>
    </button>
  )
}
