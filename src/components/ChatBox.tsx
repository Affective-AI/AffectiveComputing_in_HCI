import type { Stress } from "../types"
import { useState, useRef, useEffect } from "react"
import { useStore } from "../store/store"
import { scoutSuggest, coachPlan, sootherPack, agentMsgFromPlan, agentMsgFromSoother } from "../lib/llm"
import { rid } from "../lib/utils"
// import { Send } from "lucide-react"

export default function ChatBox({stress}:{stress:Stress}) {
  const store = useStore()
  const [input, setInput] = useState("")
  const refEnd = useRef<HTMLDivElement>(null)
  useEffect(()=>{ refEnd.current?.scrollIntoView({behavior:"smooth"}) }, [stress.messages.length])

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    const userMsg = { id: rid(), role:"user" as const, text, ts: Date.now() }
    store.appendMessage(stress.id, userMsg)
    setInput("")

    const context = { overleafStall: store.signals.some(s=>s.kind==="writing_stall") }
    const appraisal = scoutSuggest(text, context)

    if (appraisal.gate==="problem_focused") {
      const plan = coachPlan(text)
      store.addTimelineNode(stress.id, { id: rid(), ts: Date.now(), kind:"plan", title:`3步微计划：${plan.plan.join(" / ")}`, meta:{plan:plan.plan} })
      store.appendMessage(stress.id, agentMsgFromPlan(plan))
    } else {
      const pack = sootherPack()
      store.addTimelineNode(stress.id, { id: rid(), ts: Date.now(), kind:"soothe", title:`情绪练习：${pack.technique}` })
      store.appendMessage(stress.id, agentMsgFromSoother(pack))
    }
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
      <div className="font-semibold mb-2">对话</div>
      <div className="h-[40vh] overflow-auto pr-2 space-y-3">
        {stress.messages.map(m => <ChatBubble key={m.id} m={m} />)}
        <div ref={refEnd} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if(e.key==="Enter") handleSend() }}
          placeholder="把问题讲给我听…（例如：引言第一段写不出来）"
          className="flex-1 rounded-xl border px-3 py-2 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition bg-indigo-600 text-white hover:bg-indigo-500"
        >
          {/* <Send size={16}/> */} 发送
        </button>
      </div>
    </div>
  )
}

function ChatBubble({m}:{m:any}) {
  const isUser = m.role==="user"
  return (
    <div className={`max-w-[85%] ${isUser?"ml-auto":""}`}>
      <div className={`px-3 py-2 rounded-2xl text-sm shadow
        ${isUser
          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm"
          : "bg-white/80 backdrop-blur border rounded-tl-sm"}`}>
        <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

        {m.payload?.plan && (
          <ul className={`mt-2 list-disc pl-5 space-y-1 ${isUser?"text-white/90":"text-slate-700"}`}>
            {m.payload.plan.map((p:string,i:number)=>(<li key={i}>{p}</li>))}
          </ul>
        )}
        {m.payload?.script && (
          <ol className="mt-2 list-decimal pl-5 space-y-1 text-slate-800">
            {m.payload.script.map((p:string,i:number)=>(<li key={i}>{p}</li>))}
          </ol>
        )}
      </div>
      <div className="text-[10px] text-slate-500 mt-1">{new Date(m.ts).toLocaleString()}</div>
    </div>
  )
}
