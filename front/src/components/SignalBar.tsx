import type { Signal } from "../types"
// import { Lightbulb } from "lucide-react"

export default function SignalBar({sig, onAction}:{sig:Signal; onAction:(a:string)=>void}) {
  return (
    <div className="w-full rounded-2xl border border-amber-200/60 bg-amber-50/70 backdrop-blur shadow p-3 md:p-4 flex items-start gap-3">
      <div className="mt-0.5 text-amber-600">💡{/* <Lightbulb size={18} /> */}</div>
      <div className="flex-1">
        <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700">{sig.text}</div>
        <div className="mt-2 flex gap-2">
          {sig.cta.map((c,i)=>(
            <button
              key={i}
              onClick={()=>onAction(c.action)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-white hover:bg-amber-100 border"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
