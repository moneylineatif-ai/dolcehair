import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ServiceMap from '../components/ServiceMap'
import RequestServiceModal from '../components/RequestServiceModal'
import TowRequestModal from '../components/TowRequestModal'
import TrackingView from '../components/TrackingView'
import FeaturedMechanics from '../components/FeaturedMechanics'
import ProductCards from '../components/ProductCards'
import LoginModal from '../components/LoginModal'
import ProfileDropdown from '../components/ProfileDropdown'
import axios from 'axios'

export default function Map() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showTowModal, setShowTowModal] = useState(false)
  const [showGasolineModal, setShowGasolineModal] = useState(false)
  const [selectedMechanic, setSelectedMechanic] = useState<{ id: number; name: string } | null>(null)
  const [onlineMechanicsCount, setOnlineMechanicsCount] = useState(0)
  const [activeRequest, setActiveRequest] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [availableMechanics, setAvailableMechanics] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'map' | 'history' | 'vehicles'>('map')
  const [serviceHistory, setServiceHistory] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [iphoneView, setIphoneView] = useState(false)
  const [iphoneScale, setIphoneScale] = useState(1)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginRole, setLoginRole] = useState<'customer' | 'mechanic' | undefined>(undefined)

  // Calculate scale factor for iPhone view
  useEffect(() => {
    const calculateScale = () => {
      if (!iphoneView) {
        setIphoneScale(1)
        return
      }
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const iphoneWidth = 375
      const iphoneHeight = 812
      const padding = 100 // Padding around iPhone frame
      
      const scaleX = (viewportWidth - padding) / iphoneWidth
      const scaleY = (viewportHeight - padding) / iphoneHeight
      const scale = Math.min(scaleX, scaleY, 0.95) // Cap at 95% to ensure it fits
      setIphoneScale(Math.max(scale, 0.5)) // Minimum 50% scale
    }

    calculateScale()
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [iphoneView])
  
  // Vehicle data
  const vehicles = [
    {
      id: 1,
      make: 'Honda',
      model: 'Accord',
      year: 2020,
      color: 'White',
      licensePlate: 'ABC-1234',
      serviceHistory: [
        { id: 1, date: '2024-01-15', service: 'Oil Change', cost: '$45', mechanic: 'Mike Johnson', status: 'completed' },
        { id: 2, date: '2024-02-20', service: 'Tire Rotation', cost: '$30', mechanic: 'Sarah Williams', status: 'completed' },
        { id: 3, date: '2024-03-10', service: 'Brake Inspection', cost: '$75', mechanic: 'David Chen', status: 'completed' },
      ]
    },
    {
      id: 2,
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      color: 'Silver',
      licensePlate: 'XYZ-5678',
      serviceHistory: [
        { id: 4, date: '2024-01-05', service: 'Battery Replacement', cost: '$150', mechanic: 'Mike Johnson', status: 'completed' },
        { id: 5, date: '2024-02-12', service: 'AC Recharge', cost: '$120', mechanic: 'Sarah Williams', status: 'completed' },
      ]
    },
    {
      id: 3,
      make: 'Lamborghini',
      model: 'Aventador',
      year: 2022,
      color: 'Orange',
      licensePlate: 'LAMBO-1',
      serviceHistory: [
        { id: 6, date: '2024-01-20', service: 'Engine Tune-up', cost: '$800', mechanic: 'David Chen', status: 'completed' },
        { id: 7, date: '2024-03-01', service: 'Transmission Service', cost: '$1,200', mechanic: 'Mike Johnson', status: 'completed' },
      ]
    }
  ]

  // Fetch active request
  useEffect(() => {
    const fetchActiveRequest = async () => {
      try {
        const response = await axios.get('/api/requests/customer/active')
        if (response.data) {
          setActiveRequest(response.data)
        } else {
          setActiveRequest(null)
        }
      } catch (error) {
        console.error('Error fetching active request:', error)
        setActiveRequest(null)
      }
    }

    fetchActiveRequest()
    const interval = setInterval(fetchActiveRequest, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [])

  // Fetch service history
  useEffect(() => {
    const fetchServiceHistory = async () => {
      try {
        const response = await axios.get('/api/requests/customer')
        setServiceHistory(response.data || [])
      } catch (error) {
        console.error('Error fetching service history:', error)
        setServiceHistory([])
      }
    }

    if (activeTab === 'history') {
      fetchServiceHistory()
    }
  }, [activeTab])

  const handleRequestService = (mechanicId: number, mechanicName: string) => {
    setSelectedMechanic({ id: mechanicId, name: mechanicName })
    setShowRequestModal(true)
  }

  const handleRequestSuccess = async () => {
    setShowRequestModal(false)
    setSelectedMechanic(null)
    // Refresh active request
    try {
      const response = await axios.get('/api/requests/customer/active')
      if (response.data) {
        setActiveRequest(response.data)
      }
    } catch (error) {
      console.error('Error fetching active request:', error)
    }
  }

  const handleCancelRequest = async () => {
    if (activeRequest) {
      try {
        await axios.patch(`/api/requests/${activeRequest.id}/status`, { status: 'cancelled' })
        setActiveRequest(null)
      } catch (error) {
        console.error('Error cancelling request:', error)
        alert('Failed to cancel request')
      }
    }
  }

  const handleMechanicsCountChange = (count: number) => {
    setOnlineMechanicsCount(count)
  }

  const handleRequestMechanicClick = async () => {
    // Get user location - use Dallas default if not available
    let locationToUse = userLocation
    if (!locationToUse) {
      // Use Dallas, TX as default location
      locationToUse = { lat: 32.7767, lng: -96.7970 }
      setUserLocation(locationToUse)
    }

    // Try to fetch mechanics, but don't block the form from opening
    let mechanicsToUse = availableMechanics
    let selectedMechanic: any = null
    
    // Try to fetch mechanics if not already loaded
    if (mechanicsToUse.length === 0) {
      try {
        const response = await axios.get('/api/mechanics/online')
        if (response.data && response.data.length > 0) {
          mechanicsToUse = response.data
          setAvailableMechanics(response.data)
          selectedMechanic = response.data[0]
        }
      } catch (error) {
        console.error('Error fetching mechanics:', error)
        // Continue anyway - we'll use a default mechanic ID
      }
    } else {
      selectedMechanic = mechanicsToUse[0]
    }

    // If we have mechanics, find the nearest one
    if (selectedMechanic && locationToUse && mechanicsToUse.length > 1) {
      const mechanicsWithDistance = mechanicsToUse.map((m: any) => {
        const distance = Math.sqrt(
          Math.pow(m.latitude - locationToUse!.lat, 2) + 
          Math.pow(m.longitude - locationToUse!.lng, 2)
        ) * 111
        return { ...m, distance }
      })
      mechanicsWithDistance.sort((a: any, b: any) => a.distance - b.distance)
      selectedMechanic = mechanicsWithDistance[0]
    }

    // Open request modal - use default mechanic if none found
    if (selectedMechanic) {
      handleRequestService(selectedMechanic.user_id, selectedMechanic.name)
    } else {
      // Use a default mechanic ID (first mechanic from example data)
      // This ensures the form always opens
      handleRequestService(2, 'Available Mechanic')
    }
  }

  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setUserLocation(location)
  }

  return (
    <>
      {/* iPhone View Toggle Button */}
      <button
        onClick={() => setIphoneView(!iphoneView)}
        className={`fixed ${iphoneView ? 'top-6 right-6' : 'top-20 right-4'} z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-3 shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all active:scale-[0.95] transform touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center`}
        aria-label={iphoneView ? "Exit iPhone view" : "View iPhone preview"}
      >
        {iphoneView ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {iphoneView ? (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-40 overflow-hidden">
          {/* iPhone Frame */}
          <div 
            className="bg-black rounded-[3rem] p-2 shadow-2xl border-8 border-gray-800 relative"
            style={{
              width: '375px',
              height: '812px',
              transform: `scale(${iphoneScale})`,
              transformOrigin: 'center center'
            }}
          >
            {/* iPhone Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-3xl z-30"></div>

            {/* iPhone Screen Content */}
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-black via-purple-900/20 to-black relative">
              <div className="w-full h-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="min-h-screen flex flex-col safe-area-inset">
                  <nav className="bg-black/80 backdrop-blur-md border-b border-purple-500/30 shadow-lg z-20 safe-area-top flex-shrink-0">
                    <div className="px-3">
                      <div className="flex justify-between items-center h-14">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-glow whitespace-nowrap">
                            AID
                          </h1>
                          <span className="text-xs text-purple-300 bg-purple-900/50 border border-purple-500/30 px-2 py-1 rounded-full whitespace-nowrap">
                            {onlineMechanicsCount} available
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {user ? (
                            <ProfileDropdown compact={true} />
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setLoginRole('customer')
                                  setShowLoginModal(true)
                                }}
                                className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] active:from-purple-500 active:to-pink-500 transition-all font-semibold text-xs shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[36px] whitespace-nowrap"
                              >
                                Customer Sign In
                              </button>
                              <button
                                onClick={() => {
                                  setLoginRole('mechanic')
                                  setShowLoginModal(true)
                                }}
                                className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-[1.5rem] active:from-blue-500 active:to-cyan-500 transition-all font-semibold text-xs shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[36px] whitespace-nowrap"
                              >
                                Mechanic Sign In
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </nav>

                  <main className="flex-1 py-3 px-3 safe-area-inset-x overflow-y-auto">
                    <div className="w-full">
                      {/* Tabs */}
                      <div className="mb-3">
                        <div className="flex gap-1 border-b border-purple-500/20 overflow-x-auto scrollbar-hide">
                          <button
                            onClick={() => setActiveTab('map')}
                            className={`px-4 py-2.5 font-semibold text-sm transition-all relative whitespace-nowrap touch-manipulation min-h-[44px] flex items-center ${
                              activeTab === 'map'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                                : 'text-purple-400/60 active:text-purple-300'
                            }`}
                          >
                            Map
                            {activeTab === 'map' && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2.5 font-semibold text-sm transition-all relative whitespace-nowrap touch-manipulation min-h-[44px] flex items-center ${
                              activeTab === 'history'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                                : 'text-purple-400/60 active:text-purple-300'
                            }`}
                          >
                            Service History
                            {activeTab === 'history' && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('vehicles')}
                            className={`px-4 py-2.5 font-semibold text-sm transition-all relative whitespace-nowrap touch-manipulation min-h-[44px] flex items-center ${
                              activeTab === 'vehicles'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                                : 'text-purple-400/60 active:text-purple-300'
                            }`}
                          >
                            Your Vehicles
                            {activeTab === 'vehicles' && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Tab Content - Same as below but optimized for iPhone */}
                      {activeTab === 'map' && (
                        <>
                          <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden h-[300px]">
                            <ServiceMap 
                              onRequestService={handleRequestService}
                              onMechanicsCountChange={handleMechanicsCountChange}
                              onLocationUpdate={handleLocationUpdate}
                              onMechanicsUpdate={setAvailableMechanics}
                            />
                          </div>
                          <div className="mt-3 flex flex-col gap-3">
                            <button
                              onClick={handleRequestMechanicClick}
                              className="w-full px-6 py-3.5 rounded-[1.5rem] font-semibold text-base transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white active:from-purple-500 active:to-pink-500 active:scale-[0.95] transform shadow-lg touch-manipulation min-h-[50px]"
                            >
                              {onlineMechanicsCount > 0 
                                ? `Request Mechanic (${onlineMechanicsCount})`
                                : 'Request Mechanic'
                              }
                            </button>
                            <button
                              onClick={() => setShowTowModal(true)}
                              className="w-full px-6 py-3.5 rounded-[1.5rem] font-semibold text-base transition-all bg-gradient-to-r from-gray-700 to-gray-800 text-white active:from-gray-600 active:to-gray-700 active:scale-[0.95] transform shadow-lg touch-manipulation min-h-[50px] border border-gray-600/50"
                            >
                              Tow Your Vehicle
                            </button>
                            <button
                              onClick={() => setShowGasolineModal(true)}
                              className="w-full px-6 py-3.5 rounded-[1.5rem] font-semibold text-base transition-all bg-gradient-to-r from-red-600 to-red-700 text-white active:from-red-500 active:to-red-600 active:scale-[0.95] transform shadow-lg touch-manipulation min-h-[50px] border border-red-500/50"
                            >
                              Request Emergency Gasoline
                            </button>
                          </div>
                          <FeaturedMechanics compact={true} />
                          <ProductCards compact={true} />
                          {activeRequest && userLocation && (
                            <div className="mt-4">
                              <TrackingView
                                request={activeRequest}
                                userLocation={userLocation}
                                onCancel={handleCancelRequest}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === 'history' && (
                        <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                              Service History
                            </h2>
                            {serviceHistory.length > 0 && (
                              <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-3 py-1.5">
                                <p className="text-green-300 text-sm font-semibold">
                                  Total Spent: ${serviceHistory
                                    .filter((r: any) => r.status === 'completed' && r.rough_estimate)
                                    .reduce((sum: number, r: any) => {
                                      const cost = parseFloat(r.rough_estimate?.replace(/[^0-9.]/g, '') || '0')
                                      return sum + cost
                                    }, 0).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                          {serviceHistory.length === 0 ? (
                            <div className="text-center py-12">
                              <p className="text-purple-300 text-base mb-2">No service history yet</p>
                              <p className="text-purple-400/60 text-sm">Your completed service requests will appear here</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {serviceHistory.map((request: any) => (
                                <div
                                  key={request.id}
                                  className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h3 className="text-base font-bold text-purple-300 mb-1">
                                        {request.service_type || 'General Service'}
                                      </h3>
                                      <p className="text-xs text-purple-400">
                                        Mechanic: {request.mechanic_name || 'Unknown'}
                                      </p>
                                    </div>
                                    <div className="text-right ml-2">
                                      {request.rough_estimate && (
                                        <p className="text-green-400 font-bold text-base mb-1">
                                          {request.rough_estimate}
                                        </p>
                                      )}
                                      <span className={`px-2 py-1 rounded-xl text-xs font-semibold ${
                                        request.status === 'completed' ? 'bg-green-900/50 border border-green-500/50 text-green-300' :
                                        request.status === 'cancelled' ? 'bg-gray-800/50 border border-gray-700 text-gray-400' :
                                        'bg-yellow-900/50 border border-yellow-500/50 text-yellow-300'
                                      }`}>
                                        {request.status.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  {request.description && (
                                    <p className="text-purple-300 text-xs mb-2">{request.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-purple-400">
                                    <span>📅 {new Date(request.created_at).toLocaleDateString()}</span>
                                    {request.completed_at && (
                                      <span>✅ {new Date(request.completed_at).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'vehicles' && !selectedVehicle && (
                        <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl p-4">
                          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                            Your Vehicles
                          </h2>
                          <div className="grid grid-cols-1 gap-3">
                            {vehicles.map((vehicle) => (
                              <div
                                key={vehicle.id}
                                className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-[1.5rem] p-4"
                              >
                                <div className="mb-3">
                                  <h3 className="text-base font-bold text-purple-300 mb-1">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                  </h3>
                                  <p className="text-xs text-purple-400">{vehicle.color}</p>
                                  <p className="text-xs text-purple-500 mt-1">Plate: {vehicle.licensePlate}</p>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-xs text-purple-400 bg-purple-900/50 border border-purple-500/30 px-2 py-1 rounded-full">
                                    {vehicle.serviceHistory.length} service{vehicle.serviceHistory.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => setSelectedVehicle(vehicle)}
                                    className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded-[1rem] active:bg-purple-800/50 active:border-purple-400/50 transition-all text-sm font-semibold touch-manipulation min-h-[44px]"
                                  >
                                    View History
                                  </button>
                                  <button
                                    onClick={() => handleRequestMechanicClick()}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1rem] active:from-purple-500 active:to-pink-500 transition-all text-sm font-semibold shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[44px]"
                                  >
                                    Service This Car
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'vehicles' && selectedVehicle && (
                        <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl p-4">
                          <div className="flex flex-col items-start justify-between mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                              </h2>
                              <p className="text-purple-400 mt-1 text-sm">{selectedVehicle.color} • {selectedVehicle.licensePlate}</p>
                            </div>
                            <button
                              onClick={() => setSelectedVehicle(null)}
                              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-[1rem] active:bg-gray-700/50 transition-all text-sm font-semibold touch-manipulation min-h-[44px]"
                            >
                              ← Back
                            </button>
                          </div>
                          <div className="mb-4">
                            <h3 className="text-base font-semibold text-purple-300 mb-3">Service History</h3>
                            {selectedVehicle.serviceHistory.length === 0 ? (
                              <p className="text-purple-400/60 text-center py-8 text-sm">No service history for this vehicle</p>
                            ) : (
                              <div className="space-y-2">
                                {selectedVehicle.serviceHistory.map((service: any) => (
                                  <div
                                    key={service.id}
                                    className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-[1.5rem] p-3"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className="font-semibold text-purple-300 text-sm">{service.service}</h4>
                                        <p className="text-xs text-purple-400">Mechanic: {service.mechanic}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-base font-bold text-purple-200">{service.cost}</p>
                                        <p className="text-xs text-purple-400">{new Date(service.date).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <span className="inline-block px-2 py-1 bg-green-900/50 border border-green-500/30 text-green-300 text-xs rounded-full">
                                      {service.status.toUpperCase()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedVehicle(null)
                              handleRequestMechanicClick()
                            }}
                            className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] active:from-purple-500 active:to-pink-500 transition-all font-semibold shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[50px]"
                          >
                            Service This Car
                          </button>
                        </div>
                      )}
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex flex-col safe-area-inset">
            <nav className="bg-black/80 backdrop-blur-md border-b border-purple-500/30 shadow-lg z-20 safe-area-top">
            <div className={`${iphoneView ? 'px-3' : 'max-w-7xl mx-auto px-3 sm:px-4 lg:px-8'}`}>
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-glow whitespace-nowrap">
                    AID
                  </h1>
                  <span className="text-xs sm:text-sm text-purple-300 bg-purple-900/50 border border-purple-500/30 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                    {onlineMechanicsCount} available
                  </span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="text-xs sm:text-sm text-purple-300 hidden sm:inline">
                    Customer View
                  </span>
                  {user ? (
                    <ProfileDropdown />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setLoginRole('customer')
                          setShowLoginModal(true)
                        }}
                        className="px-3 sm:px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] hover:from-purple-500 hover:to-pink-500 transition-all font-semibold text-xs sm:text-sm shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[44px]"
                      >
                        Customer Sign In
                      </button>
                      <button
                        onClick={() => {
                          setLoginRole('mechanic')
                          setShowLoginModal(true)
                        }}
                        className="px-3 sm:px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-[1.5rem] hover:from-blue-500 hover:to-cyan-500 transition-all font-semibold text-xs sm:text-sm shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[44px]"
                      >
                        Mechanic Sign In
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <main className={`flex-1 py-3 sm:py-6 safe-area-inset-x ${iphoneView ? 'px-3 overflow-y-auto h-[calc(100%-4rem)]' : 'px-3 sm:px-4 lg:px-8'}`}>
            <div className={iphoneView ? 'w-full' : 'max-w-7xl mx-auto'}>
          {/* Tabs */}
          <div className="mb-3 sm:mb-4">
            <div className="flex gap-1 sm:gap-2 border-b border-purple-500/20 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base transition-all relative whitespace-nowrap touch-manipulation min-h-[44px] flex items-center ${
                  activeTab === 'map'
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                    : 'text-purple-400/60 active:text-purple-300'
                }`}
              >
                Map
                {activeTab === 'map' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base transition-all relative whitespace-nowrap touch-manipulation min-h-[44px] flex items-center ${
                  activeTab === 'history'
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                    : 'text-purple-400/60 active:text-purple-300'
                }`}
              >
                Service History
                {activeTab === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base transition-all relative whitespace-nowrap touch-manipulation min-h-[44px] flex items-center ${
                  activeTab === 'vehicles'
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
                    : 'text-purple-400/60 active:text-purple-300'
                }`}
              >
                Your Vehicles
                {activeTab === 'vehicles' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'map' && (
            <>
              {/* Map Container Box */}
              <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden h-[400px] sm:h-[600px]">
                <ServiceMap 
                  onRequestService={handleRequestService}
                  onMechanicsCountChange={handleMechanicsCountChange}
                  onLocationUpdate={handleLocationUpdate}
                  onMechanicsUpdate={setAvailableMechanics}
                />
              </div>

              {/* Request Mechanic, Tow, and Emergency Gasoline Buttons */}
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={handleRequestMechanicClick}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.5rem] font-semibold text-base sm:text-lg transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white active:from-purple-500 active:to-pink-500 active:scale-[0.95] transform shadow-lg touch-manipulation min-h-[50px]"
                >
                  {onlineMechanicsCount > 0 
                    ? `Request Mechanic (${onlineMechanicsCount})`
                    : 'Request Mechanic'
                  }
                </button>
                <button
                  onClick={() => setShowTowModal(true)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.5rem] font-semibold text-base sm:text-lg transition-all bg-gradient-to-r from-gray-700 to-gray-800 text-white active:from-gray-600 active:to-gray-700 active:scale-[0.95] transform shadow-lg touch-manipulation min-h-[50px] border border-gray-600/50"
                >
                  Tow Your Vehicle
                </button>
                <button
                  onClick={() => setShowGasolineModal(true)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.5rem] font-semibold text-base sm:text-lg transition-all bg-gradient-to-r from-red-600 to-red-700 text-white active:from-red-500 active:to-red-600 active:scale-[0.95] transform shadow-lg touch-manipulation min-h-[50px] border border-red-500/50"
                >
                  Request Emergency Gasoline
                </button>
              </div>

              {/* Featured Mechanics Section */}
              <FeaturedMechanics />

              {/* Product Cards Section */}
              <ProductCards />

              {/* Info panel for mobile */}
              {!activeRequest && (
                <div className="mt-4 sm:hidden">
                  <div className="bg-black/80 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-lg p-4">
                    <p className="text-sm text-purple-300">
                      Tap on a mechanic to see details and request service
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking View */}
              {activeRequest && userLocation && (
                <div className="mt-4">
                  <TrackingView
                    request={activeRequest}
                    userLocation={userLocation}
                    onCancel={handleCancelRequest}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Service History
                </h2>
                {serviceHistory.length > 0 && (
                  <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-2">
                    <p className="text-green-300 text-sm sm:text-base font-semibold">
                      Total Spent: ${serviceHistory
                        .filter((r: any) => r.status === 'completed' && r.rough_estimate)
                        .reduce((sum: number, r: any) => {
                          const cost = parseFloat(r.rough_estimate?.replace(/[^0-9.]/g, '') || '0')
                          return sum + cost
                        }, 0).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              {serviceHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-purple-300 text-lg mb-2">No service history yet</p>
                  <p className="text-purple-400/60 text-sm">Your completed service requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceHistory.map((request: any) => (
                    <div
                      key={request.id}
                      className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-5 hover:border-purple-400/40 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-purple-300 mb-1">
                            {request.service_type || 'General Service'}
                          </h3>
                          <p className="text-sm text-purple-400">
                            Mechanic: {request.mechanic_name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          {request.rough_estimate && (
                            <p className="text-green-400 font-bold text-lg mb-2">
                              {request.rough_estimate}
                            </p>
                          )}
                          <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                            request.status === 'completed' ? 'bg-green-900/50 border border-green-500/50 text-green-300' :
                            request.status === 'cancelled' ? 'bg-gray-800/50 border border-gray-700 text-gray-400' :
                            'bg-yellow-900/50 border border-yellow-500/50 text-yellow-300'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {request.description && (
                        <p className="text-purple-300 text-sm mb-2">{request.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-purple-400">
                        <span>📅 {new Date(request.created_at).toLocaleDateString()}</span>
                        {request.completed_at && (
                          <span>✅ Completed: {new Date(request.completed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vehicles' && !selectedVehicle && (
            <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 sm:mb-6">
                Your Vehicles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-[1.5rem] p-5 hover:border-purple-400/40 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-purple-300 mb-1">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-purple-400">{vehicle.color}</p>
                        <p className="text-xs text-purple-500 mt-1">Plate: {vehicle.licensePlate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-purple-400 bg-purple-900/50 border border-purple-500/30 px-2 py-1 rounded-full">
                        {vehicle.serviceHistory.length} service{vehicle.serviceHistory.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="flex-1 px-4 py-3 bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded-[1rem] active:bg-purple-800/50 active:border-purple-400/50 transition-all text-sm font-semibold touch-manipulation min-h-[44px]"
                      >
                        View History
                      </button>
                      <button
                        onClick={() => {
                          // Open request modal for this vehicle
                          handleRequestMechanicClick()
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1rem] active:from-purple-500 active:to-pink-500 transition-all text-sm font-semibold shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[44px]"
                      >
                        Service This Car
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && selectedVehicle && (
            <div className="bg-gradient-to-br from-black/90 to-purple-900/30 rounded-2xl border border-purple-500/20 shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <p className="text-purple-400 mt-1 text-sm sm:text-base">{selectedVehicle.color} • {selectedVehicle.licensePlate}</p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-[1rem] active:bg-gray-700/50 transition-all text-sm font-semibold touch-manipulation min-h-[44px] w-full sm:w-auto"
                >
                  ← Back
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Service History</h3>
                {selectedVehicle.serviceHistory.length === 0 ? (
                  <p className="text-purple-400/60 text-center py-8">No service history for this vehicle</p>
                ) : (
                  <div className="space-y-3">
                    {selectedVehicle.serviceHistory.map((service: any) => (
                      <div
                        key={service.id}
                        className="bg-black/60 backdrop-blur-sm border border-purple-500/20 rounded-[1.5rem] p-4 hover:border-purple-400/40 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-purple-300">{service.service}</h4>
                            <p className="text-sm text-purple-400">Mechanic: {service.mechanic}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-200">{service.cost}</p>
                            <p className="text-xs text-purple-400">{new Date(service.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="inline-block px-2 py-1 bg-green-900/50 border border-green-500/30 text-green-300 text-xs rounded-full">
                          {service.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedVehicle(null)
                  handleRequestMechanicClick()
                }}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] active:from-purple-500 active:to-pink-500 transition-all font-semibold shadow-lg active:scale-[0.95] transform touch-manipulation min-h-[50px]"
              >
                Service This Car
              </button>
            </div>
          )}

            </div>
          </main>
        </div>
        )}

      {/* Request Modal */}
      {showRequestModal && selectedMechanic && userLocation && (
        <RequestServiceModal
          mechanicId={selectedMechanic.id}
          mechanicName={selectedMechanic.name}
          userLocation={userLocation}
          onClose={() => {
            setShowRequestModal(false)
            setSelectedMechanic(null)
          }}
          onSuccess={handleRequestSuccess}
        />
      )}

      {/* Tow Request Modal */}
      {showTowModal && userLocation && (
        <TowRequestModal
          userLocation={userLocation}
          onClose={() => setShowTowModal(false)}
          onSuccess={() => {
            setShowTowModal(false)
            // Optionally show success message
          }}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          role={loginRole}
          onClose={() => {
            setShowLoginModal(false)
            setLoginRole(undefined)
          }}
          onSuccess={() => {
            setShowLoginModal(false)
            const currentRole = loginRole
            setLoginRole(undefined)
            // Redirect mechanics to dashboard
            if (currentRole === 'mechanic') {
              setTimeout(() => {
                navigate('/dashboard')
              }, 200)
            }
          }}
        />
      )}
    </>
  )
}

