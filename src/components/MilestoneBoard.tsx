import { useEffect, useMemo, useRef, useState } from "react"
import type { Milestone } from "../types"
import AffirmationModal from "./AffirmationModal"
import { fireConfetti } from "../lib/confetti"

function dateOnly(ts:number){ return new Date(ts).toLocaleDateString() }

// 三类 ICON 规则（视觉只区分 3 种）
function iconFor(m: Milestone) {
  if (m.kind === "daySummary") return "🗓"
  if (m.kind === "custom") return "✨"
  return "🏁" // 干预完成（包含 planDone / sootheDone / resolvedStress 等）
}

export default function MilestoneBoard({
  list,                // 合并后的：每日总结 + 手动/干预
  onAdd,               // 手动添加
  onAffirm,            // 保存自我肯定 -> 成功账本
}: {
  list: Milestone[]
  onAdd: (title: string) => void
  onAffirm: (text: string) => void
}) {
  const [active, setActive] = useState<Milestone | null>(null)

  // —— 新增就放彩带（只对非 daySummary 生效）——
  const prevNonSummaryCount = useRef<number>(0)
  const nonSummaryCount = list.filter(m => m.kind !== "daySummary").length
  useEffect(()=>{
    if (nonSummaryCount > prevNonSummaryCount.current) {
      fireConfetti()
    }
    prevNonSummaryCount.current = nonSummaryCount
  }, [nonSummaryCount])

  // 按日期分组
  const groups = useMemo(()=>{
    const byDay = new Map<string, Milestone[]>()
    for (const m of list) {
      const key = dateOnly(m.ts)
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key)!.push(m)
    }
    // 每组内部：让 daySummary 放最前，其它跟着
    const ordered = Array.from(byDay.entries()).map(([k, arr])=>{
      const a = arr.slice().sort((x,y)=>{
        if (x.kind==="daySummary" && y.kind!=="daySummary") return -1
        if (x.kind!=="daySummary" && y.kind==="daySummary") return 1
        return y.ts - x.ts
      })
      return [k, a] as const
    })
    // 组间：按日期从新到旧
    return ordered.sort((A,B)=> new Date(B[0]).getTime() - new Date(A[0]).getTime())
  }, [list])

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">里程碑 · Milestones</div>
        <button
          onClick={()=> {
            const t = prompt("输入一个今天的正向事件（例如：今天健身 1 小时，很爽）")
            if (t && t.trim()) onAdd(t.trim())
          }}
          className="rounded-xl px-3 py-2 text-sm bg-white hover:bg-slate-100 border"
        >+ 手动添加</button>
      </div>

      {groups.length===0 ? (
        <div className="text-slate-500 text-sm mt-2">还没有里程碑。完成微计划/情绪练习，或手动添加一条试试。</div>
      ) : (
        <div className="mt-3 space-y-5">
          {groups.map(([day, items])=>(
            <section key={day}>
              <div className="text-xs text-slate-500 mb-2">{day}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(m=>(
                  <article key={m.id} className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">{iconFor(m)}</span>
                      <div className="flex-1">
                        <div className="text-sm">{m.title}</div>

                        {/* 若是每日总结，分点列出 */}
                        {m.kind==="daySummary" && Array.isArray(m.meta?.items) && (
                          <ul className="mt-2 text-xs text-slate-600 list-disc pl-4 space-y-1">
                            {(m.meta!.items as string[]).map((x,i)=> <li key={i}>{x}</li>)}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-right">
                      <button onClick={()=>setActive(m)} className="rounded-lg border px-2.5 py-1 text-xs bg-white hover:bg-indigo-50">
                        自我肯定
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {active && (
        <AffirmationModal
          milestone={active}
          onClose={()=>setActive(null)}
          onSave={(text)=>{ onAffirm(text) }}
        />
      )}
    </div>
  )
}
