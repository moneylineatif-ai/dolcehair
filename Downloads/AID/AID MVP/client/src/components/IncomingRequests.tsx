import { useState, useEffect } from 'react'
import axios from 'axios'
import { calculateDistance } from '../utils/geolocation'

interface IncomingRequestsProps {
  mechanicLocation: { lat: number; lng: number } | null
}

export default function IncomingRequests({ mechanicLocation }: IncomingRequestsProps) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPendingRequests()
    const interval = setInterval(fetchPendingRequests, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/requests/mechanic/pending')
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const handleAccept = async (requestId: number) => {
    setLoading(true)
    try {
      await axios.post(`/api/requests/${requestId}/accept`)
      fetchPendingRequests()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept request')
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async (requestId: number) => {
    setLoading(true)
    try {
      await axios.post(`/api/requests/${requestId}/decline`)
      fetchPendingRequests()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to decline request')
    } finally {
      setLoading(false)
    }
  }

  if (requests.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-black/90 to-purple-900/30 border border-purple-500/20 rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 text-glow">Incoming Requests</h2>
      <div className="space-y-4">
        {requests.map((request) => {
          const distance = mechanicLocation
            ? calculateDistance(
                mechanicLocation.lat,
                mechanicLocation.lng,
                request.customer_latitude,
                request.customer_longitude
              )
            : null

          return (
            <div key={request.id} className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 hover:border-purple-400/40 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-purple-300">{request.customer_name}</h3>
                  <p className="text-sm text-purple-400">{request.customer_email}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 text-xs rounded-full">
                  Pending
                </span>
              </div>

              {request.service_type && (
                <p className="text-sm text-purple-200 mb-2">
                  <span className="font-medium">Service:</span> {request.service_type}
                </p>
              )}

              {request.description && (
                <p className="text-sm text-purple-300 mb-2">{request.description}</p>
              )}

              {distance !== null && (
                <p className="text-sm text-purple-400 mb-3">
                  📍 {distance < 1 ? `${(distance * 1000).toFixed(0)}m away` : `${distance.toFixed(1)}km away`}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all font-semibold disabled:opacity-50 shadow-lg hover:scale-[1.02] transform"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(request.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-all font-semibold disabled:opacity-50 shadow-lg hover:scale-[1.02] transform"
                >
                  Decline
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

