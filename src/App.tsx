import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import CameraCapture from './components/CameraCapture'
import IssueCategories from './components/IssueCategories'
import VoiceInput from './components/VoiceInput'
import AIAnalysis from './components/AIAnalysis'
import MapView from './components/MapView'
import LoadingScreen from './components/LoadingScreen'
import CommunityPage from './components/CommunityPage'
import UserProfile from './components/UserProfile'
import AuthModal from './components/auth/AuthModal'
import GeminiChatbot from './components/GeminiChatbot'
import AdminPanel from './Pages/AdminPanel'
import { analyzeImageWithGemini, testGeminiConnection } from './services/gemini'
import { DetectedIssue, IssueReport } from './types'
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  Send, 
  RefreshCw, 
  MapPin, 
  Clock, 
  User,
  MessageCircle,
  X,
  Settings,
  ArrowLeft
} from 'lucide-react'

// Citizen App Content Component
function CitizenAppContent() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Add loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Modal states
  const [showChatbot, setShowChatbot] = useState(false)
  const [showCommunity, setShowCommunity] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login')
  
  // Main app state
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [detectedIssues, setDetectedIssues] = useState<DetectedIssue[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [userComments, setUserComments] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Initialize app with loading screen
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing Jharkhand Civic Report App...')
      
      // Create demo user if not exists
      const existingUsers = localStorage.getItem('jharkhand-civic-users')
      if (!existingUsers) {
        const demoUser = {
          id: 'demo-user-1',
          name: 'Demo User',
          email: 'demo@jharkhand.gov.in',
          password: 'demo123',
          phone: '+91 98765 43210',
          joinedDate: new Date().toISOString(),
          isVerified: true
        }
        localStorage.setItem('jharkhand-civic-users', JSON.stringify([demoUser]))
        console.log('✅ Demo user created')
      }
      
      // Minimum loading time for better UX
      const minLoadingTime = 3000 // 3 seconds
      const startTime = Date.now()

      try {
        // Initialize API key check
        console.log('🔑 Checking Gemini API key...')
        const isValid = await testGeminiConnection()
        setApiKeyStatus(isValid ? 'valid' : 'invalid')
        console.log(isValid ? '✅ API key is valid' : '❌ API key is invalid')

        // Initialize location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              })
              console.log('📍 User location obtained:', {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              })
            },
            (error) => {
              console.warn('⚠️ Location access denied:', error.message)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          )
        } else {
          console.warn('⚠️ Geolocation not supported')
        }

        // Ensure minimum loading time for better UX
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime))
        }

      } catch (error) {
        console.error('❌ App initialization error:', error)
        setApiKeyStatus('invalid')
      } finally {
        console.log('✅ App initialization complete')
        setIsInitialLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleImageCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl)
    setIsAnalyzing(true)
    setError(null)
    
    try {
      console.log('🔍 Starting image analysis...')
      
      // Validate API key first
      if (apiKeyStatus === 'invalid') {
        throw new Error('Invalid Gemini API key. Please check your .env file and restart the server.')
      }

      // Analyze the image with Gemini AI
      console.log('🤖 Sending image to Gemini AI...')
      const issues = await analyzeImageWithGemini(imageDataUrl)
      
      console.log('✅ AI Analysis complete:', issues)
      setDetectedIssues(issues)
      
      // For authenticated users, set selected categories from AI
      // For anonymous users, they'll use AI categories directly
      if (isAuthenticated) {
        setSelectedCategories(issues.map((issue) => issue.category))
      }
      
      // Show success message if issues found
      if (issues.length > 0) {
        console.log(`🎯 Found ${issues.length} potential civic issue(s)`)
      } else {
        console.log('🔍 No issues detected by AI')
      }
      
    } catch (error: any) {
      console.error('❌ Error analyzing image:', error)
      setError(error.message || 'Failed to analyze image. Please try again.')
      setDetectedIssues([])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!capturedImage) {
      setError('Please capture an image first.')
      return
    }

    // For anonymous users, require AI-detected categories
    if (!isAuthenticated && detectedIssues.length === 0) {
      setError('No issues detected by AI. Please sign in to manually select categories or try a different image.')
      return
    }

    // For authenticated users, require at least one category (AI or manual)
    if (isAuthenticated && selectedCategories.length === 0) {
      setError('Please select at least one issue category.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('📤 Submitting civic issue report...')
      
      const report: IssueReport = {
        id: `JH-CIVIC-${Date.now()}`,
        image: capturedImage,
        categories: isAuthenticated ? selectedCategories : detectedIssues.map(issue => issue.category),
        comments: userComments.trim(),
        detectedIssues,
        timestamp: new Date().toISOString(),
        location: userLocation || undefined,
        userId: isAuthenticated ? user?.id : undefined,
        submissionType: isAuthenticated ? 'manual' : 'ai-only'
      }

      // Save to localStorage for demo (replace with actual API call)
      const existingReports = JSON.parse(localStorage.getItem('jharkhand-civic-reports') || '[]')
      existingReports.push(report)
      localStorage.setItem('jharkhand-civic-reports', JSON.stringify(existingReports))
      
      console.log('✅ Report saved successfully:', {
        id: report.id,
        categories: report.categories,
        hasLocation: !!report.location,
        timestamp: report.timestamp,
        userId: report.userId || 'anonymous',
        submissionType: report.submissionType
      })
      
      setSubmitted(true)
      
      // Auto-reset after 4 seconds
      setTimeout(() => {
        resetForm()
        setSubmitted(false)
      }, 4000)
      
    } catch (error: any) {
      console.error('❌ Error submitting report:', error)
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCapturedImage(null)
    setDetectedIssues([])
    setSelectedCategories([])
    setUserComments('')
    setError(null)
    console.log('🔄 Form reset - ready for new report')
  }

  const handleVoiceTranscript = (text: string) => {
    const trimmedText = text.trim()
    if (trimmedText) {
      const newComments = userComments 
        ? `${userComments} ${trimmedText}`
        : trimmedText
      setUserComments(newComments)
      console.log('🎤 Voice input added to comments:', trimmedText)
    }
  }

  // Authentication handlers
  const handleAuthClick = (tab: 'login' | 'signup' = 'login') => {
    console.log('🔐 Opening authentication modal')
    setAuthModalTab(tab)
    setShowAuthModal(true)
  }

  const closeAuthModal = () => {
    console.log('🔐 Closing authentication modal')
    setShowAuthModal(false)
  }

  // Map handlers
  const handleMapClick = () => {
    console.log('🗺️ Opening map view')
    setShowMap(true)
  }

  const closeMap = () => {
    console.log('🗺️ Closing map view')
    setShowMap(false)
  }

  // Community handlers
  const handleCommunityClick = () => {
    console.log('🏛️ Opening community page')
    setShowCommunity(true)
  }

  const closeCommunity = () => {
    console.log('🏛️ Closing community page')
    setShowCommunity(false)
  }

  // Profile handlers
  const handleProfileClick = () => {
    if (!isAuthenticated) {
      handleAuthClick('login')
      return
    }
    console.log('👤 Opening user profile')
    setShowProfile(true)
  }

  const closeProfile = () => {
    console.log('👤 Closing user profile')
    setShowProfile(false)
  }

  // Chatbot handlers
  const handleChatbotClick = () => {
    console.log('💬 Opening AI chatbot')
    setShowChatbot(true)
  }

  const closeChatbot = () => {
    console.log('💬 Closing AI chatbot')
    setShowChatbot(false)
  }

  // Admin panel handler
  const handleAdminClick = () => {
    console.log('🔧 Navigating to admin panel')
    navigate('/admin')
  }

  // Show loading screen while initializing
  if (isInitialLoading) {
    return <LoadingScreen />
  }

  // Success Screen (updated with anonymous support)
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar 
          onMapClick={handleMapClick} 
          onCommunityClick={handleCommunityClick}
          onProfileClick={handleProfileClick}
          onAuthClick={() => handleAuthClick()}
        />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Report Submitted Successfully! 🎉
            </h2>
            
            <div className="space-y-3 mb-8">
              <p className="text-gray-600 leading-relaxed">
                Thank you for reporting the civic issue. The Jharkhand Government authorities have been notified and will take appropriate action.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Report ID: JH-{Date.now().toString().slice(-6)}</span>
              </div>
              
              {userLocation && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>Location tracked and included</span>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  🏛️ Govt. of Jharkhand • Serving with Digital Innovation
                </p>
              </div>

              {/* Anonymous user suggestion */}
              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 mb-2">
                    💡 <strong>Want to track your reports?</strong>
                  </p>
                  <p className="text-xs text-yellow-700">
                    Sign up to get updates on your submissions and view your report history.
                  </p>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-300 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setSubmitted(false)}
                className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Report Another Issue
              </button>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCommunityClick}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  👥 Community Reviews
                </button>
                
                {isAuthenticated ? (
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    👤 My Profile
                  </button>
                ) : (
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 font-medium"
                  >
                    👤 Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar 
        onMapClick={handleMapClick} 
        onCommunityClick={handleCommunityClick}
        onProfileClick={handleProfileClick}
        onAuthClick={() => handleAuthClick()}
      />
      
      {/* Modal Components */}
      {showMap && <MapView onClose={closeMap} />}
      {showCommunity && <CommunityPage onClose={closeCommunity} />}
      {showProfile && <UserProfile onClose={closeProfile} />}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          defaultTab={authModalTab}
        />
      )}
      
      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                  <p className="text-sm text-gray-500">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={closeChatbot}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <GeminiChatbot className="h-[500px]" />
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Chatbot Button */}
      <button
        onClick={handleChatbotClick}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-40"
        title="Open AI Assistant"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header - Updated with optional sign-in */}
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-xl">JH</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Jharkhand CivicReport
            </h1>
            <p className="text-blue-600 font-semibold mb-4">
              A Govt. of Jharkhand Initiative
            </p>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Take a photo and let our AI identify civic problems automatically. Help make Jharkhand better!
            </p>
            
            {/* Status Indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm flex-wrap">
              {/* Authentication Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isAuthenticated ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-gray-500">
                  {isAuthenticated ? `Signed in as ${user?.name}` : 'Not signed in'}
                </span>
              </div>

              {/* API Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiKeyStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
                  apiKeyStatus === 'valid' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-gray-500">
                  {apiKeyStatus === 'checking' ? 'Checking AI service...' :
                   apiKeyStatus === 'valid' ? 'AI service ready' : 'AI service unavailable'}
                </span>
              </div>

              {/* Location Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  userLocation ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-gray-500">
                  {userLocation ? 'Location available' : 'Location unavailable'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
              {/* Admin Panel Button */}
              <button
                onClick={handleAdminClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                title="Access Admin Panel"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </button>

              {/* Optional Authentication Button */}
              {!isAuthenticated ? (
                <button
                  onClick={() => handleAuthClick('login')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  title="Optional: Sign in to track your reports"
                >
                  <User className="w-4 h-4" />
                  Sign In (Optional)
                </button>
              ) : (
                <button
                  onClick={handleProfileClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  title="View Profile"
                >
                  <User className="w-4 h-4" />
                  {user?.name}
                </button>
              )}
            </div>

            {/* Optional Benefits Message */}
            {!isAuthenticated && (
              <div className="mt-4 text-sm text-gray-600">
                <p>💡 No account needed to report issues!</p>
                <p className="text-xs">Sign in only if you want to track your reports and get updates.</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl animate-slide-up shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Dismiss error"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* API Key Warning */}
          {apiKeyStatus === 'invalid' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-xl animate-slide-up">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <div>
                  <h3 className="text-yellow-800 font-semibold">AI Service Configuration Required</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    Please add your Gemini API key to the .env file to enable AI analysis. Manual category selection is still available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Camera Section - NO AUTH REQUIRED */}
          {!capturedImage && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up border border-gray-100">
              <CameraCapture onImageCapture={handleImageCapture} />
            </div>
          )}

          {/* Analysis Results Section - Available for everyone */}
          {capturedImage && (
            <div className="space-y-8">
              
              {/* Captured Image Preview */}
              <div className="bg-white rounded-2xl shadow-xl p-6 animate-slide-up border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Captured Image</h2>
                      <p className="text-sm text-gray-500">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Take New Photo
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <div className="relative group">
                    <img 
                      src={capturedImage} 
                      alt="Captured civic issue" 
                      className="max-w-full max-h-96 rounded-xl shadow-lg border border-gray-200 group-hover:shadow-xl transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                </div>
                
                {/* Location Info */}
                {userLocation && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                    <button
                      onClick={handleMapClick}
                      className="text-blue-500 hover:text-blue-700 underline ml-2"
                    >
                      View on Map
                    </button>
                  </div>
                )}
              </div>

              {/* AI Analysis Results */}
              <AIAnalysis detectedIssues={detectedIssues} isAnalyzing={isAnalyzing} />

              {/* Category Selection - Conditional based on auth */}
              {isAuthenticated ? (
                <IssueCategories
                  selectedCategories={selectedCategories}
                  onSelectionChange={setSelectedCategories}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-6 animate-slide-up border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">AI-Detected Categories</h2>
                      <p className="text-sm text-gray-500">Categories automatically detected by our AI</p>
                    </div>
                  </div>

                  {detectedIssues.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {detectedIssues.map((issue, index) => (
                          <div
                            key={index}
                            className="p-4 bg-purple-50 border border-purple-200 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg">🤖</span>
                              </div>
                              <div>
                                <h3 className="font-medium text-purple-900 capitalize">{issue.category}</h3>
                                <p className="text-sm text-purple-700">
                                  {Math.round(issue.confidence * 100)}% confidence
                                </p>
                                <p className="text-xs text-purple-600 mt-1">{issue.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="text-blue-900 font-medium text-sm mb-1">
                              ✨ Want to manually select or add categories?
                            </h3>
                            <p className="text-blue-700 text-xs mb-3">
                              Sign in to get full control over category selection and improve AI accuracy through your feedback.
                            </p>
                            <button
                              onClick={() => handleAuthClick('signup')}
                              className="px-3 py-2 bg-blue-200 text-blue-800 rounded-lg text-xs font-medium hover:bg-blue-300 transition-colors"
                            >
                              Create Account for Manual Selection
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Categories Detected
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Our AI couldn't detect any civic issues in this image.
                      </p>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-yellow-900 font-medium text-sm mb-1">
                              Want to manually select categories?
                            </h4>
                            <p className="text-yellow-700 text-xs mb-3">
                              Anonymous users rely on AI detection only. Sign in to manually select issue categories when AI doesn't detect them.
                            </p>
                            <button
                              onClick={() => handleAuthClick('signup')}
                              className="px-3 py-2 bg-yellow-200 text-yellow-800 rounded-lg text-xs font-medium hover:bg-yellow-300 transition-colors"
                            >
                              Sign Up for Manual Categories
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6 animate-slide-up border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Additional Comments</h2>
                    <p className="text-sm text-gray-500">Optional but helpful for authorities</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={userComments}
                    onChange={(e) => setUserComments(e.target.value)}
                    placeholder="Add specific details about the location, urgency level, time of occurrence, or any other relevant information that would help authorities address this issue..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-gray-700 leading-relaxed min-h-[120px]"
                    rows={4}
                  />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{userComments.length} characters</span>
                    {userComments.length > 500 && (
                      <span className="text-yellow-600">Consider keeping it concise for better readability</span>
                    )}
                  </div>
                </div>
                
                {/* Voice Input Component */}
                <VoiceInput onTranscript={handleVoiceTranscript} />
              </div>

              {/* Submit Button */}
              <div className="text-center animate-slide-up">
                <div className="space-y-4">
                  <button
                    onClick={handleSubmitReport}
                    disabled={isSubmitting || (isAuthenticated && selectedCategories.length === 0) || (!isAuthenticated && detectedIssues.length === 0) || isAnalyzing}
                    className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 mx-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Submit to Jharkhand Govt
                      </>
                    )}
                  </button>
                  
                  {/* Submit Button Status */}
                  <div className="text-sm text-gray-600 space-y-1">
                    {!isAuthenticated && detectedIssues.length === 0 && !isAnalyzing && (
                      <p className="text-red-500 animate-fade-in">
                        ⚠️ No issues detected by AI. Sign in to manually select categories or try a different image.
                      </p>
                    )}
                    
                    {isAuthenticated && selectedCategories.length === 0 && !isAnalyzing && (
                      <p className="text-red-500 animate-fade-in">
                        ⚠️ Please select at least one issue category to continue
                      </p>
                    )}
                    
                    {((isAuthenticated && selectedCategories.length > 0) || (!isAuthenticated && detectedIssues.length > 0)) && (
                      <p className="text-green-600 animate-fade-in">
                        ✅ Ready to submit with {isAuthenticated ? selectedCategories.length : detectedIssues.length} categor{(isAuthenticated ? selectedCategories.length : detectedIssues.length) === 1 ? 'y' : 'ies'}
                        {!isAuthenticated && (
                          <span className="block text-blue-600 text-xs mt-1">
                            📝 AI-detected categories • Sign in for manual selection
                          </span>
                        )}
                      </p>
                    )}
                    
                    {isAnalyzing && (
                      <p className="text-blue-600 animate-pulse">
                        🤖 AI analysis in progress... Please wait
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Summary Preview */}
              {((isAuthenticated && selectedCategories.length > 0) || (!isAuthenticated && detectedIssues.length > 0)) && (
                <div className="bg-gray-50 rounded-xl p-6 animate-slide-up border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Report Summary Preview
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Submitted by:</p>
                      <p className="text-gray-800">
                        {isAuthenticated ? `${user?.name} (${user?.email})` : "Anonymous User"}
                      </p>
                      {!isAuthenticated && (
                        <p className="text-xs text-blue-600 mt-1">
                          💡 Sign in to track your reports and get updates
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-gray-600 font-medium">Categories:</p>
                      <p className="text-gray-800 capitalize">
                        {isAuthenticated ? selectedCategories.join(', ') : detectedIssues.map(issue => issue.category).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isAuthenticated ? 'Manually selected' : 'AI-detected categories'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 font-medium">Category Selection:</p>
                      <p className="text-gray-800">
                        {isAuthenticated 
                          ? 'Full manual control enabled'
                          : 'AI-only (Sign in for manual selection)'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 font-medium">AI Analysis:</p>
                      <p className="text-gray-800">
                        {detectedIssues.length > 0 
                          ? `${detectedIssues.length} issue${detectedIssues.length > 1 ? 's' : ''} detected (${Math.round(detectedIssues.reduce((acc, issue) => acc + issue.confidence, 0) / detectedIssues.length * 100)}% avg confidence)`
                          : 'No issues detected by AI'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 font-medium">Comments:</p>
                      <p className="text-gray-800">
                        {userComments.trim() ? `${userComments.substring(0, 50)}${userComments.length > 50 ? '...' : ''}` : 'None provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 font-medium">Report Tracking:</p>
                      <p className="text-gray-800">
                        {isAuthenticated ? 'Enabled - Check your profile for updates' : 'Anonymous - No tracking'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      🏛️ This report will be sent to the Jharkhand Government authorities
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Citizen App Component (wrapped with AuthProvider)
const CitizenApp = () => {
  return (
    <AuthProvider>
      <CitizenAppContent />
    </AuthProvider>
  )
}

// Protected Route Component for Admin Panel
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Simple authentication check - replace with your actual auth logic
    const adminAuth = localStorage.getItem('jharkhand-admin-auth')
    setIsAuthenticated(!!adminAuth)
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return <>{children}</>
}

// Simple Admin Login Component with proper navigation
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple demo authentication - replace with actual authentication
    if (credentials.username === 'admin' && credentials.password === 'jharkhand2025') {
      localStorage.setItem('jharkhand-admin-auth', 'true')
      onLogin()
    } else {
      setError('Invalid credentials. Use admin/jharkhand2025 for demo.')
    }
    
    setIsLoading(false)
  }

  const handleBackToCitizen = () => {
    console.log('🏠 Navigating back to citizen portal')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h2>
          <p className="text-gray-600">Jharkhand Government - Civic Issues Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </div>
            ) : (
              'Sign In to Admin Panel'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700 text-center">
            🔐 Demo Credentials:<br />
            Username: <strong>admin</strong><br />
            Password: <strong>jharkhand2025</strong>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleBackToCitizen}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Citizen Portal
          </button>
        </div>
      </div>
    </div>
  )
}

// Main App Component with Routing
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Citizen App Routes */}
          <Route path="/" element={<CitizenApp />} />
          
          {/* Admin Panel Routes - Protected */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
