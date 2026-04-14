import { supabase } from "./supabase";

export async function saveFullSession(
  userId: string,
  role: string,
  questions: any[],
  answers: any,
  feedback: any,
  avgScore: number
) {
  const { data, error } = await supabase
    .from("interview_full_sessions")
    .insert({
      user_id: userId,
      role,
      questions,
      answers,
      feedback,
      average_score: avgScore,
    })
    .select()
    .single();

  if (error) {
    console.error("SAVE ERROR:", error);
    throw error;
  }

  return data;
}
