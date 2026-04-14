import { create } from "zustand"

export const useNotificationStore = create((set) => ({
  messages: [],
  add: (msg: string) =>
    set((s: any) => ({
      messages: [...s.messages, msg],
    })),
}))
