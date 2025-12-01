import { useState, useEffect, useCallback } from 'react'
import { getCurrentLocation, UserLocation, calculateDistance } from '../utils/geolocation'
import axios from 'axios'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

interface Mechanic {
  userId: number
  name: string
  latitude: number
  longitude: number
  rating?: number
  status: 'online' | 'offline'
}

interface ServiceMapProps {
  onRequestService?: (mechanicId: number, mechanicName: string) => void
  onMechanicsCountChange?: (count: number) => void
  onLocationUpdate?: (location: { lat: number; lng: number }) => void
  onMechanicsUpdate?: (mechanics: Mechanic[]) => void
}

export default function ServiceMap({ onRequestService, onMechanicsCountChange, onLocationUpdate, onMechanicsUpdate }: ServiceMapProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [viewport, setViewport] = useState({
    latitude: 32.7767, // Dallas, TX
    longitude: -96.7970,
    zoom: 12
  })
  const [mechanics, setMechanics] = useState<Map<number, Mechanic>>(new Map())
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(true)

  // Fetch initial online mechanics
  useEffect(() => {
    fetchOnlineMechanics()
  }, [])

  const fetchOnlineMechanics = async () => {
    try {
      const response = await axios.get('/api/mechanics/online')
      const mechanicsMap = new Map<number, Mechanic>()
      
      response.data.forEach((m: any) => {
        mechanicsMap.set(m.user_id, {
          userId: m.user_id,
          name: m.name,
          latitude: parseFloat(m.latitude),
          longitude: parseFloat(m.longitude),
          status: 'online',
          rating: 4.5 // Default rating, can be fetched from backend later
        })
      })
      
      setMechanics(mechanicsMap)
      if (onMechanicsCountChange) {
        onMechanicsCountChange(mechanicsMap.size)
      }
      if (onMechanicsUpdate) {
        onMechanicsUpdate(Array.from(mechanicsMap.values()))
      }
    } catch (error) {
      console.error('Error fetching online mechanics:', error)
    }
  }

  // Get user's current location
  useEffect(() => {
    getCurrentLocation()
      .then((location) => {
        setUserLocation(location)
        if (onLocationUpdate) {
          onLocationUpdate(location)
        }
        setViewport({
          latitude: location.lat,
          longitude: location.lng,
          zoom: 13
        })
        setLoadingLocation(false)
      })
      .catch((error) => {
        console.error('Geolocation error:', error)
        setLocationError(
          error.message === 'User denied Geolocation'
            ? 'Location access denied. Using default location.'
            : 'Unable to get your location. Using default location.'
        )
        // Default to Dallas, TX if geolocation fails
        const dallasLocation = { lat: 32.7767, lng: -96.7970 }
        setUserLocation(dallasLocation)
        if (onLocationUpdate) {
          onLocationUpdate(dallasLocation)
        }
        setViewport({
          latitude: 32.7767,
          longitude: -96.7970,
          zoom: 12
        })
        setLoadingLocation(false)
      })
  }, [])

  // Poll for mechanic updates periodically (replaces Socket.IO)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOnlineMechanics()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [onMechanicsCountChange])

  const handleMarkerClick = useCallback((mechanic: Mechanic) => {
    setSelectedMechanic(mechanic)
  }, [])

  const handleRequestService = useCallback(
    (mechanicId: number, mechanicName: string) => {
      if (onRequestService) {
        onRequestService(mechanicId, mechanicName)
      }
      setSelectedMechanic(null)
    },
    [onRequestService]
  )

  // Convert mechanics map to array
  const onlineMechanics = Array.from(mechanics.values())

  return (
    <>
    <div className="relative w-full h-full">
      {/* Available Mechanics Count Tab */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-black/80 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-purple-300 text-xs sm:text-sm font-medium hidden sm:inline">Available Mechanics in Your Area:</span>
          <span className="text-purple-300 text-xs sm:text-sm font-medium sm:hidden">Mechanics:</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-lg sm:text-xl font-bold">
            {onlineMechanics.length}
          </span>
        </div>
      </div>

      {loadingLocation && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 bg-black/80 backdrop-blur-sm border border-purple-500/20 px-3 sm:px-4 py-2 rounded-xl shadow-md">
          <p className="text-xs sm:text-sm text-purple-300">Getting your location...</p>
        </div>
      )}

      {locationError && (
        <div className="absolute top-12 sm:top-16 left-2 sm:left-4 z-10 bg-yellow-900/50 border border-yellow-500/50 px-3 sm:px-4 py-2 rounded-xl shadow-md max-w-[calc(100%-1rem)] sm:max-w-xs">
          <p className="text-xs sm:text-sm text-yellow-300">{locationError}</p>
        </div>
      )}

      {/* Map Visualization */}
      <div className="w-full h-full relative" style={{ height: '600px' }}>
        {/* Embedded OpenStreetMap for Dallas, TX */}
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${viewport.longitude - 0.1},${viewport.latitude - 0.05},${viewport.longitude + 0.1},${viewport.latitude + 0.05}&layer=mapnik&marker=${viewport.latitude},${viewport.longitude}`}
          className="absolute inset-0"
          style={{ border: 'none' }}
        />
        
        {/* Overlay with mechanics markers */}
        <div className="absolute inset-0 pointer-events-none">
          {onlineMechanics.map((mechanic) => {
            // Convert lat/lng to pixel position (simplified calculation for Dallas area)
            const latRange = 0.15 // Approximate range for zoom level 12
            const lngRange = 0.15
            const xPercent = ((mechanic.longitude - (viewport.longitude - lngRange/2)) / lngRange) * 100
            const yPercent = ((viewport.latitude + latRange/2 - mechanic.latitude) / latRange) * 100
            
            return (
              <div
                key={mechanic.userId}
                className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${Math.max(5, Math.min(95, xPercent))}%`,
                  top: `${Math.max(5, Math.min(95, yPercent))}%`,
                }}
                onClick={() => handleMarkerClick(mechanic)}
              >
                <div className="bg-purple-600 rounded-full p-2 shadow-lg border-2 border-purple-300 hover:scale-125 transition-transform">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-purple-500/20 rounded-lg px-2 py-1 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-xs text-purple-300 font-semibold">{mechanic.name}</p>
                </div>
              </div>
            )
          })}
          
          {/* User location marker */}
          {userLocation && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30"
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              <div className="bg-blue-500 rounded-full p-2 shadow-lg border-2 border-blue-300">
                <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Mechanics List Overlay (Bottom Right) */}
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10 bg-black/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl p-2 sm:p-4 max-w-[calc(50%-0.5rem)] sm:max-w-xs max-h-48 sm:max-h-64 overflow-y-auto scrollbar-hide">
          <h3 className="text-xs sm:text-sm font-bold text-purple-300 mb-1 sm:mb-2">Available Mechanics</h3>
          {onlineMechanics.length === 0 ? (
            <p className="text-purple-400 text-xs">No mechanics available</p>
          ) : (
            <div className="space-y-2">
              {onlineMechanics.map((mechanic) => {
                const distance = userLocation
                  ? calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      mechanic.latitude,
                      mechanic.longitude
                    )
                  : null

                return (
                  <div
                    key={mechanic.userId}
                    className="bg-black/60 border border-purple-500/20 rounded-lg p-2 cursor-pointer hover:border-purple-400/40 transition-all"
                    onClick={() => handleMarkerClick(mechanic)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300 font-semibold">{mechanic.name}</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    {distance !== null && (
                      <p className="text-xs text-purple-400 mt-1">
                        {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`} away
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Mechanic Popup */}
      {selectedMechanic && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20 p-3 sm:p-4 safe-area-inset">
          <div className="bg-gradient-to-br from-black/90 to-purple-900/40 border border-purple-500/20 rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{selectedMechanic.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-semibold text-purple-300">
                    {selectedMechanic.rating?.toFixed(1) || '4.5'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMechanic(null)}
                className="text-purple-400 active:text-pink-400 transition-colors text-2xl leading-none touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {userLocation && (
              <p className="text-sm text-purple-200 mb-3 sm:mb-4">
                📍 {calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  selectedMechanic.latitude,
                  selectedMechanic.longitude
                ).toFixed(1)}km away
              </p>
            )}

            <button
              onClick={() => {
                handleRequestService(selectedMechanic.userId, selectedMechanic.name)
                setSelectedMechanic(null)
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl active:from-purple-500 active:to-pink-500 transition-all font-semibold shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[50px]"
            >
              Request Service
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

