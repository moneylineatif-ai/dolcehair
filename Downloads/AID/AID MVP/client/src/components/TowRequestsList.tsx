import { useState, useEffect } from 'react'
import axios from 'axios'

interface TowRequest {
  id: number
  customer_id: number
  pickup_address: string
  dropoff_address: string
  vehicle_info?: string
  latitude: number
  longitude: number
  status: string
  accepted_by?: number
  bid_amount?: number
  created_at: string
}

export default function TowRequestsList() {
  const [pendingRequests, setPendingRequests] = useState<TowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<TowRequest | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPendingRequests()
    // Poll for new requests every 5 seconds
    const interval = setInterval(fetchPendingRequests, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/tow-requests/pending')
      setPendingRequests(response.data)
    } catch (error) {
      console.error('Error fetching tow requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (request: TowRequest) => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`/api/tow-requests/${request.id}/accept`, {
        bidAmount: parseFloat(bidAmount),
        towingCompanyId: 1 // For demo
      })
      setSelectedRequest(null)
      setBidAmount('')
      fetchPendingRequests()
      alert('Bid submitted successfully!')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit bid')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-700/50 rounded-xl shadow-2xl p-6 mb-6">
        <p className="text-purple-300">Loading tow requests...</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-700/50 rounded-xl shadow-2xl p-6 mb-6">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
        Tow Requests - Bidding Available
      </h2>

      {pendingRequests.length === 0 ? (
        <p className="text-purple-300">No pending tow requests at the moment.</p>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="bg-black/60 backdrop-blur-sm border border-purple-700/50 rounded-xl p-4 hover:border-purple-500/70 transition-all cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-300 font-semibold">Request #{request.id}</span>
                    <span className="bg-yellow-900/50 text-yellow-300 text-xs rounded-full border border-yellow-700/50 px-2 py-1">
                      PENDING BIDS
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-purple-200">
                    <p><span className="text-purple-400">📍 Pickup:</span> {request.pickup_address}</p>
                    <p><span className="text-purple-400">🎯 Drop-off:</span> {request.dropoff_address}</p>
                    {request.vehicle_info && (
                      <p><span className="text-purple-400">🚗 Vehicle:</span> {request.vehicle_info}</p>
                    )}
                    <p className="text-xs text-purple-400/70 mt-2">
                      Created: {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-purple-950/50 border border-purple-500/30 rounded-3xl shadow-2xl max-w-md w-full p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Submit Bid for Request #{selectedRequest.id}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-purple-400 mb-1">Pickup Location</p>
                <p className="text-purple-200">{selectedRequest.pickup_address}</p>
              </div>
              <div>
                <p className="text-sm text-purple-400 mb-1">Drop-off Location</p>
                <p className="text-purple-200">{selectedRequest.dropoff_address}</p>
              </div>
              {selectedRequest.vehicle_info && (
                <div>
                  <p className="text-sm text-purple-400 mb-1">Vehicle</p>
                  <p className="text-purple-200">{selectedRequest.vehicle_info}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Your Bid Amount ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter your bid"
                className="w-full px-5 py-3 bg-black/40 border border-purple-500/20 text-purple-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 placeholder-purple-500/40 transition-all backdrop-blur-sm hover:border-purple-400/30"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setBidAmount('')
                }}
                disabled={submitting}
                className="flex-1 px-6 py-3.5 bg-gray-900/50 border border-gray-700/50 text-gray-300 rounded-2xl hover:bg-gray-800/50 hover:border-gray-600/50 transition-all font-semibold disabled:opacity-50 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAcceptRequest(selectedRequest)}
                disabled={submitting || !bidAmount}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 text-white rounded-2xl hover:from-gray-600 hover:via-gray-700 hover:to-gray-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-gray-500/25 hover:scale-[1.02] active:scale-[0.98] transform"
              >
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







