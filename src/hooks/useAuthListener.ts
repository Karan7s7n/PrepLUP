import { useEffect } from "react"
import { supabase } from "../services/supabase"
import { useAuthStore } from "../store/authStore"

export const useAuthListener = () => {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])
}
