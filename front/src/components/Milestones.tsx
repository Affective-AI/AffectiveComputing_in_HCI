import type { Milestones as M } from "../types"
// import { Timer, BookOpen, FileText, Moon } from "lucide-react"

export default function Milestones({m}:{m:M}) {
  return (
    <div className="space-y-3 text-sm">
      <Row icon="⏱️" label="≥25min 专注段" value={`${m.focus25} 次`} />
      <Row icon="📚" label="深读论文(≥90s)" value={`${m.deepReads} 篇`} />
      <Row icon="📝" label="Overleaf 估算字符" value={`${m.charsApprox}`} />
      <Row icon="🌙" label="夜间活跃" value={`${m.nightMin} 分钟`} />
    </div>
  )
}

function Row({icon, label, value}:{icon:React.ReactNode; label:string; value:string}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="inline-flex items-center gap-2 text-slate-600">
        <span className="text-indigo-600">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  )
}
