// components/GeminiChatbot.tsx
import React, { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Send, Trash2, User } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  content: string
  timestamp: Date
}

interface GeminiChatbotProps {
  className?: string
}

const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null) // Fixed: Changed to HTMLInputElement

  // Simple initialization
  useEffect(() => {
    const initializeGemini = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        if (!apiKey) {
          throw new Error('API key not found')
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const generativeModel = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7
          }
        })

        setModel(generativeModel)
        console.log('✅ Gemini initialized')

      } catch (err) {
        console.error('❌ Failed to initialize:', err)
        setError('Failed to initialize AI')
      }
    }

    initializeGemini()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simple send message function with short response prompt
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !model || isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      // Enhanced prompt for short responses
      const prompt = `You are an AI assistant for the Jharkhand CivicReport app - a Government of Jharkhand initiative for citizens to report civic issues using photos and AI analysis.

IMPORTANT: Keep responses SHORT (1-3 sentences max). Be helpful but concise.

User question: ${messageText}

Respond briefly and directly:`

      // Generate response
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const assistantMessage: Message = {
        role: 'model',
        content: text,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err: unknown) { // Fixed: Explicitly typed as unknown
      console.error('❌ Error:', err)
      
      let errorMessage = 'Sorry, please try again.'
      
      // Fixed: Proper error handling with type checking
      if (err instanceof Error) {
        if (err.message?.includes('quota') || err.message?.includes('limit')) {
          errorMessage = 'Too many requests. Wait a moment.'
        } else if (err.message?.includes('SAFETY')) {
          errorMessage = 'Cannot respond to that question.'
        } else if (err.message?.includes('API key')) {
          errorMessage = 'API setup issue.'
        }
      }

      const errorMsg: Message = {
        role: 'model',
        content: errorMessage,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMsg])

    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input.trim())
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-lg ${className}`}>
      
      {/* Simple Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">JH</span>
          </div>
          <div>
            <h3 className="font-semibold">Jharkhand Civic AI</h3>
            <p className="text-sm text-gray-500">{messages.length} messages</p>
          </div>
        </div>
        
        <button
          onClick={clearChat}
          className="p-2 text-gray-500 hover:text-red-600 rounded"
          disabled={messages.length === 0}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
        
        {/* Welcome Message */}
        {messages.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">JH</span>
            </div>
            <h3 className="font-semibold mb-2">Jharkhand CivicReport AI</h3>
            <p className="text-gray-600 text-sm mb-4">
              Quick answers to your questions!
            </p>
            
            {/* Simple starter questions */}
            <div className="space-y-2 max-w-sm mx-auto">
              <button
                onClick={() => sendMessage('How does this app work?')}
                className="w-full p-2 text-sm bg-orange-50 hover:bg-orange-100 rounded border"
              >
                How does this app work?
              </button>
              <button
                onClick={() => sendMessage('What civic issues can I report?')}
                className="w-full p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border"
              >
                What can I report?
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-blue-500' 
                : 'bg-orange-500'
            }`}>
              {message.role === 'user' ? (
                <User className="w-3 h-3 text-white" />
              ) : (
                <span className="text-white text-xs font-bold">AI</span>
              )}
            </div>

            {/* Message */}
            <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.content}
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-xs text-gray-500 ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Simple Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef} // Fixed: Now uses inputRef instead of textareaRef
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading || !model}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
            maxLength={200}
          />
          
          <button
            type="submit"
            disabled={isLoading || !model || !input.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {model ? '✅ Quick responses enabled' : '⏳ Connecting...'}
        </div>
      </form>
    </div>
  )
}

export default GeminiChatbot
