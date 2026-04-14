import { create } from "zustand"
import type { ResumeData } from "../../types/resume"

interface State {
  data: ResumeData
  setData: (data: Partial<ResumeData>) => void
}

export const useResumeStore = create<State>((set) => ({
  data: {
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
  },

  setData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
}))
