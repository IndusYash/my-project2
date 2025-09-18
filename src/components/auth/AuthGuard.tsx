import { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, Lock } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  showAuthPrompt?: boolean
  onAuthRequired?: () => void
}

const AuthGuard = ({ 
  children, 
  fallback, 
  showAuthPrompt = true, 
  onAuthRequired 
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showAuthPrompt) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-yellow-600" />
            <div className="flex-1">
              <h3 className="text-yellow-800 font-semibold">Authentication Required</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Please sign in to access this feature and help improve your community.
              </p>
            </div>
            {onAuthRequired && (
              <button
                onClick={onAuthRequired}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return <>{children}</>
}

export default AuthGuard