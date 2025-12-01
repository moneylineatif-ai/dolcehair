import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCurrentLocation } from '../utils/geolocation'
import axios from 'axios'
import IncomingRequests from './IncomingRequests'
import ActiveRequestCard from './ActiveRequestCard'
import TowRequestsList from './TowRequestsList'

export default function MechanicDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isOnline, setIsOnline] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeRequest, setActiveRequest] = useState<any>(null)
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleSignOut = () => {
    // Stop location tracking if online
    if (isOnline) {
      stopLocationTracking()
    }
    logout()
    navigate('/map')
  }

  // Fetch current status on mount
  useEffect(() => {
    fetchStatus()
    fetchActiveRequest()
  }, [])

  const fetchActiveRequest = async () => {
    try {
      const response = await axios.get('/api/requests/mechanic/all')
      const active = response.data.find((r: any) => 
        r.status === 'accepted' || r.status === 'in_progress'
      )
      setActiveRequest(active || null)
    } catch (error) {
      console.error('Error fetching active request:', error)
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchActiveRequest, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/mechanics/status')
      const status = response.data
      setIsOnline(status.is_online || false)
      if (status.latitude && status.longitude) {
        setLocation({ lat: parseFloat(status.latitude), lng: parseFloat(status.longitude) })
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    }
  }

  const startLocationTracking = async () => {
    try {
      setLocationError(null)
      setLoading(true)

      const currentLocation = await getCurrentLocation()
      setLocation(currentLocation)

      await axios.post('/api/mechanics/location', {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        isOnline: true
      })

      setIsOnline(true)
      setLoading(false)

      locationIntervalRef.current = setInterval(async () => {
        try {
          const newLocation = await getCurrentLocation()
          setLocation(newLocation)

          await axios.post('/api/mechanics/location', {
            latitude: newLocation.lat,
            longitude: newLocation.lng,
            isOnline: true
          })
        } catch (error) {
          console.error('Error updating location:', error)
        }
      }, 10000)
    } catch (error: any) {
      console.error('Error starting location tracking:', error)
      setLocationError(
        error.message === 'User denied Geolocation'
          ? 'Location access denied. Please enable location permissions to go online.'
          : 'Unable to get your location. Please check your browser settings.'
      )
      setLoading(false)
    }
  }

  const stopLocationTracking = async () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }

    try {
      await axios.post('/api/mechanics/availability', {
        isOnline: false
      })

      setIsOnline(false)
      setLocation(null)
    } catch (error) {
      console.error('Error stopping location tracking:', error)
    }
  }

  const handleToggle = async () => {
    if (isOnline) {
      await stopLocationTracking()
    } else {
      await startLocationTracking()
    }
  }

  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isOnline) {
        navigator.sendBeacon('/api/mechanics/availability', JSON.stringify({ isOnline: false }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isOnline])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <nav className="bg-black/80 backdrop-blur-md border-b border-purple-500/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-glow">Mechanic Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-purple-300 hidden sm:inline">
                Mechanic View
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-all font-semibold text-sm shadow-lg active:scale-[0.95] transform"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-br from-black/90 to-purple-900/30 border border-purple-500/20 rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">Availability Status</h2>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-300 mb-2">
                  Current Status: <span className={`font-semibold ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </p>
                {location && (
                  <p className="text-sm text-purple-400">
                    Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                )}
                {locationError && (
                  <p className="text-sm text-red-400 mt-2">{locationError}</p>
                )}
              </div>
              
              <button
                onClick={handleToggle}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  isOnline
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg'
                } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transform`}
              >
                {loading ? 'Processing...' : isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            {isOnline && (
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
                <p className="text-sm text-green-300">
                  ✓ You are visible to customers on the map. Your location is being updated automatically.
                </p>
              </div>
            )}
          </div>

          {activeRequest && (
            <ActiveRequestCard
              request={activeRequest}
              mechanicLocation={location}
              onStatusUpdate={fetchActiveRequest}
            />
          )}

          {/* Earnings Section */}
          <div className="bg-gradient-to-br from-black/90 to-purple-900/30 border border-purple-500/20 rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">Earnings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-black/60 backdrop-blur-sm border border-green-500/30 p-4 rounded-xl">
                <p className="text-green-400 text-sm mb-1">Today</p>
                <p className="text-2xl font-bold text-green-300">$245</p>
                <p className="text-xs text-green-400/70 mt-1">3 services completed</p>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-purple-500/30 p-4 rounded-xl">
                <p className="text-purple-400 text-sm mb-1">This Week</p>
                <p className="text-2xl font-bold text-purple-300">$1,420</p>
                <p className="text-xs text-purple-400/70 mt-1">18 services completed</p>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-pink-500/30 p-4 rounded-xl">
                <p className="text-pink-400 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold text-pink-300">$5,680</p>
                <p className="text-xs text-pink-400/70 mt-1">72 services completed</p>
              </div>
            </div>

            {/* Recent Earnings */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Recent Repairs</h3>
              <div className="space-y-2">
                {[
                  { service: 'Brake Repair', customer: 'John D.', amount: '$180', date: '2 hours ago', status: 'completed' },
                  { service: 'Oil Change', customer: 'Sarah M.', amount: '$45', date: '5 hours ago', status: 'completed' },
                  { service: 'Engine Diagnostic', customer: 'Mike T.', amount: '$120', date: 'Yesterday', status: 'completed' },
                  { service: 'Tire Replacement', customer: 'Lisa K.', amount: '$95', date: 'Yesterday', status: 'completed' },
                  { service: 'Battery Replacement', customer: 'David R.', amount: '$150', date: '2 days ago', status: 'completed' }
                ].map((repair, index) => (
                  <div key={index} className="bg-black/40 backdrop-blur-sm border border-purple-500/20 p-3 rounded-lg flex items-center justify-between hover:border-purple-400/40 transition-all">
                    <div className="flex-1">
                      <p className="text-purple-300 font-medium text-sm">{repair.service}</p>
                      <p className="text-purple-400 text-xs">{repair.customer} • {repair.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{repair.amount}</p>
                      <span className="inline-block px-2 py-0.5 bg-green-900/50 border border-green-500/30 text-green-300 text-[10px] rounded-full mt-1">
                        {repair.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incoming Requests Section */}
          {isOnline && !activeRequest && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">Incoming Requests</h2>
              <IncomingRequests mechanicLocation={location} />
            </div>
          )}

          {/* Tow Requests Section - Always visible for towing companies */}
          <TowRequestsList />
        </div>
      </main>
    </div>
  )
}

