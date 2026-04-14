import { supabase } from "./supabase"

export async function updateProgress(userId: string) {
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!data) {
    await supabase.from("user_progress").insert({
      user_id: userId,
      points: 10,
      streak: 1,
      last_active: today,
    })
    return
  }

  const last = data.last_active
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().split("T")[0]

  let streak = data.streak

  if (last === yStr) streak += 1
  else if (last !== today) streak = 1

  await supabase.from("user_progress").update({
    points: data.points + 10,
    streak,
    last_active: today,
  }).eq("user_id", userId)
}
