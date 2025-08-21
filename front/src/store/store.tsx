import React, { createContext, useContext, useMemo, useState } from "react"
import type {
  ChatMsg,
  Stress,
  TimelineNode,
  LogEvent,
  Appraisal,
  CopingPlan,
  EmotionPractice,
  Milestone,
  MilestoneKind,
} from "../types"
import { deriveMilestones, deriveSignals, seedLogs } from "../lib/logs"
import { rid } from "../lib/utils"
import { coachPlan, sootherPack } from "../lib/llm"

type Route = { name: "home" } | { name: "detail"; id: string }

type Store = {
  // 基础
  route: Route
  setRoute: (r: Route) => void

  stresses: Stress[]
  setStresses: (fn: (prev: Stress[]) => Stress[]) => void

  logs: LogEvent[]
  setLogs: (fn: (prev: LogEvent[]) => LogEvent[]) => void

  // 派生
  milestones: ReturnType<typeof deriveMilestones>
  signals: ReturnType<typeof deriveSignals>

  // 里程碑 & 成功账本
  milestonesFeed: Milestone[]
  addCustomMilestone: (title: string) => void
  addAutoMilestone: (kind: MilestoneKind, title: string, refId?: string) => void
  successLedger: Array<{ id: string; ts: number; text: string }>
  addLedger: (text: string) => void

  // 压力 CRUD
  addStress: (title: string, strength: number, note?: string, tags?: string[]) => void
  updateStrength: (id: string, strength: number) => void
  appendMessage: (id: string, msg: ChatMsg) => void
  addTimelineNode: (id: string, node: TimelineNode) => void

  // 状态切换
  markResolved: (id: string, reason: string, enterMaintenance?: boolean, opts?: { milestoneText?: string }) => void
  reopenStress: (id: string) => void
  snoozeStress: (id: string, days: number) => void

  // 新增：把压力直接“庆祝成里程碑”（不关闭）
  celebrateMilestone: (id: string, text?: string) => void

  // TMSC
  saveAppraisal: (id: string, a: Omit<Appraisal, "ts">) => void
  startPlan: (id: string, sourceText?: string) => void
  completePlan: (id: string, success: boolean) => void
  startPractice: (id: string) => void
  finishPractice: (id: string) => void
  reappraiseAfterAction: (id: string, strength: number, note?: string) => void
}

const StoreCtx = createContext<Store | null>(null)

