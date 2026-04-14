export function calculateResult(questions: any[], answers: any) {
  let correct = 0

  const details = questions.map((q) => {
    const isCorrect = answers[q.id] === q.correct_answer
    if (isCorrect) correct++

    return {
      question_id: q.id,
      selected: answers[q.id],
      correct: q.correct_answer,
      isCorrect,
    }
  })

  return {
    score: correct,
    total: questions.length,
    accuracy: (correct / questions.length) * 100,
    details,
  }
}
