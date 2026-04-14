import { supabase } from "./supabase"

export async function saveTest(userId: string, result: any, meta: any) {
  const { data: test } = await supabase
    .from("tests")
    .insert({
      user_id: userId,
      category: meta.category,
      difficulty: meta.difficulty,
      score: result.score,
      total_questions: result.total,
    })
    .select()
    .single()

  const rows = result.details.map((d: any) => ({
    test_id: test.id,
    question_id: d.question_id,
    selected_answer: d.selected,
    is_correct: d.isCorrect,
  }))

  await supabase.from("test_results").insert(rows)
}
