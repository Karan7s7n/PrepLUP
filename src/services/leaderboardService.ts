import { supabase } from "./supabase"

export async function getLeaderboard() {
  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .order("points", { ascending: false })
    .limit(10)

  return data
}
