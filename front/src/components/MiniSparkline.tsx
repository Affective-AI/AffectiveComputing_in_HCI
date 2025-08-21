// src/components/MiniSparkline.tsx
import React from "react"

type Point = { ts: number; value: number }

export default function MiniSparkline({ points, height = 80 }: { points: Point[]; height?: number }) {
  if (!points || points.length === 0) return <div className="text-sm text-slate-500">暂无数据</div>

  const w = Math.max(200, points.length * 30) // 自适应宽度
  const xs = points.map((p, i) => (i / (points.length - 1 || 1)) * (w - 8) + 4)
  const ys = (() => {
    const vs = points.map((p) => p.value)
    const min = Math.min(...vs)
    const max = Math.max(...vs)
    const scale = (v: number) => {
      if (max === min) return height / 2
      // 数值大在上方，0-10 → 上下内边距 6px
      const t = (v - min) / (max - min)
      return (height - 12) * (1 - t) + 6
    }
    return points.map((p) => scale(p.value))
  })()

  const path = points.map((_, i) => `${i === 0 ? "M" : "L"} ${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`).join(" ")

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={height}>
        <rect x={0} y={0} width={w} height={height} fill="white" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
        {points.map((_, i) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r={3} fill="currentColor" />
        ))}
      </svg>
    </div>
  )
}
