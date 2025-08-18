import { useNavigate } from "react-router-dom"
import { useStore } from "../store/store"
import StressCard from "../components/StressCard"
import Milestones from "../components/Milestones"
import SignalBar from "../components/SignalBar"
import { useState } from "react"
// import { Sparkles } from "lucide-react" // 若未安装，改为 emoji：✨

export default function Home() {
  const { stresses, milestones, signals } = useStore()
  const [showNew, setShowNew] = useState(false)
  const nav = useNavigate()

  return (
    <div className="space-y-8">
      {/* Hero 卡片 */}
      <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-500/15 to-fuchsia-400/15 blur-2xl" />
        <div className="flex items-center gap-2 text-slate-500">
          {/* <Sparkles size={18} className="text-indigo-600" /> */}
          <span>✨</span>
          <span className="text-sm">研究者专用 · 压力面板</span>
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">把压力变成可跟踪的对象</h1>
        <p className="mt-2 text-slate-600">用情景→评估→应对→再评估的闭环，把每一次卡顿都转化为清晰的一步。</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={()=>setShowNew(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700"
          >
            + 新建压力
          </button>
          <button
            onClick={()=>nav("/")}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-white/70 hover:bg-white shadow"
          >
            快速查看今日进展
          </button>
        </div>
      </div>

      {/* Signals */}
      {signals.length>0 && (
        <div className="space-y-3">
          {signals.map(sig => (
            <SignalBar
              key={sig.id}
              sig={sig}
              onAction={(a)=>{
                if (a==="record" || a==="coach") setShowNew(true)
              }}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stress list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">我的压力</h2>
            <button
              onClick={()=>setShowNew(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700"
            >
              + 添加压力
            </button>
          </div>

          {stresses.length===0 && (
            <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6 text-slate-500">
              还没有条目。点击“添加压力”，或从上方情景提示快速创建。
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stresses.map(s => (
              <StressCard key={s.id} s={s} onOpen={()=>nav(`/stress/${s.id}`)} />
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
            <div className="font-semibold mb-3">里程碑 · Progress</div>
            <Milestones m={milestones} />
          </div>
        </div>
      </div>

      {showNew && <NewStressModal onClose={()=>setShowNew(false)} />}
    </div>
  )
}

function NewStressModal({onClose}:{onClose:()=>void}) {
  const { addStress } = useStore()
  const [title, setTitle] = useState("")
  const [strength, setStrength] = useState(6)
  const [note, setNote] = useState("")
  const can = title.trim().length>0

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6">
        <div className="text-lg font-semibold mb-1">添加压力条目</div>
        <div className="text-sm text-slate-500 mb-4">给它起个名字，方便后续跟踪。</div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">名称</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例如：论文写作：引言卡住"
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">当前强度：{strength}</label>
            <input type="range" min={0} max={10} value={strength} onChange={e=>setStrength(parseInt(e.target.value))}
              className="w-full accent-indigo-600" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">一句话情景（可选）</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="此刻最卡的是…"
              className="w-full rounded-xl border px-3 py-2 bg-white/90" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-white/70 hover:bg-white shadow">取消</button>
          <button
            disabled={!can}
            onClick={()=>{ addStress(title, strength, note); onClose() }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${can?"bg-indigo-600 text-white hover:bg-indigo-500":"bg-indigo-300 text-white/80"}`}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}
