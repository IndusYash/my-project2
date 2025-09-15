import { GoogleGenerativeAI } from '@google/generative-ai'
import { DetectedIssue, GeminiResponse } from '../types'
import { AI_ANALYSIS_PROMPT } from '../utils/constants'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export const analyzeImageWithGemini = async (imageDataUrl: string): Promise<DetectedIssue[]> => {
  try {
    // Validate API key
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file')
    }

    // Convert data URL to base64
    const base64Data = imageDataUrl.split(',')[1]
    if (!base64Data) {
      throw new Error('Invalid image data format')
    }

    // Determine MIME type from data URL
    const mimeTypeMatch = imageDataUrl.match(/data:([^;]+);/)
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'

    console.log('🔍 Sending image to Gemini AI for analysis...')
    console.log('📊 Image size:', Math.round(base64Data.length * 0.75 / 1024), 'KB')
    
    // Use Gemini 2.0 Flash model (same as your curl command)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    }

    // Send request with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout - please try again')), 30000)
    )

    const analysisPromise = model.generateContent([AI_ANALYSIS_PROMPT, imagePart])

    const result = await Promise.race([analysisPromise, timeoutPromise]) as any
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini AI response received')
    console.log('📝 Raw response:', text)

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found in response, trying text extraction')
        return extractIssuesFromText(text)
      }

      const parsedResponse: GeminiResponse = JSON.parse(jsonMatch[0])
      
      if (!parsedResponse.issues || !Array.isArray(parsedResponse.issues)) {
        console.warn('⚠️ Invalid response format, trying text extraction')
        return extractIssuesFromText(text)
      }

      // Validate and filter issues
      const validIssues = parsedResponse.issues
        .filter(issue => 
          issue.category && 
          typeof issue.confidence === 'number' && 
          issue.description &&
          issue.confidence >= 0.3
        )
        .map(issue => ({
          ...issue,
          category: normalizeCategory(issue.category),
          confidence: Math.min(issue.confidence, 1.0),
          description: issue.description.trim()
        }))

      console.log('🎯 Detected issues:', validIssues)
      return validIssues

    } catch (parseError) {
      console.error('❌ Error parsing Gemini response:', parseError)
      console.log('🔄 Falling back to text extraction')
      return extractIssuesFromText(text)
    }

  } catch (error: any) {
    console.error('❌ Error calling Gemini API:', error)
    
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API configuration.')
    }
    if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.')
    }
    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout. Please try again with a smaller image.')
    }
    
    throw new Error('Failed to analyze image. Please try again.')
  }
}

// Normalize category names to match predefined categories
const normalizeCategory = (category: string): string => {
  const normalized = category.toLowerCase().trim()
  
  const categoryMap: Record<string, string> = {
    'pothole': 'pothole',
    'potholes': 'pothole',
    'road damage': 'pothole',
    'road': 'pothole',
    'hole': 'pothole',
    'crack': 'pothole',
    'street light': 'streetlight',
    'streetlight': 'streetlight',
    'street lights': 'streetlight',
    'streetlights': 'streetlight',
    'light': 'streetlight',
    'lighting': 'streetlight',
    'lamp': 'streetlight',
    'broken light': 'streetlight',
    'drainage': 'drainage',
    'drain': 'drainage',
    'water': 'drainage',
    'waterlog': 'drainage',
    'waterlogging': 'drainage',
    'flood': 'drainage',
    'flooding': 'drainage',
    'sewer': 'drainage',
    'garbage': 'garbage',
    'trash': 'garbage',
    'waste': 'garbage',
    'litter': 'garbage',
    'bin': 'garbage',
    'dustbin': 'garbage',
    'rubbish': 'garbage',
    'traffic': 'traffic',
    'traffic sign': 'traffic',
    'sign': 'traffic',
    'signal': 'traffic',
    'signage': 'traffic',
    'construction': 'construction',
    'debris': 'construction',
    'barrier': 'construction',
    'work': 'construction',
    'repair': 'construction'
  }
  
  return categoryMap[normalized] || normalized
}

// Fallback function to extract issues from text
const extractIssuesFromText = (text: string): DetectedIssue[] => {
  console.log('🔄 Extracting issues from text response')
  
  const issues: DetectedIssue[] = []
  const textLower = text.toLowerCase()
  
  const keywords = [
    { 
      category: 'pothole', 
      terms: ['pothole', 'road damage', 'crack', 'hole', 'asphalt', 'pavement'],
      confidence: 0.7
    },
    { 
      category: 'streetlight', 
      terms: ['street light', 'lamp', 'lighting', 'broken light', 'light post'],
      confidence: 0.7
    },
    { 
      category: 'drainage', 
      terms: ['drain', 'water', 'flood', 'waterlog', 'sewer', 'gutter'],
      confidence: 0.6
    },
    { 
      category: 'garbage', 
      terms: ['garbage', 'trash', 'waste', 'litter', 'bin', 'dustbin'],
      confidence: 0.8
    },
    { 
      category: 'traffic', 
      terms: ['traffic sign', 'sign', 'signal', 'signage', 'board'],
      confidence: 0.6
    },
    { 
      category: 'construction', 
      terms: ['construction', 'debris', 'barrier', 'work', 'repair'],
      confidence: 0.5
    }
  ]

  keywords.forEach(({ category, terms, confidence }) => {
    const foundTerms = terms.filter(term => textLower.includes(term))
    if (foundTerms.length > 0) {
      const adjustedConfidence = Math.min(confidence + (foundTerms.length - 1) * 0.1, 0.95)
      
      issues.push({
        category,
        confidence: adjustedConfidence,
        description: `Detected ${category} issue based on AI analysis (found: ${foundTerms.join(', ')})`
      })
    }
  })

  const uniqueIssues = issues.filter((issue, index, self) => 
    index === self.findIndex(i => i.category === issue.category)
  )

  console.log('📋 Extracted issues from text:', uniqueIssues)
  return uniqueIssues
}

// Test API connection
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error('❌ Gemini API key not found')
      return false
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent('Hello, please respond with "OK" if you can see this message.')
    const response = await result.response
    const text = response.text()
    
    console.log('🔗 Gemini API test response:', text)
    return text.toLowerCase().includes('ok')
  } catch (error) {
    console.error('❌ Gemini API connection test failed:', error)
    return false
  }
}
