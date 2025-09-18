import { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, Lock, Info, User } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  showAuthPrompt?: boolean
  onAuthRequired?: () => void
  // New props for optional auth flow
  requireAuth?: boolean
  optionalMessage?: string
  feature?: string
}

const AuthGuard = ({ 
  children, 
  fallback, 
  showAuthPrompt = true, 
  onAuthRequired,
  requireAuth = false, // Default to optional
  optionalMessage,
  feature = "this feature"
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    )
  }

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>
  }

  // Only block if auth is explicitly required
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showAuthPrompt) {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <h3 className="text-blue-800 font-semibold">Sign In for Enhanced Features</h3>
              <p className="text-blue-700 text-sm mt-1">
                {optionalMessage || `Sign in to access ${feature} and track your activity.`}
              </p>
              <p className="text-blue-600 text-xs mt-2">
                💡 You can still use the main app features without signing in!
              </p>
            </div>
            {onAuthRequired && (
              <button
                onClick={onAuthRequired}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <User className="w-4 h-4" />
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

// New component for strict authentication (when actually needed)
export const StrictAuthGuard = ({ 
  children, 
  fallback, 
  showAuthPrompt = true, 
  onAuthRequired,
  feature = "this feature"
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showAuthPrompt) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Authentication Required</h3>
              <p className="text-red-700 text-sm mt-1">
                You must be signed in to access {feature}.
              </p>
            </div>
            {onAuthRequired && (
              <button
                onClick={onAuthRequired}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Sign In Required
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

// Optional Auth Guard for features that benefit from auth but don't require it
export const OptionalAuthGuard = ({ 
  children, 
  onAuthRequired,
  feature = "enhanced features"
}: AuthGuardProps) => {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      {/* Always show the children */}
      {children}
      
      {/* Show optional sign-in prompt if not authenticated */}
      {!isAuthenticated && onAuthRequired && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <h4 className="text-yellow-800 font-medium text-sm">Want to track your activity?</h4>
              <p className="text-yellow-700 text-xs mt-1">
                Sign in to access {feature} and get personalized updates.
              </p>
            </div>
            <button
              onClick={onAuthRequired}
              className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg hover:bg-yellow-300 transition-colors text-xs font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthGuard
