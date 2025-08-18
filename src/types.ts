export type Stress = {
    id: string
    title: string
    tags: string[]
    history: Array<{ ts: number; strength: number }>
    notes: TimelineNode[]
    messages: ChatMsg[]
  }
  
  export type TimelineKind = "context" | "appraise" | "plan" | "soothe" | "result"
  export type TimelineNode = {
    id: string
    ts: number
    kind: TimelineKind
    title: string
    meta?: any
  }
  
  export type ChatRole = "user" | "agent"
  export type ChatMode = "appraise" | "coach" | "soother" | undefined
  
  export type ChatMsg = {
    id: string
    role: ChatRole
    mode?: ChatMode
    text: string
    payload?: any
    ts: number
  }
  
  export type LogEvent = {
    ts: number
    site?: string
    event: string
    durationMin?: number
    typing?: number
    count?: number
    meta?: any
  }
  
  export type Milestones = {
    focus25: number
    deepReads: number
    charsApprox: number
    nightMin: number
  }
  
  export type Signal = {
    id: string
    ts: number
    kind: "writing_stall" | "switch_spike" | string
    text: string
    cta: { label: string; action: string }[]
  }
  