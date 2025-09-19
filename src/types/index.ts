// index.ts

// ===== CORE CIVIC REPORTING INTERFACES =====
export interface DetectedIssue {
  category: string
  confidence: number
  description: string
}

export interface IssueCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

export interface IssueReport {
  id: string
  image: string
  categories: string[]
  comments: string
  detectedIssues: DetectedIssue[]
  timestamp: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  userId?: string // Added for authentication integration
  submissionType?: 'manual' | 'ai-only' // ✅ Add this line
}

export interface GeminiResponse {
  issues: DetectedIssue[]
}

// ===== COMPONENT PROPS INTERFACES =====
export interface CameraCaptureProps {
  onImageCapture: (imageDataUrl: string) => void
}

export interface IssueCategoriesProps {
  selectedCategories: string[]
  onSelectionChange: (categories: string[]) => void
}

export interface VoiceInputProps {
  onTranscript: (text: string) => void
}

export interface AIAnalysisProps {
  detectedIssues: DetectedIssue[]
  isAnalyzing: boolean
}

export interface CommunityPageProps {
  onClose: () => void
}

export interface ProfilePageProps {
  onClose: () => void
}

// ===== COMMUNITY & REVIEWS INTERFACES =====
export interface CommunityReview {
  id: string
  reportId: string
  title: string
  description: string
  category: string
  status: 'completed' | 'in-progress' | 'pending' | 'rejected'
  beforeImage?: string
  afterImage?: string
  location: {
    lat: number
    lng: number
    address: string
  }
  completedDate: string
  rating: number // 1-5 stars
  governmentResponse?: string
  cost?: number
  duration?: string // e.g., "2 weeks"
  department: string
  comments: CommunityComment[]
  likes: number
  createdAt: string
  updatedAt: string
}

export interface CommunityComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  replies: CommunityReply[]
  createdAt: string
  updatedAt: string
}

export interface CommunityReply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  likes: number
  createdAt: string
}

// ===== USER AUTHENTICATION & PROFILE INTERFACES =====
export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  joinedDate: string
  isVerified: boolean
}

export interface User extends AuthUser {
  totalReports: number
  resolvedReports: number
  pendingReports: number
  badges: UserBadge[]
  preferences: UserPreferences
}

export interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate: string
  category: 'reporter' | 'community' | 'impact' | 'special'
}

export interface UserPreferences {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    showProfile: boolean
    showReports: boolean
  }
  language: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>
}

// ===== USER REPORTS & TRACKING INTERFACES =====
export interface UserReport extends IssueReport {
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  estimatedResolution?: string
  actualResolution?: string
  governmentResponse?: string
  updates: ReportUpdate[]
  citizenRating?: number
  feedback?: string
}

export interface ReportUpdate {
  id: string
  timestamp: string
  status: string
  message: string
  updatedBy: string
  attachments?: string[]
}

export interface ReportDetailProps {
  report: UserReport
  onClose: () => void
  onBack: () => void
}

// ===== ADMIN PANEL INTERFACES =====
export interface Issue {
  id: string
  title: string
  description: string
  category: 'pothole' | 'streetlight' | 'garbage' | 'drainage' | 'traffic' | 'parks' | 'water' | 'roads'
  status: 'pending' | 'acknowledged' | 'in-progress' | 'under-review' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'emergency'
  location: {
    lat: number
    lng: number
    address: string
    ward?: string
    district?: string
  }
  images: string[]
  reportedBy: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  assignedTo?: {
    id: string
    name: string
    department: string
    role: string
  }
  department?: {
    id: string
    name: string
    head: {
      id: string
      name: string
      email: string
      phone: string
    }
  }
  createdAt: Date
  updatedAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  closedAt?: Date
  estimatedCompletion?: Date
  actualCompletion?: Date
  notes: IssueNote[]
  attachments?: string[]
  citizenRating?: number
  resolutionSummary?: string
  tags?: string[]
}

export interface IssueNote {
  id: string
  issueId: string
  authorId: string
  authorName: string
  authorRole: 'citizen' | 'admin' | 'department-head' | 'field-officer'
  content: string
  isInternal: boolean
  createdAt: Date
  attachments?: string[]
}

export interface Department {
  id: string
  name: string
  code: string
  head: {
    id: string
    name: string
    email: string
    phone: string
  }
  description: string
  activeIssues: number
  resolvedIssues: number
  avgResolutionTime: number // in hours
  capacity: number
  workload: 'low' | 'medium' | 'high' | 'overloaded'
  specializations: string[]
  contactInfo: {
    email: string
    phone: string
    address?: string
  }
  operatingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday?: string
    sunday?: string
  }
}

