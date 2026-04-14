import { create } from "zustand"
import { supabase } from "../services/supabase"

interface AuthState {
  user: any
  loading: boolean
  setUser: (user: any) => void
  signUp: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }), // ✅ FIX

  fetchUser: async () => {
    const { data } = await supabase.auth.getUser()
    set({ user: data.user, loading: false })
  },

  signUp: async (email, password) => {
    await supabase.auth.signUp({ email, password })
  },

  login: async (email, password) => {
    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    set({ user: data.user })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
