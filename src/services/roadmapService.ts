import { supabase } from "./supabase"


export function generateRoadmap(role: string, days: number) {
  const topics: Record<string, string[]> = {
    frontend: [
      "HTML/CSS",
      "JavaScript",
      "React",
      "Projects",
      "DSA Basics",
    ],
    backend: [
      "Node.js",
      "Databases",
      "APIs",
      "Auth",
      "System Design",
    ],
  }

  const selected = topics[role] || topics.frontend

  const plan = []

  for (let i = 0; i < days; i++) {
    plan.push({
      day: i + 1,
      topic: selected[i % selected.length],
      task: `Study ${selected[i % selected.length]} + Practice`,
    })
  }

  return plan
}

export async function saveRoadmap(userId: string, role: string, days: number, plan: any) {
  await supabase.from("roadmap").insert({
    user_id: userId,
    role,
    days,
    plan,
  })
}