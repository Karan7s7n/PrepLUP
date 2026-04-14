import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function ProtectedRoute({ children }: any) {
  const { user, loading } = useAuthStore()

  if (loading) return <div>Loading...</div>

  return user ? children : <Navigate to="/login" />
}
