import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { MapPin, Loader2, AlertCircle, Navigation, Home, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})
// Custom icon for user location
const userLocationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})
interface LocationData {
  lat: number
  lng: number
  accuracy?: number
  timestamp: number
}
interface MapViewProps {
  onClose: () => void
}
const MapView = ({ onClose }: MapViewProps) => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState<string>('')
  // Get user location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser')
        setIsLoading(false)
        return
      }
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          }
          
          setUserLocation(locationData)
          setIsLoading(false)
          
          console.log('📍 User location obtained:', locationData)
          
          // Get location name using reverse geocoding
          try {
            await getReverseGeocode(locationData.lat, locationData.lng)
          } catch (err) {
            console.warn('⚠️ Failed to get location name:', err)
          }
        },
        (error) => {
          console.error('❌ Geolocation error:', error)
          setIsLoading(false)
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError('Location access denied. Please enable location services and refresh.')
              break
            case error.POSITION_UNAVAILABLE:
              setError('Location information unavailable. Please check your GPS settings.')
              break
            case error.TIMEOUT:
              setError('Location request timed out. Please try again.')
              break
            default:
              setError('An unknown error occurred while retrieving location.')
              break
          }
        },
        options
      )
    }
    getUserLocation()
  }, [])
  // Reverse geocoding to get location name
  const getReverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      
      if (response.ok) {
        const data = await response.json()
        const address = data.address || {}
        
        // Format location name
        const parts = [
          address.house_number,
          address.road,
          address.neighbourhood || address.suburb,
          address.city || address.town || address.village,
          address.state
        ].filter(Boolean)
        
        setLocationName(parts.join(', '))
        console.log('🏠 Location name:', parts.join(', '))
      }
    } catch (error) {
      console.warn('⚠️ Reverse geocoding failed:', error)
    }
  }
  const refreshLocation = () => {
    setIsLoading(true)
    setError(null)
    setUserLocation(null)
    setLocationName('')
    
    // Re-trigger location fetch
    const getUserLocation = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          }
          
          setUserLocation(locationData)
          setIsLoading(false)
          
          try {
            await getReverseGeocode(locationData.lat, locationData.lng)
          } catch (err) {
            console.warn('⚠️ Failed to get location name:', err)
          }
        },
        (error) => {
          setIsLoading(false)
          setError('Failed to get location. Please try again.')
        }
      )
    }
    
    getUserLocation()
  }
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 animate-fade-in">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Getting Your Location</h3>
          <p className="text-gray-600 mb-6">
            Please allow location access to see the map...
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 animate-fade-in">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refreshLocation}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }
  if (!userLocation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Unavailable</h3>
          <p className="text-gray-600 mb-6">Unable to get your current location.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] m-4 flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Location</h2>
              <p className="text-sm text-gray-600">Current position on map</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshLocation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              title="Refresh location"
            >
              <Navigation className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              title="Close map"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Location Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Address:</span>
              <span className="text-gray-600">
                {locationName || 'Getting address...'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Coordinates:</span>
              <span className="text-gray-600 font-mono text-xs">
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </span>
            </div>
            
            {userLocation.accuracy && (
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Accuracy:</span>
                <span className="text-gray-600">
                  ±{Math.round(userLocation.accuracy)} meters
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-gray-500">🕒</span>
              <span className="font-medium text-gray-700">Updated:</span>
              <span className="text-gray-600">
                {new Date(userLocation.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={16}
            style={{ width: '100%', height: '100%' }}
            className="rounded-b-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={userLocationIcon}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Your Location</span>
                  </div>
                  
                  {locationName && (
                    <p className="text-sm text-gray-700 mb-2">{locationName}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Lat: {userLocation.lat.toFixed(6)}</div>
                    <div>Lng: {userLocation.lng.toFixed(6)}</div>
                    {userLocation.accuracy && (
                      <div>Accuracy: ±{Math.round(userLocation.accuracy)}m</div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-blue-600">
                      📍 This is where you are currently located
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Your Location</span>
              </div>
              <span>Map data © OpenStreetMap contributors</span>
            </div>
            
            <div className="text-right">
              <div>Zoom: 16x</div>
              <div>Updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MapView