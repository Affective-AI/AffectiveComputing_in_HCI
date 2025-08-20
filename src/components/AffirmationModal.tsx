import { useMemo, useState } from "react"
import type { Milestone } from "../types"
import { speak, createSTT } from "../lib/voice"
import { affirmForMilestone } from "../lib/affirmation"

export default function AffirmationModal({
  milestone,
  onClose,
  onSave, // 把用户的一句话写入成功账本
}: {
  milestone: Milestone
  onClose: () => void
  onSave: (text: string) => void
}) {
  const suggestion = useMemo(()=>affirmForMilestone(milestone), [milestone])
  const [userText, setUserText] = useState("")
  const [done, setDone] = useState(false)
  const rec = useMemo(()=>createSTT((t)=>setUserText(t)), [])

  function handleFinish() {
    const text = userText.trim() || suggestion
    onSave(text)
    setDone(true)
    setTimeout(onClose, 900)
  }

  const dateLabel = new Date(milestone.ts).toLocaleDateString()

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/60 bg-white/90 backdrop-blur shadow-2xl p-6 relative overflow-hidden">
        {/* 仪式感动画 */}
        {done && <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 via-white/0 to-fuchsia-200/50 animate-pulse" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-indigo-500 to-emerald-400" />
        </div>}

        <div className="text-xs text-slate-500">{dateLabel} · 自我肯定</div>
        <div className="text-lg font-semibold mt-1">{milestone.title}</div>

        <div className="mt-3 text-sm bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
          {suggestion}
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={()=>speak(suggestion)} className="rounded-xl px-3.5 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-500">朗读</button>
          {rec ? (
            <button onClick={()=>{ try{ (rec as any).start() }catch{} }} className="rounded-xl px-3.5 py-2 text-sm bg-white hover:bg-slate-100 border">我来读（语音）</button>
          ) : null}
        </div>

        <div className="mt-3">
          <input
            value={userText}
            onChange={e=>setUserText(e.target.value)}
            placeholder="也请你用 1 句话肯定自己（可语音输入或直接键入）"
            className="w-full rounded-xl border px-3 py-2 bg-white"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-3.5 py-2 text-sm bg-white hover:bg-slate-100 border">稍后</button>
          <button onClick={handleFinish} className="rounded-xl px-3.5 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-500">完成</button>
        </div>
      </div>
    </div>
  )
}
