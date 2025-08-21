import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { apiLogin, apiRegister } from "../api/auth"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const next = sp.get("next") || "/"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "login") {
        await apiLogin({ username: username.trim(), password })
         // 可选：探测一次，便于你在 Network 面板确认
        try { await fetch("/api/auth/me", { credentials: "include" }) } catch {}
        // 关键：硬跳转，保证 App 重新挂载并刷新鉴权
        window.location.replace(next)
      } else {
        await apiRegister({ username: username.trim(), name: (name || username).trim(), password })
        await apiLogin({ username: username.trim(), password })
      }
      nav(next, { replace: true })
    } catch (err: any) {
      setError(err.message || "请求失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{mode === "login" ? "登录" : "注册"}</h1>
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-sm text-indigo-600 hover:underline"
          >
            {/* {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"} */}
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm text-slate-600 mb-1">用户名</label>
            <input
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              required
              className="w-full rounded-xl border px-3 py-2 bg-white"
              placeholder="如：小王 / alice"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm text-slate-600 mb-1">昵称（显示名，可与用户名相同）</label>
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 bg-white"
                placeholder="如：王同学 / Alice W."
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border px-3 py-2 bg-white"
              placeholder="至少 8 位"
            />
          </div>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <button
            disabled={loading}
            className={`w-full rounded-xl px-3.5 py-2 text-sm font-medium transition ${loading?"bg-indigo-300 text-white":"bg-indigo-600 text-white hover:bg-indigo-500"}`}
          >
            {loading ? "请稍候…" : (mode === "login" ? "登录" : "注册并登录")}
          </button>
        </form>
      </div>
    </div>
  )
}
