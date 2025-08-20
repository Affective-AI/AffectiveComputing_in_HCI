export type StressStatus = "active" | "snoozed" | "resolved" | "maintenance"

export type Appraisal = {
  ts: number
  threat: number
  controllability: number
  resources: string[]
  note?: string
}

export type CopingPlan = {
  id: string
  createdAt: number
  steps: string[]
  timebox?: string
  successCriteria?: string[]
  startedAt?: number
  completedAt?: number
  done: boolean
}

export type EmotionPractice = {
  id: string
  createdAt: number
  technique: string
  durationMin: number
  doneAt?: number
}

export type MilestoneKind =
  | "daySummary"       // ✅ 新：按日志聚合的“每日总结”
  | "custom"           // ✅ 新：用户手动添加
  | "interventionDone" // ✅ 新：干预完成（统一视觉ICON）
  // —— 兼容你之前的细粒度（用于内部来源标注；UI 统一展示为 interventionDone）——
  | "planDone"
  | "sootheDone"
  | "resolvedStress"
  | "advisorMeet"
  | "nightBalanced"
  | "writingEdit"
  | "deepRead"
  | "focus25"
  | "commitCode"

export type Milestone = {
  id: string
  ts: number                 // 发生时间（用于排序）；对于 daySummary 建议使用当天 00:00
  kind: MilestoneKind
  title: string              // 卡片主文案
  source: "auto" | "manual"  // 自动/手动
  refStressId?: string
  meta?: Record<string, any> // 对于 daySummary: { items: string[] }
  affirmedAt?: number        // 自我肯定完成时间（可选）
}

export type ChatMsg = { id: string; role: "user" | "assistant"; text: string; ts: number; payload?: any }

export type TimelineNode = { id: string; ts: number; kind: "context" | "appraise" | "plan" | "soothe" | "result"; title: string; meta?: any }

export type LogEvent = { id: string; ts: number; kind: string; meta?: any }

export type Stress = {
  id: string
  title: string
  tags: string[]
  history: Array<{ ts: number; strength: number }>
  notes: TimelineNode[]
  messages: ChatMsg[]
  status?: StressStatus
  resolvedAt?: number
  resolveReason?: string
  snoozeUntil?: number

  appraisalHistory?: Appraisal[]
  activePlan?: CopingPlan | null
  pastPlans?: CopingPlan[]
  practices?: EmotionPractice[]
}
