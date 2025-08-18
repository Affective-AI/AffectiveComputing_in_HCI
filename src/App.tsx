import { Routes, Route, useNavigate } from "react-router-dom"
import Home from "./pages/Home"
import Detail from "./pages/Detail"

export default function App() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={()=>nav("/")} className="text-xl font-bold tracking-tight inline-flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Kairos · PhD
            </span>
          </button>
          <div className="text-sm text-slate-500">Transactional Stress & Coping</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stress/:id" element={<Detail />} />
        </Routes>
      </div>
    </div>
  )
}
