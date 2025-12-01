import { useState, useEffect } from 'react'
import axios from 'axios'
import { calculateDistance } from '../utils/geolocation'

interface ActiveRequestCardProps {
  request: any
  mechanicLocation: { lat: number; lng: number } | null
  onStatusUpdate: () => void
}

export default function ActiveRequestCard({ request, mechanicLocation, onStatusUpdate }: ActiveRequestCardProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (status: string) => {
    setLoading(true)
    try {
      await axios.patch(`/api/requests/${request.id}/status`, { status })
      onStatusUpdate()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const distance = mechanicLocation
    ? calculateDistance(
        mechanicLocation.lat,
        mechanicLocation.lng,
        request.customer_latitude,
        request.customer_longitude
      )
    : null

  return (
    <div className="bg-gradient-to-br from-black/90 to-purple-900/40 border-2 border-purple-500/20 rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Active Request</h3>
          <p className="text-sm text-purple-300">Customer: {request.customer_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          request.status === 'accepted' ? 'bg-green-900/50 border border-green-500/50 text-green-300' :
          request.status === 'in_progress' ? 'bg-blue-900/50 border border-blue-500/50 text-blue-300' :
          'bg-yellow-900/50 border border-yellow-500/50 text-yellow-300'
        }`}>
          {request.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {request.service_type && (
        <p className="text-sm text-purple-200 mb-2">
          <span className="font-medium">Service:</span> {request.service_type}
        </p>
      )}

      {request.description && (
        <p className="text-sm text-purple-300 mb-3">{request.description}</p>
      )}

      {distance !== null && (
        <p className="text-sm text-purple-400 mb-4">
          📍 Customer is {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`} away
        </p>
      )}

      <div className="flex gap-2">
        {request.status === 'accepted' && (
          <button
            onClick={() => handleStatusChange('in_progress')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all font-semibold disabled:opacity-50 shadow-lg hover:scale-[1.02] transform"
          >
            Start Service
          </button>
        )}
        {request.status === 'in_progress' && (
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all font-semibold disabled:opacity-50 shadow-lg hover:scale-[1.02] transform"
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  )
}

