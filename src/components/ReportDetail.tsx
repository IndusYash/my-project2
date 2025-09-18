import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Star,
  MessageSquare,
  FileText,
  Building2,
  Phone,
  Mail,
  X
} from 'lucide-react'
import { ReportDetailProps } from '../types'
import { useState, useEffect } from 'react'

const ReportDetail = ({ report, onClose, onBack }: ReportDetailProps) => {
  const [reportUser, setReportUser] = useState<{ name: string; email: string } | null>(null)

  // Get user info from localStorage based on userId
  useEffect(() => {
    if (report.userId) {
      const users = JSON.parse(localStorage.getItem('jharkhand-civic-users') || '[]')
      const user = users.find((u: any) => u.id === report.userId)
      if (user) {
        setReportUser({ name: user.name, email: user.email })
      }
    }
  }, [report.userId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'submitted': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'acknowledged': return <AlertCircle className="w-4 h-4" />
      case 'submitted': return <FileText className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl animate-fade-in">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                <p className="text-sm text-gray-600">ID: {report.id}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Status and Priority */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(report.status)}`}>
                {getStatusIcon(report.status)}
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(report.priority)}`}>
                {report.priority.toUpperCase()} PRIORITY
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Submitted: {new Date(report.timestamp).toLocaleDateString()}
              </div>
            </div>

            {/* Image */}
            {report.image && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Reported Issue</h3>
                <img 
                  src={report.image} 
                  alt="Reported issue" 
                  className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Report Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Submitted By</p>
                      <p className="text-sm text-gray-600">
                        {reportUser?.name || "Anonymous User"}
                      </p>
                      {reportUser?.email && (
                        <p className="text-xs text-gray-500">{reportUser.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Categories</p>
                      <p className="text-sm text-gray-600 capitalize">{report.categories.join(', ')}</p>
                    </div>
                  </div>
                  
                  {report.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">
                          {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {report.comments && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Description</p>
                        <p className="text-sm text-gray-600">{report.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Government Response */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Government Response</h3>
                
                {report.assignedTo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <p className="font-medium text-blue-900">Assigned Department</p>
                    </div>
                    <p className="text-blue-800">{report.assignedTo}</p>
                  </div>
                )}

                {report.governmentResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <p className="font-medium text-green-900">Official Response</p>
                    </div>
                    <p className="text-green-800">{report.governmentResponse}</p>
                  </div>
                )}

                {report.estimatedResolution && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Estimated Resolution</p>
                      <p className="text-sm text-gray-600">{report.estimatedResolution}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Timeline */}
            {report.updates && report.updates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Timeline</h3>
                <div className="space-y-4">
                  {report.updates.map((update, index) => (
                    <div key={update.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        {index < report.updates.length - 1 && (
                          <div className="w-px h-12 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{update.status}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{update.message}</p>
                        <p className="text-xs text-gray-500 mt-1">Updated by: {update.updatedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating & Feedback */}
            {report.citizenRating && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Feedback</h3>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(report.citizenRating)}
                  <span className="text-sm text-gray-600">({report.citizenRating}/5)</span>
                </div>
                {report.feedback && (
                  <p className="text-sm text-gray-700">{report.feedback}</p>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Helpline: 1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email: support@jharkhand.gov.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail
