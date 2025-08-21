import type { Stress } from "../types"
import { useStore } from "../store/store"

function badge(status?: string) {
  const map: Record<string,string> = {
    active: "bg-emerald-500 text-white",
    snoozed: "bg-amber-500 text-white",
    resolved: "bg-slate-700 text-white",
    maintenance: "bg-indigo-600 text-white"
  }
  return `inline-flex items-center text-[11px] px-2 py-0.5 rounded-full ${map[status||"active"]||"bg-slate-300"}`
}

export default function DetailHeaderBar({s}:{s:Stress}) {
  const store = useStore()

  const handleResolveWithMilestone = () => {
    const copy = prompt("写一句完成文案（将用于里程碑 & 解决原因）", `完成关键一步：${s.title}`) || ""
    const enterMaint = confirm("是否进入维持期（Maintenance）？")
    store.markResolved(s.id, copy || "阶段目标完成", enterMaint, { milestoneText: copy })
  }

  const handleCelebrateOnly = () => {
    const copy = prompt("写一句里程碑文案（不会关闭压力）", `推进了一步：${s.title}`) || ""
    store.celebrateMilestone(s.id, copy)
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-slate-500">压力条目</div>
          <div className="text-xl font-semibold">{s.title}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={badge(s.status)}>{s.status}</span>

          {/* 一键：完成并生成里程碑 */}
          {s.status!=="resolved" && (
            <button
              onClick={handleResolveWithMilestone}
              className="rounded-xl px-3 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-500"
              title="标记为已解决，并生成一条里程碑（同一段文案）"
            >完成并生成里程碑</button>
          )}

          {/* 仅生成里程碑，不关闭 */}
          {s.status!=="resolved" && (
            <button
              onClick={handleCelebrateOnly}
              className="rounded-xl px-3 py-2 text-sm bg-white hover:bg-slate-100 border"
              title="保持跟踪，只记录一个里程碑"
            >记录里程碑</button>
          )}

          {(s.status==="resolved" || s.status==="snoozed" || s.status==="maintenance") && (
            <button
              onClick={()=>store.reopenStress(s.id)}
              className="rounded-xl px-3 py-2 text-sm bg-white hover:bg-slate-100 border"
            >重新开启</button>
          )}

          {s.status!=="snoozed" && s.status!=="resolved" && (
            <button
              onClick={()=>{
                const d = Number(prompt("暂停多少天？", "3")||"3")
                if (!Number.isNaN(d)) store.snoozeStress(s.id, Math.max(1, d))
              }}
              className="rounded-xl px-3 py-2 text-sm bg-white hover:bg-slate-100 border"
            >暂停</button>
          )}
        </div>
      </div>
    </div>
  )
}
