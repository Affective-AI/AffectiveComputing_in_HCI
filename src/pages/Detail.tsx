// src/pages/Detail.tsx
import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { addStrength, getStress, StrengthItem, StressDetail } from "../api/stress"
import MiniSparkline from "../components/MiniSparkline"

export default function Detail() {
  const { id } = useParams()
  const nav = useNavigate()
  const sid = Number(id)

  const [detail, setDetail] = useState<StressDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!sid) {
      setError("无效的压力 ID")
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const d = await getStress(sid)
      setDetail(d)
    } catch (e: any) {
      setError(e?.message || "加载失败")
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [sid])

  const points = useMemo(
    () => (detail?.history || []).map((h) => ({ ts: new Date(h.ts).getTime(), value: h.strength })),
    [detail]
  )

  return (
    <div className="space-y-6">
      {/* 顶部条 */}
      <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">压力详情</div>
          <div className="text-xl font-semibold">{detail?.title || "…"}</div>
          {detail?.description ? <div className="text-sm text-slate-600 mt-1">{detail.description}</div> : null}
        </div>
        <button onClick={() => nav("/")} className="rounded-lg border px-2.5 py-1 text-xs bg-white hover:bg-slate-100">
          返回
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">加载中…</div>
      ) : error ? (
        <div className="text-sm text-rose-600">{error}</div>
      ) : !detail ? (
        <div className="text-sm text-rose-600">未找到该压力。</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：趋势 + 追加强度 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border bg-white/80 backdrop-blur p-4">
              <div className="font-semibold mb-2">强度趋势</div>
              <div className="text-indigo-600">
                <MiniSparkline points={points} />
              </div>
            </div>

            <AddStrengthBox sid={sid} last={detail.history.at(-1) || null} onSaved={refresh} />
          </div>

          {/* 右侧：时间线 */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white/80 backdrop-blur p-4">
              <div className="font-semibold mb-2">强度历史</div>
              {detail.history.length === 0 ? (
                <div className="text-sm text-slate-500">暂无历史记录</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {detail.history.slice().reverse().map((h) => (
                    <li key={h.id} className="flex items-start justify-between gap-2">
                      <div className="text-slate-700">
                        <span className="font-medium">强度 {h.strength}</span>
                        {h.note ? <span className="text-slate-500"> · {h.note}</span> : null}
                        {h.source ? <span className="text-slate-400"> · {h.source}</span> : null}
                      </div>
                      <div className="text-xs text-slate-500">{new Date(h.ts).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function AddStrengthBox({
  sid,
  last,
  onSaved,
}: {
  sid: number
  last: StrengthItem | null
  onSaved: () => void
}) {
  const [val, setVal] = useState<number>(last ? last.strength : 5)
  const [note, setNote] = useState("")
  const [source, setSource] = useState<"manual" | "plan" | "practice" | "auto" | "other">("manual")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    if (saving) return
    setSaving(true)
    setErr(null)
    try {
      await addStrength(sid, { strength: val, note: note.trim() || undefined, source })
      setNote("")
      onSaved()
    } catch (e: any) {
      setErr(e?.message || "保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-white/80 backdrop-blur p-4">
      <div className="font-semibold mb-2">追加一次强度记录</div>
      <div className="text-sm text-slate-600 mb-3">
        {last ? (
          <>
            上次强度 <span className="font-medium">{last.strength}</span> · {new Date(last.ts).toLocaleString()}
          </>
        ) : (
          "第一次记录"
        )}
      </div>

      <label className="block text-sm text-slate-600 mb-1">当前强度：{val}</label>
      <input type="range" min={0} max={10} value={val} onChange={(e) => setVal(parseInt(e.target.value))} className="w-full accent-indigo-600" />

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-600 mb-1">备注（可选）</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：完成一次 3 步计划后再评估"
            className="w-full rounded-xl border px-3 py-2 bg-white/90"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">来源</label>
          <select value={source} onChange={(e) => setSource(e.target.value as any)} className="w-full rounded-xl border px-3 py-2 bg-white/90">
            <option value="manual">手动</option>
            <option value="plan">微计划</option>
            <option value="practice">身心练习</option>
            <option value="auto">自动</option>
            <option value="other">其他</option>
          </select>
        </div>
      </div>

      {err && <div className="text-sm text-rose-600 mt-2">{err}</div>}

      <div className="mt-4 flex justify-end">
        <button
          disabled={saving}
          onClick={submit}
          className={`rounded-xl px-3.5 py-2 text-sm ${saving ? "bg-indigo-300 text-white/80" : "bg-indigo-600 text-white hover:bg-indigo-500"}`}
        >
          保存一次强度
        </button>
      </div>
    </div>
  )
}
