import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthContextType, AuthUser, LoginCredentials, SignupCredentials } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('jharkhand-civic-user')
        const authToken = localStorage.getItem('jharkhand-civic-token')
        
        if (savedUser && authToken) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
          console.log('✅ User restored from localStorage:', parsedUser.name)
        }
      } catch (error) {
        console.error('❌ Error restoring user session:', error)
        // Clear corrupted data
        localStorage.removeItem('jharkhand-civic-user')
        localStorage.removeItem('jharkhand-civic-token')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check against stored users (in real app, this would be an API call)
      const storedUsers = JSON.parse(localStorage.getItem('jharkhand-civic-users') || '[]')
      const foundUser = storedUsers.find((u: any) => u.email === credentials.email)
      
      if (!foundUser) {
        throw new Error('User not found. Please check your email or sign up.')
      }
      
      if (foundUser.password !== credentials.password) {
        throw new Error('Invalid password. Please try again.')
      }
      
      // Create auth user object (exclude password)
      const authUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        avatar: foundUser.avatar,
        joinedDate: foundUser.joinedDate,
        isVerified: foundUser.isVerified || true
      }
      
      // Generate mock token
      const token = btoa(`${authUser.id}-${Date.now()}`)
      
      // Save to localStorage
      localStorage.setItem('jharkhand-civic-user', JSON.stringify(authUser))
      localStorage.setItem('jharkhand-civic-token', token)
      
      setUser(authUser)
      setIsAuthenticated(true)
      
      console.log('✅ User logged in successfully:', authUser.name)
      
    } catch (error: any) {
      console.error('❌ Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true)
    
    try {
      // Validate input
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem('jharkhand-civic-users') || '[]')
      const existingUser = storedUsers.find((u: any) => u.email === credentials.email)
      
      if (existingUser) {
        throw new Error('User with this email already exists. Please login instead.')
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name: credentials.name.trim(),
        email: credentials.email.toLowerCase(),
        password: credentials.password, // In real app, this would be hashed
        phone: credentials.phone,
        joinedDate: new Date().toISOString(),
        isVerified: true,
        avatar: undefined
      }
      
      // Save to users list
      storedUsers.push(newUser)
      localStorage.setItem('jharkhand-civic-users', JSON.stringify(storedUsers))
      
      // Create auth user object (exclude password)
      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar,
        joinedDate: newUser.joinedDate,
        isVerified: newUser.isVerified
      }
      
      // Generate mock token
      const token = btoa(`${authUser.id}-${Date.now()}`)
      
      // Save to localStorage
      localStorage.setItem('jharkhand-civic-user', JSON.stringify(authUser))
      localStorage.setItem('jharkhand-civic-token', token)
      
      setUser(authUser)
      setIsAuthenticated(true)
      
      console.log('✅ User signed up successfully:', authUser.name)
      
    } catch (error: any) {
      console.error('❌ Signup error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    
    // Clear localStorage
    localStorage.removeItem('jharkhand-civic-user')
    localStorage.removeItem('jharkhand-civic-token')
    
    console.log('✅ User logged out successfully')
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedUser = { ...user, ...updates }
      
      // Update localStorage
      localStorage.setItem('jharkhand-civic-user', JSON.stringify(updatedUser))
      
      // Update stored users list
      const storedUsers = JSON.parse(localStorage.getItem('jharkhand-civic-users') || '[]')
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...updates }
        localStorage.setItem('jharkhand-civic-users', JSON.stringify(storedUsers))
      }
      
      setUser(updatedUser)
      
      console.log('✅ Profile updated successfully')
      
    } catch (error: any) {
      console.error('❌ Profile update error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}