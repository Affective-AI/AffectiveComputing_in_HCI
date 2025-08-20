import type { LogEvent, Milestone } from "../types"
import { rid } from "./utils"

function startOfDay(ts: number) {
  const d = new Date(ts); d.setHours(0,0,0,0); return +d
}
function endOfDay(ts: number) {
  const d = new Date(ts); d.setHours(23,59,59,999); return +d
}
function dateOnlyLabel(ts: number) {
  return new Date(ts).toLocaleDateString()
}

// 轻量映射：把日志 kind -> 一句“亮点”文案（你可以根据自己的 logs 再补充/调整）
function toPoint(kind: string, meta?: any): string | null {
  switch (kind) {
    case "focus25": return "专注 ≥25 分钟";
    case "deepRead": return "深读论文 ≥90 秒";
    case "writingEdit": return "Overleaf 有有效编辑";
    case "planDone": return "完成 1 次微计划";
    case "sootheDone": return "完成 1 次情绪练习";
    case "resolvedStress": return "解决了一个压力节点";
    case "advisorMeet": return "与导师进行了沟通";
    case "nightBalanced": return "夜间不过载（节律更稳）";
    case "commitCode": return "提交/推送了研究代码";
    default: return null;
  }
}

/**
 * 把一段 logs 汇总成“每日总结”型里程碑（daySummary）
 * - 每天 1 条（若当天没有亮点则不生成）
 * - meta.items: string[] 用于分点列举
 */
export function summarizeLogsToDailyMilestones(logs: LogEvent[]): Milestone[] {
  if (!logs || logs.length === 0) return []
  // 按天分桶
  const byDay = new Map<number, LogEvent[]>()
  for (const ev of logs) {
    const day = startOfDay(ev.ts)
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day)!.push(ev)
  }

  const result: Milestone[] = []
  for (const [day, evs] of byDay.entries()) {
    const items: string[] = []
    const counter = new Map<string, number>()
    for (const e of evs) {
      const p = toPoint(e.kind, e.meta)
      if (!p) continue
      counter.set(p, (counter.get(p) || 0) + 1)
    }
    for (const [label, cnt] of counter.entries()) {
      items.push(cnt > 1 ? `${label} ×${cnt}` : label)
    }
    if (items.length === 0) continue
    result.push({
      id: rid(),
      ts: day, // 当天 00:00
      kind: "daySummary",
      title: `${dateOnlyLabel(day)} 的小进展`,
      source: "auto",
      meta: { items },
    })
  }
  // 新 → 旧
  return result.sort((a, b) => b.ts - a.ts)
}
