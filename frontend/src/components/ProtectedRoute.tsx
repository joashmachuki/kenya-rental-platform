import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireLandlord?: boolean
  requireAdmin?: boolean
  requireVerified?: boolean
}

export default function ProtectedRoute({ children, requireLandlord, requireAdmin, requireVerified }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireLandlord && user?.role !== 'landlord') {
    return <Navigate to="/dashboard" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (requireVerified && user?.role === 'landlord') {
    if (!user?.phone_verified) {
      return <Navigate to="/verify-phone" replace />
    }
    if (user?.verification_status !== 'verified') {
      return <Navigate to="/verify-identity" replace />
    }
  }

  return <>{children}</>
}
