import { Navigate, Outlet, useLocation } from "react-router-dom"
import { LoadingState } from "@/components/LoadingState"
import { useAuth } from "@/auth/AuthContext"

export function ProtectedRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState fullScreen label="Checking session…" />
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
