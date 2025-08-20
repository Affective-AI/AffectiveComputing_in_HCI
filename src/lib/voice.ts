export function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = "zh-CN"
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {}
}

export function createSTT(onResult:(text:string)=>void) {
  const AnyWin = window as any
  if (!AnyWin.webkitSpeechRecognition) return null
  const rec = new AnyWin.webkitSpeechRecognition()
  rec.lang = "zh-CN"
  rec.interimResults = false
  rec.maxAlternatives = 1
  rec.onresult = (e:any) => {
    const t = e.results[0][0].transcript
    onResult(t)
  }
  return rec
}
