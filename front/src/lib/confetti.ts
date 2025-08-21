// 轻量 confetti：创建临时 canvas，随机彩条下落 ~800ms
export function fireConfetti() {
  const c = document.createElement('canvas')
  c.style.position = 'fixed'
  c.style.left = '0'
  c.style.top = '0'
  c.style.width = '100%'
  c.style.height = '100%'
  c.style.pointerEvents = 'none'
  c.style.zIndex = '9999'
  document.body.appendChild(c)

  const ctx = c.getContext('2d')!
  const W = c.width = window.innerWidth
  const H = c.height = window.innerHeight

  const N = 120
  const parts = Array.from({length: N}).map(()=>({
    x: Math.random()*W,
    y: -20 - Math.random()*H*0.3,
    r: 4 + Math.random()*4,
    vx: -1 + Math.random()*2,
    vy: 2 + Math.random()*3,
    a: Math.random()*Math.PI*2,
    va: -0.2 + Math.random()*0.4,
    color: `hsl(${Math.floor(Math.random()*360)},90%,60%)`
  }))

  let t = 0
  function loop() {
    t += 1
    ctx.clearRect(0,0,W,H)
    for (const p of parts) {
      p.x += p.vx
      p.y += p.vy
      p.a += p.va
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.a)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r)
      ctx.restore()
    }
    if (t < 90) requestAnimationFrame(loop)
    else document.body.removeChild(c)
  }
  loop()
}
