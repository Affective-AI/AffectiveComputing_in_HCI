import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useStore } from "../store/store"
import { clamp } from "../lib/utils"
import MiniSparkline from "../components/MiniSparkline"
import ChatBox from "../components/ChatBox"
import Timeline from "../components/Timeline"

export default function Detail() {
  const { id } = useParams()
  const nav = useNavigate()
  const store = useStore()
  const s = store.stresses.find(x=>x.id===id)
  const [strength, setStrength] = useState(s?.history.at(-1)?.strength ?? 5)

  useEffect(()=>{ setStrength(s?.history.at(-1)?.strength ?? 5) }, [id])

  if (!s) return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6">
      未找到条目。<button onClick={()=>nav("/")} className="text-indigo-600 underline ml-2">返回首页</button>
    </div>
  )

  function handleStrength(n:number) {
    const v = clamp(n,0,10)
    setStrength(v)
    store.updateStrength(s.id, v)
    store.addTimelineNode(s.id, { id: crypto.randomUUID?.() ?? Math.random().toString(), ts: Date.now(), kind:"appraise", title:`强度更新为 ${v}`})
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-slate-500">压力条目</div>
              <div className="text-xl font-semibold">{s.title}</div>
            </div>
            <div className="w-full sm:w-80">
              <label className="block text-xs text-slate-500">当前强度：{strength}</label>
              <input type="range" min={0} max={10} value={strength} onChange={e=>handleStrength(parseInt(e.target.value))}
                className="w-full accent-indigo-600" />
            </div>
          </div>
          <div className="mt-3">
            <MiniSparkline data={s.history.map(h=>h.strength)} height={36} />
          </div>
        </div>

        <ChatBox stress={s} />
      </div>

      <div className="space-y-4">
        <Timeline notes={s.notes} />
      </div>
    </div>
  )
}
