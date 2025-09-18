import { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  Settings,
  Calendar,
  MapPin,
  Star,
  Filter,
  Search,
  Eye
} from 'lucide-react'
import { ProfilePageProps, User as UserType, UserReport, UserBadge } from '../types'
import ReportDetail from './ReportDetail'

const UserProfile = ({ onClose }: ProfilePageProps) => {
  const [user, setUser] = useState<UserType | null>(null)
  const [userReports, setUserReports] = useState<UserReport[]>([])
  const [filteredReports, setFilteredReports] = useState<UserReport[]>([])
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mock user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: UserType = {
        id: 'user-123',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91 98765 43210',
        avatar: undefined,
        joinedDate: '2024-01-15',
        totalReports: 12,
        resolvedReports: 8,
        pendingReports: 4,
        badges: [
          {
            id: 'badge-1',
            name: 'Active Reporter',
            description: 'Submitted 10+ reports',
            icon: '🏆',
            earnedDate: '2024-09-01',
            category: 'reporter'
          },
          {
            id: 'badge-2',
            name: 'Community Hero',
            description: 'Helped resolve 5+ issues',
            icon: '🌟',
            earnedDate: '2024-08-15',
            category: 'community'
          }
        ],
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            showProfile: true,
            showReports: true
          },
          language: 'en'
        }
      }

      const mockReports: UserReport[] = [
        {
          id: 'JH-CIVIC-001',
          image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23666" width="300" height="200"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em">Pothole Image</text></svg>',
          categories: ['pothole'],
          comments: 'Large pothole causing traffic issues on Main Road',
          detectedIssues: [],
          timestamp: '2025-09-15T10:30:00Z',
          location: { lat: 23.3441, lng: 85.3096 },
          status: 'resolved',
          priority: 'high',
          assignedTo: 'Public Works Department, Ranchi',
          estimatedResolution: 'Within 5 working days',
          actualResolution: '2025-09-18T14:00:00Z',
          governmentResponse: 'Thank you for reporting. The pothole has been filled with high-quality materials.',
          updates: [
            {
              id: 'update-1',
              timestamp: '2025-09-15T10:30:00Z',
              status: 'Report Submitted',
              message: 'Your report has been received and assigned ID: JH-CIVIC-001',
              updatedBy: 'System'
            },
            {
              id: 'update-2',
              timestamp: '2025-09-15T14:20:00Z',
              status: 'Acknowledged',
              message: 'Report acknowledged by Public Works Department',
              updatedBy: 'PWD Ranchi'
            },
            {
              id: 'update-3',
              timestamp: '2025-09-16T09:00:00Z',
              status: 'In Progress',
              message: 'Repair work has started. Road maintenance team deployed.',
              updatedBy: 'PWD Ranchi'
            },
            {
              id: 'update-4',
              timestamp: '2025-09-18T14:00:00Z',
              status: 'Resolved',
              message: 'Pothole repair completed. Road is now smooth and safe.',
              updatedBy: 'PWD Ranchi'
            }
          ],
          citizenRating: 5,
          feedback: 'Excellent work! The road is much better now.'
        },
        {
          id: 'JH-CIVIC-002',
          image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23333" width="300" height="200"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em">Streetlight Issue</text></svg>',
          categories: ['streetlight'],
          comments: 'Street light not working for past week, safety concern',
          detectedIssues: [],
          timestamp: '2025-09-10T18:45:00Z',
          location: { lat: 23.3500, lng: 85.3200 },
          status: 'in-progress',
          priority: 'medium',
          assignedTo: 'Electrical Department, Ranchi',
          estimatedResolution: 'Within 3 working days',
          governmentResponse: 'Electrical team has been dispatched to inspect and repair the streetlight.',
          updates: [
            {
              id: 'update-5',
              timestamp: '2025-09-10T18:45:00Z',
              status: 'Report Submitted',
              message: 'Street light repair request submitted',
              updatedBy: 'System'
            },
            {
              id: 'update-6',
              timestamp: '2025-09-11T10:15:00Z',
              status: 'Acknowledged',
              message: 'Report received by Electrical Department',
              updatedBy: 'Electrical Dept'
            },
            {
              id: 'update-7',
              timestamp: '2025-09-12T14:30:00Z',
              status: 'In Progress',
              message: 'Electrician team inspected the site. Replacement bulb ordered.',
              updatedBy: 'Electrical Dept'
            }
          ]
        },
        {
          id: 'JH-CIVIC-003',
          image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%234CAF50" width="300" height="200"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em">Garbage Issue</text></svg>',
          categories: ['garbage'],
          comments: 'Overflowing garbage bin attracting stray animals',
          detectedIssues: [],
          timestamp: '2025-09-05T08:20:00Z',
          location: { lat: 23.3300, lng: 85.3100 },
          status: 'acknowledged',
          priority: 'medium',
          assignedTo: 'Municipal Corporation, Ranchi',
          estimatedResolution: 'Within 2 working days',
          governmentResponse: 'Waste collection team will visit the location within 24 hours.',
          updates: [
            {
              id: 'update-8',
              timestamp: '2025-09-05T08:20:00Z',
              status: 'Report Submitted',
              message: 'Garbage overflow issue reported',
              updatedBy: 'System'
            },
            {
              id: 'update-9',
              timestamp: '2025-09-05T15:45:00Z',
              status: 'Acknowledged',
              message: 'Municipal Corporation has acknowledged the report',
              updatedBy: 'Municipal Corp'
            }
          ]
        }
      ]
      
      setUser(mockUser)
      setUserReports(mockReports)
      setFilteredReports(mockReports)
      setIsLoading(false)
    }

    loadUserData()
  }, [])

  // Filter reports
  useEffect(() => {
    let filtered = userReports

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        report.comments.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus)
    }

    setFilteredReports(filtered)
  }, [userReports, searchTerm, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'reporter': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-green-100 text-green-800'
      case 'impact': return 'bg-purple-100 text-purple-800'
      case 'special': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedReport) {
    return (
      <ReportDetail
        report={selectedReport}
        onClose={onClose}
        onBack={() => setSelectedReport(null)}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl animate-fade-in">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">Member since {new Date(user.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{user.totalReports}</p>
                <p className="text-sm text-blue-700">Total Reports</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{user.resolvedReports}</p>
                <p className="text-sm text-green-700">Resolved</p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-900">{user.pendingReports}</p>
                <p className="text-sm text-yellow-700">Pending</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {user.totalReports > 0 ? Math.round((user.resolvedReports / user.totalReports) * 100) : 0}%
                </p>
                <p className="text-sm text-purple-700">Success Rate</p>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Your Badges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.badges.map((badge) => (
                  <div key={badge.id} className={`p-4 rounded-xl border ${getBadgeColor(badge.category)}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <h4 className="font-semibold">{badge.name}</h4>
                        <p className="text-sm opacity-80">{badge.description}</p>
                        <p className="text-xs opacity-70">Earned: {new Date(badge.earnedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Reports</h3>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search your reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">{report.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2 capitalize">{report.categories.join(', ')}</p>
                        <p className="text-sm text-gray-600">{report.comments}</p>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(report.timestamp).toLocaleDateString()}
                        </p>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        {report.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>Location tracked</span>
                          </div>
                        )}
                        {report.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{report.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      
                      {report.citizenRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{report.citizenRating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile