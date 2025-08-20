import type { Milestone } from "../types"

export function affirmForMilestone(m: Milestone): string {
  if (m.kind === "daySummary") {
    const items = (m.meta?.items as string[]) || []
    const top = items.slice(0, 3).join("、")
    return top
      ? `今天做对了：${top}。这说明你在把困难拆小并稳步推进。`
      : `今天照顾了自己，也给了课题一些空间，这就很好。`
  }
  if (m.kind === "custom") {
    return `你为自己创造了积极时刻：“${m.title}”。这反映了你的选择与价值。`
  }
  // 统一把各类干预完成归为“干预完成”
  return `很好，完成了关键一步（${m.title}）。把注意力放在已完成的部分上，信心会增长。`
}

// 仍保留之前日/周版本（若你别处用到）
export function shortAffirmationDaily(list: Milestone[]): string {
  if (!list || list.length === 0) return "今天不容易，仍在坚持。这份稳步推进也值得肯定。"
  const top = list.slice(0,3).map(x => x.title)
  return `今天做对了这些：${top.join("；")}。这说明你在把困难拆小并稳步前进。`
}

export function shortAffirmationWeekly(list: Milestone[]): string {
  if (!list || list.length === 0) return "本周可能更难，但你一直没有放弃。下周继续用微计划稳步前进就好。"
  const kinds = new Set(list.map(x=>x.kind))
  const resolved = list.find(x=>x.kind==="resolvedStress" || x.kind==="interventionDone")
  const msg1 = resolved ? "解决了一个压力节点，太棒了。" : "持续推进多个小目标。"
  return `这一周，你累计完成了 ${kinds.size} 类进展，${msg1}把注意力放在已完成的部分，信心会自然增长。`
}
