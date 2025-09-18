import { Camera, MapPin, FileText, Menu, X, Users } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  onMapClick?: () => void
  onCommunityClick?: () => void
}

const Navbar = ({ onMapClick, onCommunityClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Jharkhand CivicReport</h1>
              <p className="text-xs text-gray-500">A Govt. of Jharkhand Initiative</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#report" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <Camera className="w-4 h-4" />
              <span>Report Issue</span>
            </a>
            
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
            
            <a 
              href="#reports" 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </a>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              <a 
                href="#report" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Camera className="w-4 h-4" />
                <span>Report Issue</span>
              </a>
              
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
              
              <a 
                href="#reports" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="w-4 h-4" />
                <span>My Reports</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar