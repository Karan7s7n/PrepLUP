import { supabase } from "./supabase"

export async function getUserStats(userId: string) {
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("user_id", userId)

  if (!tests) return null

  const totalTests = tests.length

  const totalScore = tests.reduce((sum, t) => sum + t.score, 0)
  const totalQuestions = tests.reduce((sum, t) => sum + t.total_questions, 0)

  const accuracy = totalQuestions
    ? (totalScore / totalQuestions) * 100
    : 0

  return {
    totalTests,
    accuracy,
    tests,
  }
}
