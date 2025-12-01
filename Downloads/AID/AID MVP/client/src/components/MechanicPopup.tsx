import { Mechanic } from '../data/mockMechanics'
import { calculateDistance } from '../utils/geolocation'

interface MechanicPopupProps {
  mechanic: Mechanic
  userLocation: { lat: number; lng: number } | null
  onRequestService: (mechanicId: number) => void
}

export default function MechanicPopup({
  mechanic,
  userLocation,
  onRequestService
}: MechanicPopupProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        mechanic.location.lat,
        mechanic.location.lng
      )
    : null

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[250px] max-w-[300px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{mechanic.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm font-semibold text-gray-700">
              {mechanic.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              mechanic.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-xs text-gray-500 capitalize">{mechanic.status}</span>
        </div>
      </div>

      {distance !== null && (
        <p className="text-sm text-gray-600 mb-2">
          📍 {distance < 1 ? `${(distance * 1000).toFixed(0)}m away` : `${distance.toFixed(1)}km away`}
        </p>
      )}

      {mechanic.hourlyRate && (
        <p className="text-sm text-gray-600 mb-2">
          💰 ${mechanic.hourlyRate}/hour
        </p>
      )}

      {mechanic.specialties && mechanic.specialties.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Specialties:</p>
          <div className="flex flex-wrap gap-1">
            {mechanic.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onRequestService(mechanic.id)}
        disabled={mechanic.status !== 'online'}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
          mechanic.status === 'online'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {mechanic.status === 'online' ? 'Request Service' : 'Unavailable'}
      </button>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Real-time location tracking active
      </p>
    </div>
  )
}

