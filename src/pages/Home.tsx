import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store/store"
import StressCard from "../components/StressCard"
import MilestonesStats from "../components/Milestones" // 你的统计汇总卡
import MilestoneBoard from "../components/MilestoneBoard"
import { summarizeLogsToDailyMilestones } from "../lib/summary"

export default function Home() {
  const {
    stresses,
    milestones,             // 统计汇总：≥25min、深读、字符数、夜间活跃
    signals,                // 今日进展
    milestonesFeed,         // 手动/干预里程碑明细流
    addCustomMilestone,
    addLedger,              // 保存自我肯定到成功账本
    logs,                   // 原始日志（用于“每日总结”）
  } = useStore()

  const [showNew, setShowNew] = useState(false)
  const nav = useNavigate()

  // 日志 → “每日总结”里程碑
  const dailySummaries = useMemo(()=> summarizeLogsToDailyMilestones(logs), [logs])

  // 合并：每日总结 + 手动/干预（时间倒序）
  const allMilestones = useMemo(()=>{
    return [...dailySummaries, ...milestonesFeed].sort((a,b)=> b.ts - a.ts)
  }, [dailySummaries, milestonesFeed])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-500/15 to-fuchsia-400/15 blur-2xl" />
        <div className="flex items-center gap-2 text-slate-500">
          <span>✨</span><span className="text-sm">研究者专用 · 压力面板</span>
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">把压力变成可跟踪的对象</h1>
        <p className="mt-2 text-slate-600">用情境→评估→应对→再评估的闭环，把每一次卡顿都转化为清晰的一步。</p>
        <div className="mt-4 flex gap-2">
          <button onClick={()=>setShowNew(true)} className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-indigo-600 text-white hover:bg-indigo-500">+ 新建压力</button>
          <button onClick={()=>nav("/")} className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-white/70 hover:bg-white shadow">快速查看今日进展</button>
        </div>
      </div>

      {/* 主体：左（压力 + 里程碑） / 右（Signals + 汇总） */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 我的压力 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">我的压力</h2>
              <button onClick={()=>setShowNew(true)} className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-indigo-600 text-white hover:bg-indigo-500">
                + 添加压力
              </button>
            </div>
            {stresses.length===0 ? (
              <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6 text-slate-500">
                还没有条目。点击“添加压力”，或使用右侧“今日进展”建议快速创建。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stresses.map(s => (
                  <StressCard key={s.id} s={s} onOpen={()=>nav(`/stress/${s.id}`)} />
                ))}
              </div>
            )}
          </section>

          {/* 里程碑（合并：每日总结 + 手动/干预） */}
          <MilestoneBoard
            list={allMilestones}
            onAdd={addCustomMilestone}
            onAffirm={addLedger}
          />
        </div>

        {/* 右：今日进展 + 里程碑汇总 */}
        <aside className="space-y-3">
          {/* 今日进展（紧凑） */}
          <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
            <div className="font-semibold mb-2">今日进展 · Signals</div>
            {signals.length===0 ? (
              <div className="text-slate-500 text-sm">暂无建议。</div>
            ) : (
              <ul className="space-y-2">
                {signals.map((sig:any) => (
                  <li key={sig.id} className="rounded-xl border bg-white hover:bg-slate-50 transition p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">💡</span>
                      <div className="flex-1 text-slate-700">{sig.text}</div>
                    </div>
                    {sig.cta?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sig.cta.map((c:any,i:number)=>(
                          <button
                            key={i}
                            onClick={()=>{ if (c.action==="record" || c.action==="coach") setShowNew(true) }}
                            className="rounded-lg border px-2.5 py-1 text-xs bg-white hover:bg-amber-50"
                          >{c.label}</button>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 里程碑 · Progress（统计卡） */}
          <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
            <div className="font-semibold mb-3">里程碑 · Progress</div>
            <MilestonesStats m={milestones} />
          </div>
        </aside>
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
