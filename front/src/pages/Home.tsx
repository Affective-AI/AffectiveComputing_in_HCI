// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store/store"
import StressCard from "../components/StressCard"
import MilestonesStats from "../components/Milestones"
import MilestoneBoard from "../components/MilestoneBoard"
import { summarizeLogsToDailyMilestones } from "../lib/summary"
import { listStresses, createStress, StressOut } from "../api/stress"

export default function Home() {
  const nav = useNavigate()
  const {
    milestones,
    signals,
    milestonesFeed,
    addCustomMilestone,
    addLedger,
    logs,
  } = useStore()

  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stresses, setStresses] = useState<StressOut[]>([])

  async function refresh() {
    setLoading(true)
    try { setStresses(await listStresses()) }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  // 日志 → “每日总结”里程碑
  const dailySummaries = useMemo(()=> summarizeLogsToDailyMilestones(logs), [logs])
  // 合并：每日总结 + 手动/干预
  const allMilestones = useMemo(()=> [...dailySummaries, ...milestonesFeed].sort((a,b)=> b.ts-a.ts), [dailySummaries, milestonesFeed])

  return (
    <div className="space-y-8">
      {/* 顶部区块：标题 + 新建 + 压力卡片列表 */}
      <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-500/15 to-fuchsia-400/15 blur-2xl" />
        <div className="flex items-center gap-2 text-slate-500">
          <span>✨</span><span className="text-sm">研究者专用 · 压力面板</span>
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">把压力变成可跟踪的对象</h1>
        <p className="mt-2 text-slate-600">用情境→评估→应对→再评估的闭环，把每一次卡顿都转化为清晰的一步。</p>

        <div className="mt-4">
          <button
            onClick={()=>setShowNew(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-indigo-600 text-white hover:bg-indigo-500"
          >
            + 新建压力
          </button>
        </div>

        {/* 压力卡片列表 */}
        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-slate-500">加载中…</div>
          ) : stresses.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white/60 backdrop-blur p-6 text-slate-500">
              还没有条目。点击“新建压力”开始第一条记录。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stresses.map(s => (
                <StressCard key={s.id} s={s} onOpen={()=>nav(`/stress/${s.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 左里程碑 / 右侧 Signals + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MilestoneBoard list={allMilestones} onAdd={addCustomMilestone} onAffirm={addLedger} />
        </div>

        <aside className="space-y-3">
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
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
            <div className="font-semibold mb-3">里程碑 · Progress</div>
            <MilestonesStats m={milestones} />
          </div>
        </aside>
      </div>

      {showNew && <NewStressModal onClose={()=>{ setShowNew(false); refresh() }} />}
    </div>
  )
}

function NewStressModal({onClose}:{onClose:()=>void}) {
  const [title, setTitle] = useState("")
  const [strength, setStrength] = useState(6)
  const [desc, setDesc] = useState("")
  const [saving, setSaving] = useState(false)

  const can = title.trim().length>0

  async function save() {
    if (!can || saving) return
    setSaving(true)
    try {
      await createStress({ title: title.trim(), description: desc.trim() || undefined, strength })
      onClose()
    } catch (e:any) {
      alert(e?.message || "创建失败")
    } finally {
      setSaving(false)
    }
  }

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
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="此刻最卡的是…"
              className="w-full rounded-xl border px-3 py-2 bg-white/90" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-3.5 py-2 text-sm bg-white hover:bg-slate-100 border">取消</button>
          <button
            disabled={!can || saving}
            onClick={save}
            className={`rounded-xl px-3.5 py-2 text-sm ${can&&!saving?"bg-indigo-600 text-white hover:bg-indigo-500":"bg-indigo-300 text-white/80"}`}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}
