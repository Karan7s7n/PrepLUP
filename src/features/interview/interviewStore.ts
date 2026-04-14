import { create } from "zustand"

interface State {
  questions: any[]
  current: number
  answers: Record<string, string>
  setQuestions: (q: any[]) => void
  answer: (id: string, text: string) => void
  next: () => void
}

export const useInterviewStore = create<State>((set) => ({
  questions: [],
  current: 0,
  answers: {},

  setQuestions: (q) => set({ questions: q, current: 0, answers: {} }),

  answer: (id, text) =>
    set((s) => ({
      answers: { ...s.answers, [id]: text },
    })),

  next: () =>
    set((s) => ({
      current: s.current + 1,
    })),
}))
