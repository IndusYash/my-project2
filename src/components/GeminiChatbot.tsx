import React, { useState, useEffect, useRef } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Send, Bot, User as UserIcon, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface GeminiChatbotProps {
  supabaseUrl: string;
  supabaseKey: string;
  className?: string;
}

export default function GeminiChatbot({ 
  supabaseUrl, 
  supabaseKey, 
  className = '' 
}: GeminiChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get Gemini API key from environment
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    setSupabase(supabaseClient);

    // Check for existing session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    if (user && supabase) {
      loadMessages();
      // Add welcome message if no messages exist
      setTimeout(() => {
        if (messages.length === 0) {
          addWelcomeMessage();
        }
      }, 500);
    }
  }, [user, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for the Jharkhand CivicReport app. I can help you with:\n\n• How to report civic issues\n• App features and functionality\n• Voice input and GPS features\n• Government reporting process\n\nWhat would you like to know?',
      created_at: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const loadMessages = async () => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (err) {
      console.warn('Failed to load messages from Supabase, using local storage');
      // Fallback to localStorage if Supabase fails
      const localMessages = localStorage.getItem(`chat_messages_${user.id}`);
      if (localMessages) {
        setMessages(JSON.parse(localMessages));
      }
    }
  };

  const signInAnonymously = async () => {
    if (!supabase) return;

    setError(null);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Error signing in:', error);
      setError(`Sign-in failed: ${error.message}`);
    }
  };

  // Call Gemini AI API directly
  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    // System context for Jharkhand Civic Report app
    const systemContext = `You are an AI assistant for the Jharkhand CivicReport app, a government initiative for reporting civic issues in Jharkhand, India.

Key app features:
- Users take photos of civic issues (potholes, garbage, broken streetlights, waterlogging, etc.)
- AI analyzes images and categorizes problems automatically
- GPS location is captured automatically
- Users can add voice comments or typed descriptions
- Reports are submitted directly to Jharkhand Government authorities
- The app serves citizens of Jharkhand state

Answer questions about:
- How to use the app and its features
- Civic issue reporting process in Jharkhand
- Technical support for app functionality
- Government procedures and response times
- Voice input and GPS features

Be helpful, informative, and focused on civic reporting in Jharkhand. Keep responses concise but informative.`;

    const fullPrompt = `${systemContext}\n\nUser question: ${userMessage}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback response
      return getFallbackResponse(userMessage);
    }
  };

  // Fallback responses when API fails
  const getFallbackResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('report') || message.includes('issue') || message.includes('photo')) {
      return 'To report a civic issue:\n\n1. Click the camera button to take a photo\n2. Our AI will analyze and categorize the issue\n3. Add location details if needed\n4. Submit to Jharkhand Government authorities\n\nThe app automatically captures GPS location and allows voice comments!';
    }
    
    if (message.includes('voice') || message.includes('audio') || message.includes('microphone')) {
      return 'Yes! The app supports voice input:\n\n• Use the microphone button in the comments section\n• Speak your additional details about the issue\n• Voice input is converted to text automatically\n• This helps when typing is difficult';
    }
    
    if (message.includes('gps') || message.includes('location') || message.includes('map')) {
      return 'The app automatically captures your GPS location when taking photos. This helps authorities:\n\n• Locate the exact problem spot\n• Route repair teams efficiently\n• Track issue resolution progress\n• You can also view reports on the map';
    }
    
    if (message.includes('government') || message.includes('authority') || message.includes('response')) {
      return 'Reports are sent directly to Jharkhand Government authorities who:\n\n• Review submissions based on urgency\n• Dispatch appropriate teams for resolution\n• Typically respond within 3-7 business days\n• Provide updates on issue status\n\nYour civic participation helps improve Jharkhand!';
    }

    return 'I\'m here to help with the Jharkhand CivicReport app! You can ask me about:\n\n• Reporting civic issues\n• Using app features (camera, voice, GPS)\n• Government response process\n• Technical support\n\nWhat would you like to know?';
  };

  const saveMessageToStorage = async (userMsg: Message, assistantMsg: Message) => {
    if (!user) return;

    try {
      if (supabase) {
        // Try to save to Supabase
        await supabase.from('messages').insert([
          { ...userMsg, user_id: user.id },
          { ...assistantMsg, user_id: user.id }
        ]);
      }
    } catch (error) {
      console.warn('Failed to save to Supabase, using localStorage');
    }

    // Always save to localStorage as backup
    const allMessages = [...messages, userMsg, assistantMsg];
    localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(allMessages));
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMsg]);

    try {
      console.log('🤖 Sending message to Gemini AI:', userMessage);
      
      // Call Gemini API
      const aiResponse = await callGeminiAPI(userMessage);
      
      console.log('✅ Got response from Gemini AI');

      // Create assistant message
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
      };

      // Add assistant message to UI
      setMessages(prev => [...prev, assistantMsg]);

      // Save both messages
      await saveMessageToStorage(userMsg, assistantMsg);

    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      setError(error.message || 'Failed to send message. Please try again.');
      
      // Add fallback response
      const fallbackMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getFallbackResponse(userMessage),
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, fallbackMsg]);
      await saveMessageToStorage(userMsg, fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
        <div className="p-6 text-center">
          <Bot className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Assistant
          </h3>
          <p className="text-gray-600 mb-4">
            Get help with civic reporting and using the app features.
          </p>
          
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={signInAnonymously}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">
              {GEMINI_API_KEY ? 'Powered by Gemini AI' : 'Local responses only'}
            </p>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 max-h-96 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>Start a conversation by typing a message below!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {message.role === 'user' ? (
                <UserIcon className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 opacity-70`}>
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about civic reporting, app features, or technical help..."
            className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {GEMINI_API_KEY ? '🤖 AI responses enabled' : '⚠️ Add VITE_GEMINI_API_KEY to .env for AI responses'}
        </p>
      </div>
    </div>
  );
}
