import { Loader2, CheckCircle, AlertCircle, Brain, Zap, Target } from 'lucide-react'
import { AIAnalysisProps } from '../types'

const AIAnalysis = ({ detectedIssues, isAnalyzing }: AIAnalysisProps) => {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-slide-up border border-gray-100">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Brain className="w-16 h-16 text-blue-500 animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          Our AI is analyzing your photo to detect civic issues...
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <span>Scanning for potholes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.15s' }}></div>
            <span>Checking streetlights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <span>Detecting drainage</span>
          </div>
        </div>
      </div>
    )
  }

  if (detectedIssues.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center animate-slide-up border border-gray-100">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Issues Detected</h3>
        <p className="text-gray-600 mb-4">
          Our AI couldn't identify any civic issues in this image. You can still manually select categories below.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
          <Target className="w-4 h-4" />
          Try capturing a clearer image or different angle
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            AI Detected Issues
            <Zap className="w-5 h-5 text-yellow-500" />
          </h2>
          <p className="text-sm text-gray-600">Found {detectedIssues.length} potential issue{detectedIssues.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {detectedIssues.map((issue, index) => {
          const confidenceColor = issue.confidence >= 0.8 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : issue.confidence >= 0.6 
            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
            : 'bg-orange-100 text-orange-800 border-orange-200'
          
          const confidenceIcon = issue.confidence >= 0.8 
            ? '🎯' 
            : issue.confidence >= 0.6 
            ? '⚡' 
            : '🔍'

          return (
            <div 
              key={index} 
              className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{confidenceIcon}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-blue-900 capitalize">
                    {issue.category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${confidenceColor}`}>
                  {Math.round(issue.confidence * 100)}% confident
                </div>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed pl-11">
                {issue.description}
              </p>
              
              <div className="mt-3 pl-11">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      issue.confidence >= 0.8 ? 'bg-green-500' :
                      issue.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${issue.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Brain className="w-4 h-4 text-gray-400" />
          <span>AI analysis complete. You can modify selections below if needed.</span>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis
