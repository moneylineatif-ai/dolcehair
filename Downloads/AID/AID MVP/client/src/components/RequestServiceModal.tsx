import { useState } from 'react'
import axios from 'axios'

interface RequestServiceModalProps {
  mechanicId: number
  mechanicName: string
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
  onSuccess: () => void
}

export default function RequestServiceModal({
  mechanicId,
  mechanicName,
  userLocation,
  onClose,
  onSuccess
}: RequestServiceModalProps) {
  const [address, setAddress] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [carIssue, setCarIssue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate rough estimate based on service type (industry standard pricing)
  const calculateEstimate = (serviceType: string): string => {
    switch (serviceType) {
      case 'Tire':
        return '$50 - $200' // Tire repair/replacement
      case 'Engine':
        return '$300 - $1,500' // Engine diagnostics and repair
      case 'Battery':
        return '$100 - $250' // Battery replacement
      case 'Brakes':
        return '$150 - $400' // Brake pad/shoe replacement
      case 'AC/Air Conditioning':
        return '$150 - $500' // AC repair/recharge
      case 'Transmission':
        return '$500 - $2,500' // Transmission repair
      case 'Oil Change':
        return '$30 - $80' // Oil change service
      case 'Detailing':
        return '$50 - $300' // Detailing services (basic wash to full detail)
      case 'Other':
        return '$75 - $300' // General repair
      default:
        return ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use Dallas default if location not available
    const locationToUse = userLocation || { lat: 32.7767, lng: -96.7970 }

    if (!address.trim()) {
      setError('Please enter your address.')
      return
    }

    if (!carIssue.trim()) {
      setError('Please describe what is wrong with your car.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const estimatedPrice = serviceType ? calculateEstimate(serviceType) : undefined
      
      const response = await axios.post('/api/requests', {
        mechanicId,
        latitude: locationToUse.lat,
        longitude: locationToUse.lng,
        address: address.trim(),
        serviceType: serviceType || undefined,
        description: carIssue.trim(),
        roughEstimate: estimatedPrice
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create request')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-30 p-3 sm:p-4 safe-area-inset overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-black to-purple-950/50 border border-purple-500/30 rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-8 backdrop-blur-xl my-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">Request Service</h2>
          <button
            onClick={onClose}
            className="text-purple-400/60 active:text-purple-300 transition-colors text-3xl sm:text-2xl leading-none touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <p className="text-purple-300/80 mb-4 sm:mb-6 text-sm">
          Requesting service from <span className="font-semibold text-purple-200">{mechanicName}</span>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-2xl text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-purple-300 mb-2">
              Your Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-4 sm:px-5 py-3 bg-black/40 border border-purple-500/20 text-purple-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 placeholder-purple-500/40 transition-all backdrop-blur-sm text-base touch-manipulation"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              placeholder="e.g., 123 Main St, Dallas, TX 75201"
            />
          </div>

          <div>
            <label htmlFor="serviceType" className="block text-sm font-semibold text-purple-300 mb-2">
              Service Type
            </label>
            <div className="relative group">
              <select
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 sm:px-5 py-3.5 bg-black/40 border border-purple-500/20 text-purple-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 appearance-none cursor-pointer transition-all backdrop-blur-sm font-medium text-base touch-manipulation"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23c084fc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.75rem',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                <option value="" className="bg-gray-900 text-purple-200 py-3">Select a service type...</option>
                <option value="Tire" className="bg-gray-900 text-purple-200 py-3">Tire</option>
                <option value="Engine" className="bg-gray-900 text-purple-200 py-3">Engine</option>
                <option value="Battery" className="bg-gray-900 text-purple-200 py-3">Battery</option>
                <option value="Brakes" className="bg-gray-900 text-purple-200 py-3">Brakes</option>
                <option value="AC/Air Conditioning" className="bg-gray-900 text-purple-200 py-3">AC/Air Conditioning</option>
                <option value="Transmission" className="bg-gray-900 text-purple-200 py-3">Transmission</option>
                <option value="Oil Change" className="bg-gray-900 text-purple-200 py-3">Oil Change</option>
                <option value="Detailing" className="bg-gray-900 text-purple-200 py-3">Detailing</option>
                <option value="Other" className="bg-gray-900 text-purple-200 py-3">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="carIssue" className="block text-sm font-semibold text-purple-300 mb-2">
              What's Wrong with Your Car? <span className="text-red-400">*</span>
            </label>
            <textarea
              id="carIssue"
              value={carIssue}
              onChange={(e) => setCarIssue(e.target.value)}
              rows={4}
              required
              className="w-full px-4 sm:px-5 py-3 bg-black/40 border border-purple-500/20 text-purple-100 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 placeholder-purple-500/40 transition-all backdrop-blur-sm resize-none text-base touch-manipulation"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              placeholder="Describe the problem with your car... (e.g., Engine won't start, flat tire, strange noise, etc.)"
            />
          </div>

          {serviceType && calculateEstimate(serviceType) && (
            <div className="bg-gradient-to-br from-purple-950/40 to-pink-950/20 border border-purple-500/30 rounded-[1.5rem] p-5 backdrop-blur-sm">
              <label className="block text-sm font-semibold text-purple-300 mb-3">
                Estimated Repair Cost
              </label>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                  {calculateEstimate(serviceType)}
                </span>
                <span className="text-xs text-purple-400/70 font-medium">(industry standard)</span>
              </div>
              <p className="text-xs text-purple-400/70 leading-relaxed">
                💡 This is an industry-standard estimate for {serviceType} service. Final price may vary based on vehicle make/model and specific issue.
              </p>
            </div>
          )}

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
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl active:from-purple-500 active:via-pink-500 active:to-purple-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[50px]"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

