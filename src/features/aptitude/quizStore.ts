import { create } from "zustand"

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
}

interface QuizState {
  questions: Question[]
  currentIndex: number
  answers: Record<string, string>
  startTime: number
  setQuestions: (q: Question[]) => void
  answerQuestion: (id: string, answer: string) => void
  next: () => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: Date.now(),

  setQuestions: (q) =>
    set({ questions: q, currentIndex: 0, answers: {}, startTime: Date.now() }),

  answerQuestion: (id, answer) =>
    set((state) => ({
      answers: { ...state.answers, [id]: answer },
    })),

  next: () =>
    set((state) => ({
      currentIndex: state.currentIndex + 1,
    })),

  reset: () =>
    set({
      questions: [],
      currentIndex: 0,
      answers: {},
    }),
}))