// —— 初始数据（示例） ——
const now = Date.now()
const initialStresses: Stress[] = [
  {
    id: rid(),
    title: "论文写作：引言开头难起",
    tags: ["writing"],
    history: [
      { ts: now - 1000 * 60 * 1440 * 2, strength: 7 },
      { ts: now - 1000 * 60 * 1440, strength: 6 },
      { ts: now - 1000 * 60 * 600, strength: 8 },
    ],
    notes: [],
    messages: [],
    status: "active",
    appraisalHistory: [],
    activePlan: null,
    pastPlans: [],
    practices: [],
  },
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: "home" })
  const [stresses, setStresses] = useState<Stress[]>(initialStresses)
  const [logs, setLogs] = useState<LogEvent[]>(seedLogs())

  const milestones = useMemo(() => deriveMilestones(logs), [logs])
  const signals = useMemo(() => deriveSignals(logs), [logs])

  const [milestonesFeed, setMilestonesFeed] = useState<Milestone[]>([])
  function addCustomMilestone(title: string) {
    const m: Milestone = { id: rid(), ts: Date.now(), kind: "custom", title, source: "manual" }
    setMilestonesFeed((prev) => [m, ...prev])
  }
  function addAutoMilestone(kind: MilestoneKind, title: string, refId?: string) {
    const m: Milestone = { id: rid(), ts: Date.now(), kind, title, source: "auto", refStressId: refId }
    setMilestonesFeed((prev) => [m, ...prev])
  }

  const [successLedger, setSuccessLedger] = useState<Array<{ id: string; ts: number; text: string }>>([])
  function addLedger(text: string) {
    setSuccessLedger((prev) => [{ id: rid(), ts: Date.now(), text }, ...prev])
  }

  // —— 基础操作 ——
  function addStress(title: string, strength: number, note?: string, tags: string[] = []) {
    const id = rid()
    const s: Stress = {
      id,
      title,
      tags,
      history: [{ ts: Date.now(), strength }],
      notes: [],
      messages: [],
      status: "active",
      appraisalHistory: [],
      activePlan: null,
      pastPlans: [],
      practices: [],
    }
    if (note) s.notes.push({ id: rid(), ts: Date.now(), kind: "context", title: `记录情景：${note}` })
    setStresses((prev) => [s, ...prev])
    setRoute({ name: "detail", id })
  }

  function updateStrength(id: string, strength: number) {
    setStresses((prev) =>
      prev.map((s) => (s.id === id ? { ...s, history: [...s.history, { ts: Date.now(), strength }] } : s)),
    )
  }

  function appendMessage(id: string, msg: ChatMsg) {
    setStresses((prev) => prev.map((s) => (s.id === id ? { ...s, messages: [...s.messages, msg] } : s)))
  }

  function addTimelineNode(id: string, node: TimelineNode) {
    setStresses((prev) => prev.map((s) => (s.id === id ? { ...s, notes: [...s.notes, node] } : s)))
  }

  // —— 状态切换 ——
  /**
   * 标记解决：
   * - reason：写在时间线
   * - opts.milestoneText：若提供，用它生成“interventionDone”里程碑；否则使用默认的“resolvedStress”
   */
  function markResolved(
    id: string,
    reason: string,
    enterMaintenance = false,
    opts?: { milestoneText?: string },
  ) {
    setStresses((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const status = enterMaintenance ? "maintenance" : "resolved"
        const t = Date.now()
        const notes = [
          ...s.notes,
          { id: rid(), ts: t, kind: "result", title: `标记为${status === "maintenance" ? "维持期" : "已解决"}：${reason}` },
        ]

        // —— 里程碑：优先采用合并文案，否则退回默认的“解决一个压力”文案 ——
        if (opts?.milestoneText && opts.milestoneText.trim()) {
          addAutoMilestone("interventionDone", opts.milestoneText.trim(), s.id)
        } else {
          addAutoMilestone("resolvedStress", `解决了一个压力：${s.title}`, s.id)
        }

        return { ...s, status, resolvedAt: t, resolveReason: reason, notes }
      }),
    )
  }

  function reopenStress(id: string) {
    setStresses((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "active",
              notes: [...s.notes, { id: rid(), ts: Date.now(), kind: "context", title: "重新开启此压力的跟踪" }],
            }
          : s,
      ),
    )
  }

  function snoozeStress(id: string, days: number) {
    const until = Date.now() + days * 24 * 60 * 60 * 1000
    setStresses((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "snoozed",
              snoozeUntil: until,
              notes: [
                ...s.notes,
                {
                  id: rid(),
                  ts: Date.now(),
                  kind: "context",
                  title: `暂停 ${days} 天（至 ${new Date(until).toLocaleDateString()}）`,
                },
              ],
            }
          : s,
      ),
    )
  }

  // —— 新增：只生成里程碑，不关闭压力 ——
  function celebrateMilestone(id: string, text?: string) {
    const s = stresses.find((x) => x.id === id)
    if (!s) return
    const copy = (text && text.trim()) || `推进了一步：${s.title}`
    addAutoMilestone("interventionDone", copy, id)
    // 时间线做个记录
    setStresses((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, notes: [...x.notes, { id: rid(), ts: Date.now(), kind: "result", title: `记录里程碑：${copy}` }] }
          : x,
      ),
    )
  }

  // —— TMSC：评估/应对/再评估 ——
  function saveAppraisal(id: string, a: Omit<Appraisal, "ts">) {
    const entry = { ...a, ts: Date.now() }
    setStresses((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              appraisalHistory: [...(s.appraisalHistory || []), entry],
              notes: [
                ...s.notes,
                {
                  id: rid(),
                  ts: entry.ts,
                  kind: "appraise",
                  title: `评估：威胁 ${a.threat}/10 · 可控 ${a.controllability}/10`,
                },
              ],
            }
          : s,
      ),
    )
  }

  function startPlan(id: string, sourceText?: string) {
    const planGen = coachPlan(sourceText || "")
    const plan: CopingPlan = {
      id: rid(),
      createdAt: Date.now(),
      steps: planGen.plan,
      timebox: planGen.timebox,
      successCriteria: planGen.success_criteria,
      startedAt: Date.now(),
      done: false,
    }
    setStresses((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              activePlan: plan,
              notes: [
                ...s.notes,
                { id: rid(), ts: plan.createdAt, kind: "plan", title: `开始微计划：${plan.steps.join(" / ")}` },
              ],
            }
          : s,
      ),
    )
  }

  function completePlan(id: string, success: boolean) {
    setStresses((prev) =>
      prev.map((s) => {
        if (s.id !== id || !s.activePlan) return s
        const completed = { ...s.activePlan, done: true, completedAt: Date.now() }
        const next: Stress = {
          ...s,
          activePlan: null,
          pastPlans: [...(s.pastPlans || []), completed],
          notes: [
            ...s.notes,
            { id: rid(), ts: completed.completedAt!, kind: "result", title: `微计划完成：${success ? "成功" : "未达成"}` },
          ],
        }
        if (success) addAutoMilestone("planDone", "完成了一次 3 步微计划", s.id)
        return next
      }),
    )
  }

  function startPractice(id: string) {
    const pack = sootherPack()
    const p: EmotionPractice = {
      id: rid(),
      createdAt: Date.now(),
      technique: pack.technique,
      durationMin: pack.duration_min,
    }
    setStresses((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              practices: [...(s.practices || []), p],
              notes: [
                ...s.notes,
                { id: rid(), ts: p.createdAt, kind: "soothe", title: `情绪练习：${p.technique} · ${p.durationMin} 分钟` },
              ],
            }
          : s,
      ),
    )
  }

  function finishPractice(id: string) {
    setStresses((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const ps = (s.practices || []).slice()
        if (ps.length) {
          ps[ps.length - 1] = { ...ps[ps.length - 1], doneAt: Date.now() }
          addAutoMilestone("sootheDone", "完成了 1 次情绪调节练习", s.id)
        }
        return { ...s, practices: ps }
      }),
    )
  }

  function reappraiseAfterAction(id: string, strength: number, note?: string) {
    setStresses((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const t = Date.now()
        return {
          ...s,
          history: [...s.history, { ts: t, strength }],
          notes: [
            ...s.notes,
            { id: rid(), ts: t, kind: "result", title: `再评估：强度更新为 ${strength}${note ? ` · ${note}` : ""}` },
          ],
        }
      }),
    )
  }

  const value: Store = {
    route,
    setRoute,
    stresses,
    setStresses,
    logs,
    setLogs,

    milestones,
    signals,

    milestonesFeed,
    addCustomMilestone,
    addAutoMilestone,
    successLedger,
    addLedger,

    addStress,
    updateStrength,
    appendMessage,
    addTimelineNode,

    markResolved,
    reopenStress,
    snoozeStress,
    celebrateMilestone,

    saveAppraisal,
    startPlan,
    completePlan,
    startPractice,
    finishPractice,
    reappraiseAfterAction,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error("StoreProvider missing")
  return ctx
}
