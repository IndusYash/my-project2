import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, AlertCircle, ArrowLeft, Gift, Star, CheckCircle, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SignupCredentials } from '../../types'

interface SignupFormProps {
  onSwitchToLogin: () => void
  onClose: () => void
  isOptional?: boolean // ✅ Add optional prop
}

const SignupForm = ({ onSwitchToLogin, onClose, isOptional = true }: SignupFormProps) => {
  const { signup, isLoading } = useAuth()
  const [formData, setFormData] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    try {
      await signup(formData)
      onClose() // Close modal on successful signup
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ✅ Header with optional messaging */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">JH</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isOptional ? 'Join the Community!' : 'Create Account'}
        </h2>
        <p className="text-gray-600">
          {isOptional 
            ? 'Unlock enhanced features and help improve Jharkhand'
            : 'Join Jharkhand CivicReport community'
          }
        </p>
        {isOptional && (
          <p className="text-sm text-green-600 mt-2">
            🎁 Optional • Get exclusive benefits for contributing citizens
          </p>
        )}
      </div>

      {/* ✅ Skip option for optional auth */}
      {isOptional && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-800 transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Continue without creating account</span>
          </button>
        </div>
      )}

      {/* ✅ Benefits Section for Optional Auth */}
      {isOptional && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">
                🌟 What you'll get as a registered citizen:
              </h3>
              <ul className="space-y-1">
                {[
                  'Real-time SMS updates on your reports',
                  'Personal dashboard to track all submissions',
                  'Community badges for helping improve Jharkhand',
                  'Priority support for urgent civic issues',
                  'Direct feedback from government departments'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-green-800">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
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
              placeholder="Enter your email for updates"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            📧 We'll send you updates on your civic reports
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="+91 12345 67890"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            📱 For SMS alerts when your reports are resolved
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
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
              placeholder="Create a secure password (min 6 chars)"
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ✅ Privacy & Terms Notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              By creating an account, you agree to help improve Jharkhand through civic participation. 
              Your data is protected by Government of Jharkhand privacy policies.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating your account...
            </>
          ) : (
            <>
              <Star className="w-5 h-5" />
              {isOptional ? 'Join the Community' : 'Create Account'}
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isOptional ? 'Sign in instead' : 'Sign in here'}
          </button>
        </p>
      </div>

      {/* ✅ Trust Indicators */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>Trusted</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          🏛️ Government of Jharkhand • Digital India Initiative
        </p>
      </div>
    </div>
  )
}

export default SignupForm
