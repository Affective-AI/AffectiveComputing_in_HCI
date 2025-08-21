import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import Home from "./pages/Home"
import Detail from "./pages/Detail"
import LoginPage from "./pages/Login"
import { apiMe, apiLogout } from "./api/auth"

type User = { id: number; name: string; username: string }

export default function App() {
  const nav = useNavigate()
  const loc = useLocation()

  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(true)

  // 启动时检查登录态
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const u = await apiMe()
        if (alive) setUser(u)
      } catch {
        if (alive) setUser(null)
      } finally {
        if (alive) setBooting(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  async function handleLogout() {
    try {
      await apiLogout()
    } finally {
      setUser(null)
      nav("/login")
    }
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => nav("/")} className="text-xl font-bold tracking-tight inline-flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Kairos · PhD
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 hidden sm:block">Transactional Stress & Coping</div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Hi, {user.name || user.username}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border px-2.5 py-1 text-xs bg-white hover:bg-slate-100"
                >
                  退出
                </button>
              </div>
            ) : (
              loc.pathname !== "/login" && (
                <Link
                  to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`}
                  className="rounded-lg border px-2.5 py-1 text-xs bg-white hover:bg-slate-100"
                >
                  登录
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <Protected booting={booting} user={user}>
                <Home />
              </Protected>
            }
          />
          <Route
            path="/stress/:id"
            element={
              <Protected booting={booting} user={user}>
                <Detail />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function Protected({
  user,
  booting,
  children,
}: {
  user: User | null
  booting: boolean
  children: JSX.Element
}) {
  const loc = useLocation()
  if (booting) return <div className="text-sm text-slate-500">加载中…</div>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  return children
}
