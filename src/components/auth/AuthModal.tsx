import { useState } from 'react'
import { X, Info, Star, CheckCircle, Shield } from 'lucide-react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
  // New props for optional auth messaging
  isOptional?: boolean
  feature?: string
  benefits?: string[]
}

const AuthModal = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login',
  isOptional = true, // Default to optional
  feature = "enhanced features",
  benefits = [
    "Track your report status and get updates",
    "View your submission history",
    "Get notified when issues are resolved",
    "Build your community contribution profile"
  ]
}: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            {isOptional && (
              <p className="text-sm text-gray-500 mt-1">
                Optional • Access {feature}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Benefits Section */}
        {isOptional && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  🎯 Why sign in? (Optional but helpful!)
                </h3>
                <ul className="space-y-1">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-blue-800">
                      <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-blue-700 mt-2 font-medium">
                  💡 You can always use the app without signing in!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Skip Option for Optional Auth */}
        {isOptional && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors py-1"
            >
              Skip for now →
            </button>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          {activeTab === 'login' ? (
            <LoginForm
              onSwitchToSignup={() => setActiveTab('signup')}
              onClose={onClose}
              isOptional={isOptional}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setActiveTab('login')}
              onClose={onClose}
              isOptional={isOptional}
            />
          )}
        </div>

        {/* Government Branding */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            🏛️ <strong>Government of Jharkhand Digital Initiative</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure • Private • Serving Citizens with Technology
          </p>
        </div>

        {/* Demo Credentials (if in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
            <div className="text-center">
              <p className="text-xs text-yellow-800 font-medium mb-1">🧪 Demo Credentials:</p>
              <div className="text-xs text-yellow-700 space-y-0.5">
                <p>📧 <strong>demo@jharkhand.gov.in</strong></p>
                <p>🔐 <strong>demo123</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthModal
