import React, { createContext, useContext, useMemo, useState } from "react"
import type { ChatMsg, Stress, TimelineNode, LogEvent } from "@/types"
import { deriveMilestones, deriveSignals, seedLogs } from "@/lib/logs"
import { rid } from "@/lib/utils"

type Route = { name: "home" } | { name: "detail"; id: string }

type Store = {
  route: Route
  setRoute: (r: Route) => void
  stresses: Stress[]
  setStresses: (fn: (prev: Stress[]) => Stress[]) => void
  logs: LogEvent[]
  setLogs: (fn: (prev: LogEvent[]) => LogEvent[]) => void
  milestones: ReturnType<typeof deriveMilestones>
  signals: ReturnType<typeof deriveSignals>
  addStress: (title: string, strength: number, note?: string, tags?: string[]) => void
  updateStrength: (id: string, strength: number) => void
  appendMessage: (id: string, msg: ChatMsg) => void
  addTimelineNode: (id: string, node: TimelineNode) => void
}

const StoreCtx = createContext<Store | null>(null)

const now = Date.now()
const initialStresses: Stress[] = [
  {
    id: rid(),
    title: "论文写作：引言开头难起",
    tags: ["writing"],
    history: [
      { ts: now - 1000*60*1440*2, strength: 7 },
      { ts: now - 1000*60*1440, strength: 6 },
      { ts: now - 1000*60*600, strength: 8 }
    ],
    notes: [
      { id: rid(), ts: now - 1000*60*600, kind:"context", title:"记录情景：引言起笔卡住" },
      { id: rid(), ts: now - 1000*60*570, kind:"plan", title:"3步微计划：列3个小标题/每个2句事实/导出200字", meta:{ plan:["列3个小标题","每个2句事实","导出200字"] } },
      { id: rid(), ts: now - 1000*60*520, kind:"result", title:"完成度 70%，强度 8→5" }
    ],
    messages: [
      { id: rid(), role:"user", text:"引言第一段真的写不出来。", ts: now - 1000*60*600 },
      { id: rid(), role:"agent", mode:"coach", text:"给你一个可执行的3步小计划：…", ts: now - 1000*60*595,
        payload:{ plan:["列3个小标题","每个2句事实","导出200字"], timebox:"<=45min" } },
    ]
  }
]

export function StoreProvider({children}:{children:React.ReactNode}) {
  const [route, setRoute] = useState<Route>({ name: "home" })
  const [stresses, setStresses] = useState<Stress[]>(initialStresses)
  const [logs, setLogs] = useState<LogEvent[]>(seedLogs())

  const milestones = useMemo(()=>deriveMilestones(logs), [logs])
  const signals = useMemo(()=>deriveSignals(logs), [logs])

  function addStress(title: string, strength: number, note?: string, tags: string[] = []) {
    const id = rid()
    const s: Stress = { id, title, tags, history:[{ts:Date.now(), strength}], notes:[], messages:[] }
    if (note) s.notes.push({ id: rid(), ts: Date.now(), kind:"context", title: `记录情景：${note}` })
    setStresses(prev => [s, ...prev])
    setRoute({ name:"detail", id })
  }

  function updateStrength(id: string, strength: number) {
    setStresses(prev => prev.map(s => s.id===id ? { ...s, history:[...s.history, {ts:Date.now(), strength}] } : s))
  }

  function appendMessage(id: string, msg: ChatMsg) {
    setStresses(prev => prev.map(s => s.id===id ? { ...s, messages:[...s.messages, msg] } : s))
  }

  function addTimelineNode(id: string, node: TimelineNode) {
    setStresses(prev => prev.map(s => s.id===id ? { ...s, notes:[...s.notes, node] } : s))
  }

  const value: Store = { route, setRoute, stresses, setStresses, logs, setLogs, milestones, signals, addStress, updateStrength, appendMessage, addTimelineNode }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error("StoreProvider missing")
  return ctx
}
