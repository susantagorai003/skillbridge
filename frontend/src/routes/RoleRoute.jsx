import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Spinner from '../components/common/Spinner'

export default function RoleRoute({ children, roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
