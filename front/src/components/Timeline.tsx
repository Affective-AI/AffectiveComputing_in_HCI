import type { TimelineNode } from "../types"
import { fmtTime } from "../lib/utils"

export default function Timeline({notes}:{notes:TimelineNode[]}) {
  const sorted = notes.slice().sort((a,b)=>b.ts-a.ts)
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
      <div className="font-semibold mb-2">时间线</div>
      <div className="relative pl-5">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-300 to-fuchsia-300" />
        <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
          {sorted.map(n => <Item key={n.id} n={n} />)}
        </div>
      </div>
    </div>
  )
}

function dotColor(kind:string){
  if (kind==="plan") return "bg-emerald-500"
  if (kind==="soothe") return "bg-fuchsia-500"
  if (kind==="appraise") return "bg-amber-500"
  if (kind==="result") return "bg-indigo-600"
  return "bg-slate-400"
}

function Item({n}:{n:TimelineNode}) {
  return (
    <div className="relative pl-4">
      <span className={`absolute left-[-7px] top-2 h-3 w-3 rounded-full ring-4 ring-white ${dotColor(n.kind)}`} />
      <div className="rounded-xl border bg-white/80 backdrop-blur p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">{n.title}</div>
          <div className="text-xs text-slate-500">{fmtTime(n.ts)}</div>
        </div>
        {n.meta?.plan && (
          <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
            {n.meta.plan.map((p:string,i:number)=>(<li key={i}>{p}</li>))}
          </ul>
        )}
      </div>
    </div>
  )
}
