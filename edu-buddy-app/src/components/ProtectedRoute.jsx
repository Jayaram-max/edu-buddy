import { Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
          </div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}