export interface AdminStats {
  totalIssues: number
  pendingIssues: number
  acknowledgedIssues: number
  inProgressIssues: number
  underReviewIssues: number
  resolvedIssues: number
  closedIssues: number
  avgResolutionTime: number // in hours
  urgentIssues: number
  emergencyIssues: number
  overdueIssues: number
  citizenSatisfactionRate: number
  departmentEfficiency: {
    [departmentId: string]: {
      name: string
      efficiency: number
      avgResolutionTime: number
    }
  }
  monthlyTrends: {
    month: string
    reported: number
    resolved: number
  }[]
  categoryBreakdown: {
    category: string
    count: number
    percentage: number
  }[]
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super-admin' | 'admin' | 'department-head' | 'field-officer' | 'viewer'
  department?: {
    id: string
    name: string
  }
  permissions: AdminPermission[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  profileImage?: string
  phone?: string
}

export interface AdminPermission {
  resource: 'issues' | 'departments' | 'users' | 'reports' | 'settings'
  actions: ('create' | 'read' | 'update' | 'delete' | 'assign')[]
}

// ===== FILTERING & SEARCH INTERFACES =====
export interface IssueFilter {
  status?: Issue['status'][]
  category?: Issue['category'][]
  priority?: Issue['priority'][]
  department?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  location?: {
    ward?: string
    district?: string
  }
  assignedTo?: string[]
  searchQuery?: string
}

export interface AdminTableColumn {
  key: keyof Issue | string
  label: string
  sortable: boolean
  filterable: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

// ===== NOTIFICATION INTERFACES =====
export interface AdminNotification {
  id: string
  type: 'issue-reported' | 'issue-escalated' | 'issue-resolved' | 'system-alert' | 'deadline-approaching'
  title: string
  message: string
  issueId?: string
  severity: 'info' | 'warning' | 'error' | 'success'
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

// ===== BULK OPERATIONS INTERFACES =====
export interface BulkOperation {
  action: 'assign' | 'update-status' | 'add-note' | 'delete'
  issueIds: string[]
  data?: {
    assignedTo?: string
    status?: Issue['status']
    note?: string
    departmentId?: string
  }
}

// ===== ANALYTICS & REPORTING INTERFACES =====
export interface AnalyticsTimeframe {
  label: string
  value: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  startDate?: Date
  endDate?: Date
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'summary' | 'detailed' | 'performance' | 'citizen-feedback'
  filters: IssueFilter
  columns: string[]
  groupBy?: string
  sortBy?: string
  format: 'pdf' | 'excel' | 'csv'
}

// ===== ADMIN COMPONENT PROPS INTERFACES =====
export interface IssueOverviewCardsProps {
  stats: AdminStats
  loading?: boolean
}

export interface StatusManagementProps {
  selectedIssue: Issue | null
  onStatusUpdate: (issueId: string, status: Issue['status'], note?: string) => void
  currentUser: AdminUser
}

export interface DepartmentAssignmentProps {
  departments: Department[]
  selectedIssue: Issue | null
  selectedIssues?: string[]
  onAssign: (issueIds: string[], departmentId: string) => void
  loading?: boolean
}

export interface IssueTableProps {
  issues: Issue[]
  columns: AdminTableColumn[]
  onSelectIssue: (issue: Issue) => void
  onSelectMultiple: (issueIds: string[]) => void
  onUpdateStatus: (issueId: string, status: Issue['status']) => void
  onBulkAction: (operation: BulkOperation) => void
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  filters?: IssueFilter
  onFilterChange?: (filters: IssueFilter) => void
}

export interface IssueDetailsModalProps {
  issue: Issue | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (issueId: string, status: Issue['status'], note?: string) => void
  onAssignDepartment: (issueId: string, departmentId: string) => void
  onAddNote: (issueId: string, note: string, isInternal: boolean) => void
  departments: Department[]
  currentUser: AdminUser
}

export interface AdminNavigationProps {
  currentUser: AdminUser
  notifications: AdminNotification[]
  onNotificationRead: (notificationId: string) => void
  onLogout: () => void
}

// ===== API RESPONSE INTERFACES =====
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface IssueApiResponse extends ApiResponse<Issue[]> {}
export interface DepartmentApiResponse extends ApiResponse<Department[]> {}
export interface StatsApiResponse extends ApiResponse<AdminStats> {}

// ===== FORM INTERFACES =====
export interface CreateIssueForm {
  title: string
  description: string
  category: Issue['category']
  priority: Issue['priority']
  location: Issue['location']
  reportedBy: Issue['reportedBy']
  images: File[]
}

export interface UpdateIssueForm {
  title?: string
  description?: string
  status?: Issue['status']
  priority?: Issue['priority']
  assignedTo?: string
  departmentId?: string
  estimatedCompletion?: Date
  tags?: string[]
}

export interface DepartmentForm {
  name: string
  code: string
  head: Department['head']
  description: string
  capacity: number
  specializations: string[]
  contactInfo: Department['contactInfo']
  operatingHours: Department['operatingHours']
}

// ===== UTILITY TYPE EXPORTS =====
export type IssueStatus = Issue['status']
export type IssuePriority = Issue['priority'] 
export type AdminRole = AdminUser['role']
export type NotificationType = AdminNotification['type']
export type BulkActionType = BulkOperation['action']

// ===== CATEGORY TYPES =====
// Use the Admin Issue category type for consistency
export type IssueCategoryType = Issue['category']

// ===== LEGACY COMPATIBILITY =====
// Remove the duplicate interface - use type alias instead
export type issueCategory = IssueCategory
