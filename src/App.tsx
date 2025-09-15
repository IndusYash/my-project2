import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import CameraCapture from './components/CameraCapture'
import IssueCategories from './components/IssueCategories'
import VoiceInput from './components/VoiceInput'
import AIAnalysis from './components/AIAnalysis'
import MapView from './components/MapView'
import LoadingScreen from './components/LoadingScreen'  // Add this import
import { analyzeImageWithGemini, testGeminiConnection } from './services/gemini'
import { DetectedIssue, IssueReport } from './types'
import { Loader2, CheckCircle, AlertCircle, Camera, Send, RefreshCw, MapPin, Clock, User } from 'lucide-react'

function App() {
  // Add loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
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
  
  // Map state
  const [showMap, setShowMap] = useState(false)

  // Initialize app with loading screen
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing Jharkhand CivicReport App...')
      
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
      setSelectedCategories(issues.map((issue) => issue.category))
      
      // Show success message if issues found
      if (issues.length > 0) {
        console.log(`🎯 Found ${issues.length} potential civic issue(s)`)
      } else {
        console.log('🔍 No issues detected by AI - user can manually select categories')
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
    if (!capturedImage || selectedCategories.length === 0) {
      setError('Please capture an image and select at least one issue category.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('📤 Submitting civic issue report...')
      
      const report: IssueReport = {
        id: `JH-CIVIC-${Date.now()}`, // Updated with Jharkhand prefix
        image: capturedImage,
        categories: selectedCategories,
        comments: userComments.trim(),
        detectedIssues,
        timestamp: new Date().toISOString(),
        location: userLocation || undefined
      }

      // Save to localStorage for demo (replace with actual API call)
      const existingReports = JSON.parse(localStorage.getItem('jharkhand-civic-reports') || '[]')
      existingReports.push(report)
      localStorage.setItem('jharkhand-civic-reports', JSON.stringify(existingReports))
      
      console.log('✅ Report saved successfully:', {
        id: report.id,
        categories: report.categories,
        hasLocation: !!report.location,
        timestamp: report.timestamp
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

  // Map handlers
  const handleMapClick = () => {
    console.log('🗺️ Opening map view')
    setShowMap(true)
  }

  const closeMap = () => {
    console.log('🗺️ Closing map view')
    setShowMap(false)
  }

  // Show loading screen while initializing
  if (isInitialLoading) {
    return <LoadingScreen />
  }

  // Success Screen (updated with Jharkhand branding)
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar onMapClick={handleMapClick} />
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
            </div>
            
            <button
              onClick={() => setSubmitted(false)}
              className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Report Another Issue
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar onMapClick={handleMapClick} />
      
      {/* Map Modal */}
      {showMap && <MapView onClose={closeMap} />}
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header - Updated with Jharkhand branding */}
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
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
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

          {/* Camera Section */}
          {!capturedImage && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up border border-gray-100">
              <CameraCapture onImageCapture={handleImageCapture} />
            </div>
          )}

          {/* Analysis Results Section */}
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

              {/* Manual Category Selection */}
              <IssueCategories
                selectedCategories={selectedCategories}
                onSelectionChange={setSelectedCategories}
              />

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
                    disabled={isSubmitting || selectedCategories.length === 0 || isAnalyzing}
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
                    {selectedCategories.length === 0 && !isAnalyzing && (
                      <p className="text-red-500 animate-fade-in">
                        ⚠️ Please select at least one issue category to continue
                      </p>
                    )}
                    
                    {selectedCategories.length > 0 && (
                      <p className="text-green-600 animate-fade-in">
                        ✅ Ready to submit with {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}
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
              {selectedCategories.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 animate-slide-up border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Report Summary Preview
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Categories Selected:</p>
                      <p className="text-gray-800 capitalize">{selectedCategories.join(', ')}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 font-medium">AI Analysis:</p>
                      <p className="text-gray-800">
                        {detectedIssues.length > 0 
                          ? `${detectedIssues.length} issue${detectedIssues.length > 1 ? 's' : ''} detected (${Math.round(detectedIssues.reduce((acc, issue) => acc + issue.confidence, 0) / detectedIssues.length * 100)}% avg confidence)`
                          : 'Manual selection'
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
                      <p className="text-gray-600 font-medium">Location:</p>
                      <p className="text-gray-800">
                        {userLocation ? 'GPS coordinates captured' : 'Not available'}
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

export default App
