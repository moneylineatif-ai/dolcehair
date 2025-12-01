import { useState } from 'react'
import axios from 'axios'

interface TowRequestModalProps {
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
  onSuccess: () => void
}

export default function TowRequestModal({
  userLocation,
  onClose,
  onSuccess
}: TowRequestModalProps) {
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [vehicleInfo, setVehicleInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use Dallas default if location not available
    const locationToUse = userLocation || { lat: 32.7767, lng: -96.7970 }

    if (!pickupAddress.trim()) {
      setError('Please enter pickup location.')
      return
    }

    if (!dropoffAddress.trim()) {
      setError('Please enter drop-off location.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/tow-requests', {
        pickupAddress: pickupAddress.trim(),
        dropoffAddress: dropoffAddress.trim(),
        vehicleInfo: vehicleInfo.trim() || undefined,
        latitude: locationToUse.lat,
        longitude: locationToUse.lng,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create tow request')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-30 p-3 sm:p-4 safe-area-inset overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-black to-purple-950/50 border border-purple-500/30 rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-8 backdrop-blur-xl my-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">Request Tow Service</h2>
          <button
            onClick={onClose}
            className="text-purple-400/60 active:text-purple-300 transition-colors text-3xl sm:text-2xl leading-none touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <p className="text-purple-300/80 mb-6 text-sm">
          Towing companies will bid on your request
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-2xl text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="pickupAddress" className="block text-sm font-semibold text-purple-300 mb-2">
              Pickup Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="pickupAddress"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
              className="w-full px-4 sm:px-5 py-3 bg-black/40 border border-purple-500/20 text-purple-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 placeholder-purple-500/40 transition-all backdrop-blur-sm text-base touch-manipulation"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              placeholder="Where should we pick up your vehicle?"
            />
          </div>

          <div>
            <label htmlFor="dropoffAddress" className="block text-sm font-semibold text-purple-300 mb-2">
              Drop-off Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="dropoffAddress"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              required
              className="w-full px-4 sm:px-5 py-3 bg-black/40 border border-purple-500/20 text-purple-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 placeholder-purple-500/40 transition-all backdrop-blur-sm text-base touch-manipulation"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              placeholder="Where should we drop off your vehicle?"
            />
          </div>

          <div>
            <label htmlFor="vehicleInfo" className="block text-sm font-semibold text-purple-300 mb-2">
              Vehicle Information (Optional)
            </label>
            <input
              type="text"
              id="vehicleInfo"
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
              className="w-full px-4 sm:px-5 py-3 bg-black/40 border border-purple-500/20 text-purple-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 placeholder-purple-500/40 transition-all backdrop-blur-sm text-base touch-manipulation"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              placeholder="e.g., 2020 Honda Accord, White"
            />
          </div>

          {userLocation && (
            <div className="text-xs text-purple-400/70 bg-black/30 border border-purple-500/20 rounded-2xl p-3 backdrop-blur-sm">
              📍 GPS Location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-gray-900/50 border border-gray-700/50 text-gray-300 rounded-2xl active:bg-gray-800/50 active:border-gray-600/50 transition-all font-semibold disabled:opacity-50 backdrop-blur-sm touch-manipulation min-h-[50px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 text-white rounded-2xl active:from-gray-600 active:via-gray-700 active:to-gray-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[50px]"
            >
              {loading ? 'Sending...' : 'Request Tow Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
