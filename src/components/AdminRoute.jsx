import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function AdminRoute() {
  const profile = useAuthStore((s) => s.profile)

  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
