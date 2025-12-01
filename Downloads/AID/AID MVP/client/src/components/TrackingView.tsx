import { useState, useEffect } from 'react'
import axios from 'axios'
import { calculateDistance } from '../utils/geolocation'

interface TrackingViewProps {
  request: any
  userLocation: { lat: number; lng: number } | null
  onCancel: () => void
}

export default function TrackingView({ request, userLocation, onCancel }: TrackingViewProps) {
  const [mechanicLocation, setMechanicLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [eta, setEta] = useState<number | null>(null)

  useEffect(() => {
    const fetchMechanicLocation = async () => {
      try {
        const response = await axios.get('/api/mechanics/online')
        const mechanic = response.data.find((m: any) => m.user_id === request.mechanic_id)
        if (mechanic) {
          setMechanicLocation({
            lat: parseFloat(mechanic.latitude),
            lng: parseFloat(mechanic.longitude)
          })
        }
      } catch (error) {
        console.error('Error fetching mechanic location:', error)
      }
    }

    fetchMechanicLocation()
    const interval = setInterval(fetchMechanicLocation, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [request.mechanic_id])

  useEffect(() => {
    if (userLocation && mechanicLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        mechanicLocation.lat,
        mechanicLocation.lng
      )
      // Estimate ETA: assume average speed of 30 km/h in city
      const estimatedMinutes = Math.round((distance / 30) * 60)
      setEta(estimatedMinutes)
    }
  }, [userLocation, mechanicLocation])

  const handleComplete = async () => {
    try {
      await axios.patch(`/api/requests/${request.id}/status`, { status: 'completed' })
      onCancel()
    } catch (error) {
      console.error('Error completing request:', error)
      alert('Failed to complete request')
    }
  }

  const handleCancelRequest = async () => {
    if (confirm('Are you sure you want to cancel this request?')) {
      try {
        await axios.patch(`/api/requests/${request.id}/status`, { status: 'cancelled' })
        onCancel()
      } catch (error) {
        console.error('Error cancelling request:', error)
        alert('Failed to cancel request')
      }
    }
  }

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-black/90 to-purple-900/40 border-2 border-purple-500/20 rounded-2xl shadow-xl p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Tracking Service</h3>
            <p className="text-xs sm:text-sm text-purple-300">Mechanic: {request.mechanic_name || 'Unknown'}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-purple-400 active:text-pink-400 transition-colors text-2xl leading-none touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {request.status === 'accepted' && (
          <>
            {mechanicLocation && userLocation ? (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-300">Distance:</span>
                  <span className="font-semibold text-purple-200">
                    {calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      mechanicLocation.lat,
                      mechanicLocation.lng
                    ).toFixed(1)} km
                  </span>
                </div>
                {eta !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-300">Estimated ETA:</span>
                    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{eta} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-purple-500/20">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, (eta ? 100 - (eta / 60) * 100 : 0))}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-purple-400 mb-4">Waiting for mechanic location...</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl active:from-green-500 active:to-emerald-500 transition-all font-semibold text-sm shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[44px]"
              >
                Mark Complete
              </button>
              <button
                onClick={handleCancelRequest}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg active:bg-gray-700/50 transition-colors font-semibold text-sm touch-manipulation min-h-[44px]"
              >
                Cancel Request
              </button>
            </div>
          </>
        )}

        {request.status === 'pending' && (
          <div className="text-center py-3 sm:py-4">
            <p className="text-purple-300 mb-2 text-sm sm:text-base">⏳ Waiting for mechanic to accept...</p>
            <button
              onClick={handleCancelRequest}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg active:bg-gray-700/50 transition-colors font-semibold text-sm touch-manipulation min-h-[44px]"
            >
              Cancel Request
            </button>
          </div>
        )}

        {request.status === 'declined' && (
          <div className="text-center py-3 sm:py-4">
            <p className="text-red-400 mb-2 font-semibold text-sm sm:text-base">❌ Request was declined</p>
            <p className="text-xs sm:text-sm text-purple-300 mb-3">You can request another mechanic</p>
            <button
              onClick={onCancel}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg active:bg-gray-700/50 transition-colors font-semibold text-sm touch-manipulation min-h-[44px]"
            >
              Close
            </button>
          </div>
        )}

        {request.status === 'completed' && (
          <div className="text-center py-3 sm:py-4">
            <p className="text-green-400 mb-2 font-semibold text-sm sm:text-base">✅ Service completed!</p>
            <button
              onClick={onCancel}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg active:bg-gray-700/50 transition-colors font-semibold text-sm touch-manipulation min-h-[44px]"
            >
              Close
            </button>
          </div>
        )}

        {request.status === 'cancelled' && (
          <div className="text-center py-3 sm:py-4">
            <p className="text-purple-300 mb-2 text-sm sm:text-base">Request cancelled</p>
            <button
              onClick={onCancel}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg active:bg-gray-700/50 transition-colors font-semibold text-sm touch-manipulation min-h-[44px]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

