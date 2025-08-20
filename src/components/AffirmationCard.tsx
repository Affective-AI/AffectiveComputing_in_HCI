import { useMemo, useState } from "react"
import type { Milestone } from "../types"
import { speak, createSTT } from "../lib/voice"
import { shortAffirmationDaily, shortAffirmationWeekly } from "../lib/affirmation"

function startOfDay(d:Date){ const x=new Date(d); x.setHours(0,0,0,0); return +x }
function endOfDay(d:Date){ const x=new Date(d); x.setHours(23,59,59,999); return +x }
function startOfWeek(d:Date){ const x=new Date(d); const wd=(x.getDay()+6)%7; x.setDate(x.getDate()-wd); x.setHours(0,0,0,0); return +x }
function endOfWeek(d:Date){ const x=new Date(startOfWeek(d)); x.setDate(x.getDate()+6); x.setHours(23,59,59,999); return +x }

export default function AffirmationCard({milestones, onUserWrite}:{milestones:Milestone[]; onUserWrite:(text:string)=>void}) {
  const now = new Date()
  const todayList = useMemo(()=>milestones.filter(m=>m.ts>=startOfDay(now) && m.ts<=endOfDay(now)), [milestones])
  const weekList = useMemo(()=>milestones.filter(m=>m.ts>=startOfWeek(now) && m.ts<=endOfWeek(now)), [milestones])

  const daily = useMemo(()=>shortAffirmationDaily(todayList), [todayList])
  const weekly = useMemo(()=>shortAffirmationWeekly(weekList), [weekList])

  const [tab, setTab] = useState<"day"|"week">("day")
  const show = tab==="day" ? daily : weekly
  const [userText, setUserText] = useState("")
  const rec = useMemo(()=>createSTT((t)=>setUserText(t)), [])

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">自我肯定 · Self-Affirmation</div>
        <div className="flex rounded-lg overflow-hidden border">
          <button onClick={()=>setTab("day")} className={`px-3 py-1 text-sm ${tab==="day"?"bg-indigo-600 text-white":"bg-white hover:bg-slate-50"}`}>今天</button>
          <button onClick={()=>setTab("week")} className={`px-3 py-1 text-sm ${tab==="week"?"bg-indigo-600 text-white":"bg-white hover:bg-slate-50"}`}>本周</button>
        </div>
      </div>

      <div className="mt-3 text-sm bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
        {show}
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={()=>speak(show)} className="rounded-xl px-3.5 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-500">朗读</button>
        {rec ? (
          <button onClick={()=>{ try{ (rec as any).start() }catch{} }} className="rounded-xl px-3.5 py-2 text-sm bg-white hover:bg-slate-100 border">我来读（语音）</button>
        ) : null}
      </div>

      <div className="mt-3">
        <input
          value={userText}
          onChange={e=>setUserText(e.target.value)}
          placeholder="也请你用 1 句话肯定自己（可语音输入或直接键入）"
          className="w-full rounded-xl border px-3 py-2 bg-white/90"
        />
        <div className="mt-2 text-right">
          <button onClick={()=>{ if(userText.trim()) onUserWrite(userText.trim()); setUserText("") }}
                  className="rounded-xl px-3.5 py-2 text-sm bg-white hover:bg-slate-100 border">保存到成功账本</button>
        </div>
      </div>
    </div>
  )
}
