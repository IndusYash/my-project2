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
}

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

export interface GeminiResponse {
  issues: DetectedIssue[]
}
