import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, ArrowLeft, Info } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { LoginCredentials } from '../../types'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onClose: () => void
  isOptional?: boolean // Add optional prop
}

const LoginForm = ({ onSwitchToSignup, onClose, isOptional = true }: LoginFormProps) => {
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    
    try {
      await login(formData)
      onClose() // Close modal on successful login
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  // Quick fill demo credentials
  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@jharkhand.gov.in',
      password: 'demo123'
    })
    setError(null)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header with optional messaging */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">JH</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isOptional ? 'Welcome!' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600">
          {isOptional 
            ? 'Sign in to unlock enhanced features and track your reports'
            : 'Sign in to your Jharkhand CivicReport account'
          }
        </p>
        {isOptional && (
          <p className="text-sm text-blue-600 mt-2">
            💡 Optional • You can continue without signing in
          </p>
        )}
      </div>

      {/* Skip option for optional auth */}
      {isOptional && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-800 transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Continue without signing in</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isOptional ? 'Create one (optional)' : 'Sign up here'}
          </button>
        </p>
      </div>

      {/* Enhanced Demo Credentials Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-blue-700 font-medium mb-2">🧪 Try the Demo:</p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>📧 <code className="bg-blue-100 px-1 rounded">demo@jharkhand.gov.in</code></p>
              <p>🔐 <code className="bg-blue-100 px-1 rounded">demo123</code></p>
            </div>
          </div>
          <button
            onClick={fillDemoCredentials}
            className="px-3 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium hover:bg-blue-300 transition-colors"
          >
            Auto-fill
          </button>
        </div>
      </div>

      {/* Benefits reminder for optional auth */}
      {isOptional && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs text-green-700 font-medium mb-1">✨ Benefits of signing in:</p>
          <ul className="text-xs text-green-600 space-y-0.5">
            <li>• Track your report status</li>
            <li>• Get SMS/email updates</li>
            <li>• View submission history</li>
            <li>• Earn community badges</li>
          </ul>
        </div>
      )}

      {/* Security & Privacy Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 Your data is secure and protected by Government of Jharkhand
        </p>
      </div>
    </div>
  )
}

export default LoginForm
