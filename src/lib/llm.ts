// Stubbed LLM logic; replace with your backend API later
import type { ChatMsg } from "@/types"
import { rid } from "./utils"

export function scoutSuggest(userText: string, context?: any) {
  const lower = (userText||"").toLowerCase()
  if (lower.includes("引言") || lower.includes("write") || context?.overleafStall) {
    return { stress_type:"写作卡顿", gate:"problem_focused", rationale:["Overleaf 长停留且低输入","用户自报写作困难"] }
  }
  if (lower.includes("等待") || lower.includes("审稿")) {
    return { stress_type:"结果等待", gate:"emotion_focused", rationale:["不可控情境","建议先调节情绪"] }
  }
  return { stress_type:"一般任务压力", gate:"problem_focused", rationale:["默认路径"] }
}

export function coachPlan(_: string) {
  return {
    plan: ["列出本段的3个小标题","每个小标题写2句事实性描述","导出或复制200字草稿"],
    timebox: "<=45min",
    success_criteria: ["新增≥150字","完成3个小标题"],
    fallback: "若10分钟无进展，改用‘复述参考论文2句’作为起点"
  }
}

export function sootherPack() {
  return {
    technique:"4–6 呼吸 x 8 轮",
    duration_min:3,
    script:[
      "坐直，双脚着地，肩颈放松。",
      "吸气 4 拍 —— 保持肩膀不耸起。",
      "呼气 6 拍 —— 像慢慢放下背包。",
      "重复 8 次，注意下颌与眉间放松。",
      "结束时，问自己：此刻我能做的一件小事是什么？"
    ],
    reappraisal_prompt:"把‘写不出来’改写成‘先写两句事实’，是否可行？"
  }
}

export function agentMsgFromPlan(plan: any): ChatMsg {
  return {
    id: rid(),
    role: "agent",
    mode: "coach",
    ts: Date.now(),
    text: `给你一个可执行的 3 步小计划（总时长 ${plan.timebox}）：`,
    payload: plan
  }
}

export function agentMsgFromSoother(pack: any): ChatMsg {
  return {
    id: rid(),
    role: "agent",
    mode: "soother",
    ts: Date.now(),
    text: `来一个 ${pack.duration_min} 分钟的小练习：${pack.technique}`,
    payload: pack
  }
}
