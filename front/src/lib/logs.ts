import type { LogEvent, Milestones, Signal } from "@/types"
import { rid } from "./utils"

export const seedLogs = (): LogEvent[] => {
  const now = Date.now()
  return [
    { ts: now - 1000*60*210, site:"overleaf", event:"active_block", durationMin:32, typing:0 },
    { ts: now - 1000*60*200, site:"scholar", event:"paper_view", durationMin:2, meta:{deep:true} },
    { ts: now - 1000*60*195, site:"scholar", event:"paper_view", durationMin:0.3 },
    { ts: now - 1000*60*180, event:"tab_switch_spike", count:8 },
    { ts: now - 1000*60*150, site:"overleaf", event:"typing_burst", durationMin:20, typing:350 },
    { ts: now - 1000*60*120, site:"arxiv", event:"paper_view", durationMin:1.8, meta:{deep:true} },
    { ts: now - 1000*60*60, site:"github", event:"commit_view", durationMin:5 },
    { ts: now - 1000*60*40, event:"tab_switch_spike", count:7 },
    { ts: now - 1000*60*25, site:"overleaf", event:"active_block", durationMin:26, typing:2 },
    { ts: now - 1000*60*10, site:"youtube", event:"entertainment", durationMin:10 },
  ]
}

export function deriveMilestones(logs: LogEvent[]): Milestones {
  let focus25=0, deepReads=0, chars=0, nightMin=0
  const nightStart=23, nightEnd=3
  for (const l of logs) {
    if (l.event==="active_block" && (l.durationMin||0)>=25 && (l.site||"").match(/overleaf|colab|jupyter|github/)) focus25++
    if (l.event==="paper_view" && (l.meta?.deep || (l.durationMin||0)>=1.5)) deepReads++
    if (l.event==="typing_burst") chars += Math.round(l.typing||0)
    const hour = new Date(l.ts).getHours()
    if ( (hour>=nightStart) || (hour<nightEnd) ) nightMin += Math.round(l.durationMin||0)
  }
  return { focus25, deepReads, charsApprox: chars, nightMin }
}

export function deriveSignals(logs: LogEvent[]): Signal[] {
  const out: Signal[] = []
  for (const l of logs) {
    if (l.event==="active_block" && (l.durationMin||0)>=25 && (l.typing||0)<=2 && l.site==="overleaf") {
      out.push({
        id: rid(),
        ts: l.ts,
        kind: "writing_stall",
        text: "你刚在 Overleaf 停留了 ~25 分钟几乎没有输入。需要记录一下当前情景，或试试一个 3 步小计划吗？",
        cta: [{label:"记录情景", action:"record"},{label:"生成3步计划", action:"coach"},{label:"忽略", action:"dismiss"}]
      })
    }
    if (l.event==="tab_switch_spike" && (l.count||0)>=6) {
      out.push({
        id: rid(),
        ts: l.ts,
        kind: "switch_spike",
        text: "过去几分钟你的标签页切换很多。要不要来一段 10 分钟聚焦？",
        cta: [{label:"开始10分钟", action:"focus10"},{label:"记录情景", action:"record"},{label:"忽略", action:"dismiss"}]
      })
    }
  }
  return out.sort((a,b)=>b.ts-a.ts).slice(0,2)
}
