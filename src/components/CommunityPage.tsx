import { useState, useEffect } from 'react'
import { 
  X, 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  Filter, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  User,
  ArrowLeft,
  Building2,
  Camera
} from 'lucide-react'
import { CommunityReview, CommunityComment, CommunityPageProps } from '../types'

const CommunityPage = ({ onClose }: CommunityPageProps) => {
  const [reviews, setReviews] = useState<CommunityReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<CommunityReview[]>([])
  const [selectedReview, setSelectedReview] = useState<CommunityReview | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'popular'>('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const loadCommunityData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockReviews: CommunityReview[] = [
        {
          id: 'JH-REV-001',
          reportId: 'JH-CIVIC-001',
          title: 'Pothole Fixed on Main Road, Ranchi',
          description: 'Large pothole near City Centre that was causing traffic issues has been completely repaired.',
          category: 'pothole',
          status: 'completed',
          beforeImage: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23666" width="300" height="200"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em">Pothole Before</text></svg>',
          afterImage: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%234CAF50" width="300" height="200"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em">Fixed Road</text></svg>',
          location: {
            lat: 23.3441,
            lng: 85.3096,
            address: 'Main Road, Near City Centre, Ranchi'
          },
          completedDate: '2025-09-15',
          rating: 4.5,
          governmentResponse: 'Thank you for reporting this issue. Our road maintenance team has successfully repaired the pothole using high-quality materials.',
          cost: 15000,
          duration: '3 days',
          department: 'Public Works Department',
          comments: [
            {
              id: 'comment-1',
              userId: 'user-1',
              userName: 'Rajesh Kumar',
              content: 'Great work! The road is much smoother now. Thank you Jharkhand Government!',
              likes: 12,
              replies: [
                {
                  id: 'reply-1',
                  userId: 'gov-official',
                  userName: 'PWD Ranchi',
                  content: 'Thank you for your feedback! We are committed to maintaining good road infrastructure.',
                  likes: 5,
                  createdAt: '2025-09-16T10:30:00Z'
                }
              ],
              createdAt: '2025-09-16T09:15:00Z',
              updatedAt: '2025-09-16T09:15:00Z'
            }
          ],
          likes: 28,
          createdAt: '2025-09-15T14:30:00Z',
          updatedAt: '2025-09-16T11:00:00Z'
        },
        {
          id: 'JH-REV-002',
          reportId: 'JH-CIVIC-002',
          title: 'Street Light Installation in Jamshedpur',
          description: 'New LED street lights installed in residential area for better safety and visibility.',
          category: 'streetlight',
          status: 'completed',
          afterImage: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23FFC107" width="300" height="200"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em">New LED Lights</text></svg>',
          location: {
            lat: 22.8046,
            lng: 86.2029,
            address: 'Sakchi Area, Jamshedpur'
          },
          completedDate: '2025-09-12',
          rating: 4.8,
          governmentResponse: 'Part of our Smart City initiative to improve street lighting across Jharkhand.',
          cost: 45000,
          duration: '1 week',
          department: 'Electrical Department',
          comments: [
            {
              id: 'comment-2',
              userId: 'user-2',
              userName: 'Priya Singh',
              content: 'Excellent! The area feels much safer now, especially for evening walks.',
              likes: 18,
              replies: [],
              createdAt: '2025-09-13T19:45:00Z',
              updatedAt: '2025-09-13T19:45:00Z'
            },
            {
              id: 'comment-3',
              userId: 'user-3',
              userName: 'Amit Sharma',
              content: 'LED lights are energy efficient too. Great choice!',
              likes: 7,
              replies: [],
              createdAt: '2025-09-14T08:20:00Z',
              updatedAt: '2025-09-14T08:20:00Z'
            }
          ],
          likes: 35,
          createdAt: '2025-09-12T16:00:00Z',
          updatedAt: '2025-09-14T08:20:00Z'
        },
        {
          id: 'JH-REV-003',
          reportId: 'JH-CIVIC-003',
          title: 'Garbage Collection System Improved',
          description: 'New waste management system implemented with regular collection schedule.',
          category: 'garbage',
          status: 'in-progress',
          location: {
            lat: 23.6102,
            lng: 85.2799,
            address: 'Doranda Area, Ranchi'
          },
          completedDate: '2025-09-10',
          rating: 4.2,
          governmentResponse: 'Working on implementing door-to-door waste collection. 80% complete.',
          department: 'Municipal Corporation',
          comments: [
            {
              id: 'comment-4',
              userId: 'user-4',
              userName: 'Sunita Devi',
              content: 'Much better than before, but still some areas need attention.',
              likes: 9,
              replies: [],
              createdAt: '2025-09-11T12:30:00Z',
              updatedAt: '2025-09-11T12:30:00Z'
            }
          ],
          likes: 22,
          createdAt: '2025-09-10T11:00:00Z',
          updatedAt: '2025-09-11T12:30:00Z'
        }
      ]
      
      setReviews(mockReviews)
      setFilteredReviews(mockReviews)
      setIsLoading(false)
    }

    loadCommunityData()
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = reviews

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(review => review.status === filterStatus)
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(review => review.category === filterCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'popular':
          return b.likes - a.likes
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }, [reviews, searchTerm, filterStatus, filterCategory, sortBy])

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReview) return

    setIsSubmittingComment(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const comment: CommunityComment = {
        id: `comment-${Date.now()}`,
        userId: 'current-user',
        userName: 'Anonymous User',
        content: newComment.trim(),
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Update the selected review
      const updatedReview = {
        ...selectedReview,
        comments: [comment, ...selectedReview.comments]
      }
      
      setSelectedReview(updatedReview)
      
      // Update the reviews list
      setReviews(prev => prev.map(review => 
        review.id === selectedReview.id ? updatedReview : review
      ))
      
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return null
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  // Detailed Review View
  if (selectedReview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl animate-fade-in">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReview.title}</h2>
                  <p className="text-sm text-gray-600">{selectedReview.location.address}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Status and Rating */}
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(selectedReview.status)}`}>
                  {getStatusIcon(selectedReview.status)}
                  {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                </div>
                
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-gray-600">({selectedReview.rating}/5)</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ThumbsUp className="w-4 h-4" />
                  {selectedReview.likes}
                </div>
              </div>

              {/* Images */}
              {(selectedReview.beforeImage || selectedReview.afterImage) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReview.beforeImage && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Before</h4>
                      <img 
                        src={selectedReview.beforeImage} 
                        alt="Before" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  {selectedReview.afterImage && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">After</h4>
                      <img 
                        src={selectedReview.afterImage} 
                        alt="After" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedReview.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="font-semibold">{new Date(selectedReview.completedDate).toLocaleDateString()}</p>
                </div>
                
                {selectedReview.duration && (
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{selectedReview.duration}</p>
                  </div>
                )}
                
                {selectedReview.cost && (
                  <div className="text-center">
                    <IndianRupee className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Cost</p>
                    <p className="font-semibold">₹{selectedReview.cost.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Government Response */}
              {selectedReview.governmentResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">{selectedReview.department}</h4>
                  </div>
                  <p className="text-blue-800">{selectedReview.governmentResponse}</p>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({selectedReview.comments.length})
                </h3>

                {/* Add Comment */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this civic action..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">{newComment.length} characters</span>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Post Comment
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {selectedReview.comments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{comment.userName}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                              <ThumbsUp className="w-4 h-4" />
                              {comment.likes}
                            </button>
                            <button className="text-gray-500 hover:text-blue-600 transition-colors">
                              Reply
                            </button>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Building2 className="w-3 h-3 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-blue-900">{reply.userName}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Community Page
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl animate-fade-in">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">JH</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Community Reviews</h2>
                <p className="text-sm text-gray-600">See how civic issues are being resolved in Jharkhand</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews by location, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="pothole">Potholes</option>
                <option value="streetlight">Street Lights</option>
                <option value="garbage">Garbage</option>
                <option value="drainage">Drainage</option>
                <option value="traffic">Traffic</option>
                <option value="construction">Construction</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading community reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reviews found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    onClick={() => setSelectedReview(review)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {review.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {review.location.address}
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getStatusColor(review.status)}`}>
                        {getStatusIcon(review.status)}
                        {review.status}
                      </div>
                    </div>

                    {/* Image */}
                    {review.afterImage && (
                      <div className="mb-4">
                        <img 
                          src={review.afterImage} 
                          alt={review.title}
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {review.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600 ml-1">({review.rating})</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {review.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {review.comments.length}
                          </div>
                        </div>
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        {new Date(review.completedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityPage