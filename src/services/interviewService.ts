import { supabase } from "./supabase";

export async function getInterviewQuestions(role: string) {
  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .or(`role.eq.${role},role.eq.general`);

  if (error) throw error;
  return data;
}

export async function saveInterview(
  userId: string,
  role: string,
  responses: any[]
) {
  const { data: session } = await supabase
    .from("interview_sessions")
    .insert({ user_id: userId, role })
    .select()
    .single();

  const rows = responses.map((r) => ({
    session_id: session.id,
    question_id: r.question_id,
    answer: r.answer,
    feedback: JSON.stringify(r.feedback),
    score: r.score,
    user_id: userId,
  }));

  await supabase.from("interview_responses").insert(rows);

  return session;
}
