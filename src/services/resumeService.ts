import { supabase } from "./supabase"

export async function saveResume(userId: string, data: any) {
  await supabase.from("resumes").insert({
    user_id: userId,
    title: data.name,
    data,
  })
}
