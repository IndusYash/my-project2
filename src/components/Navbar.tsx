import { Camera, MapPin, FileText, Menu, X, Users, User, LogOut, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface NavbarProps {
  onMapClick?: () => void
  onCommunityClick?: () => void
  onProfileClick?: () => void
  onAuthClick?: () => void
}

const Navbar = ({ onMapClick, onCommunityClick, onProfileClick, onAuthClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleMapClick = () => {
    setIsMenuOpen(false)
    if (onMapClick) {
      onMapClick()
    }
  }

  const handleCommunityClick = () => {
    setIsMenuOpen(false)
    if (onCommunityClick) {
      onCommunityClick()
    }
  }

  const handleProfileClick = () => {
    setIsMenuOpen(false)
    // If not authenticated, show auth modal instead of blocking access
    if (!isAuthenticated && onAuthClick) {
      onAuthClick()
      return
    }
    if (onProfileClick) {
      onProfileClick()
    }
  }

  const handleAuthClick = () => {
    setIsMenuOpen(false)
    if (onAuthClick) {
      onAuthClick()
    }
  }

  const handleLogout = () => {
    setIsMenuOpen(false)
    logout()
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Jharkhand CivicReport</h1>
              <p className="text-xs text-gray-500">A Govt. of Jharkhand Initiative</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            
            <button
              onClick={handleMapClick}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <MapPin className="w-4 h-4" />
              <span>View Map</span>
            </button>

            <button
              onClick={handleCommunityClick}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <Users className="w-4 h-4" />
              <span>Community</span>
            </button>

            {/* Profile button - available for everyone */}
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
              title={isAuthenticated ? "View your profile" : "Sign in to access profile"}
            >
              <User className="w-4 h-4" />
              <span>{isAuthenticated ? "My Profile" : "Profile"}</span>
            </button>

            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="flex items-center space-x-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg font-medium"
                title="Optional: Sign in to track your reports"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In (Optional)</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              
              <button
                onClick={handleMapClick}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors text-left w-full"
              >
                <MapPin className="w-4 h-4" />
                <span>View Map</span>
              </button>

              <button
                onClick={handleCommunityClick}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors text-left w-full"
              >
                <Users className="w-4 h-4" />
                <span>Community</span>
              </button>

              {/* Profile button - available for everyone in mobile */}
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors text-left w-full"
              >
                <User className="w-4 h-4" />
                <span>{isAuthenticated ? "My Profile" : "Profile (Sign in required)"}</span>
              </button>

              {/* Mobile Authentication Section */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">{user?.name}</span>
                        <p className="text-xs text-gray-500">Signed in</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors text-left w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <button
                      onClick={handleAuthClick}
                      className="flex items-center space-x-2 bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded-md transition-colors text-left w-full font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In (Optional)</span>
                    </button>
                    
                    {/* Benefits message for mobile */}
                    <div className="px-3 py-2 text-xs text-gray-500">
                      💡 Sign in to track reports and get updates
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
