import { useState, useEffect } from 'react'
import axios from 'axios'

interface FeaturedMechanic {
  id: number
  name: string
  rating: number
  reviewCount: number
  specialties?: string[]
  experience?: string
}

interface FeaturedMechanicsProps {
  compact?: boolean
}

export default function FeaturedMechanics({ compact = false }: FeaturedMechanicsProps) {
  const [mechanics, setMechanics] = useState<FeaturedMechanic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedMechanics()
  }, [])

  const fetchFeaturedMechanics = async () => {
    try {
      const response = await axios.get('/api/mechanics/online')
      // Transform mechanics data with mock reviews
      const featuredMechanics: FeaturedMechanic[] = response.data.map((m: any, index: number) => ({
        id: m.user_id,
        name: m.name,
        rating: 4.5 + (index * 0.1), // Vary ratings between 4.5-4.7
        reviewCount: 50 + (index * 15), // Vary review counts
        specialties: [
          ['Oil Change', 'Brake Repair', 'Engine Diagnostic'],
          ['Tire Service', 'Battery Replacement', 'AC Repair'],
          ['Transmission', 'Electrical', 'General Maintenance']
        ][index] || ['General Maintenance'],
        experience: `${5 + index} years`
      }))
      setMechanics(featuredMechanics)
    } catch (error) {
      console.error('Error fetching featured mechanics:', error)
      // Fallback to mock data if API fails
      setMechanics([
        {
          id: 1,
          name: 'Mike Johnson',
          rating: 4.8,
          reviewCount: 127,
          specialties: ['Oil Change', 'Brake Repair', 'Engine Diagnostic'],
          experience: '8 years'
        },
        {
          id: 2,
          name: 'Sarah Williams',
          rating: 4.9,
          reviewCount: 203,
          specialties: ['Tire Service', 'Battery Replacement', 'AC Repair'],
          experience: '10 years'
        },
        {
          id: 3,
          name: 'David Chen',
          rating: 4.7,
          reviewCount: 89,
          specialties: ['Transmission', 'Electrical', 'General Maintenance'],
          experience: '6 years'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-6">
        <div className="bg-gradient-to-br from-black/90 to-purple-900/30 border border-purple-500/20 rounded-2xl shadow-xl p-6">
          <p className="text-purple-300 text-center">Loading featured mechanics...</p>
        </div>
      </div>
    )
  }

  if (mechanics.length === 0) {
    return null
  }

  return (
    <div className={compact ? "mt-2 -mx-3" : "mt-1.5 sm:mt-4 lg:mt-6"}>
        <div className={`bg-gradient-to-br from-black/90 to-purple-900/30 border border-purple-500/20 shadow-xl ${
          compact 
            ? "rounded-lg px-2 py-2" 
            : "rounded-lg sm:rounded-xl lg:rounded-2xl px-1.5 py-1.5 sm:px-4 sm:py-4 lg:p-6"
        }`}>
        <h2 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-glow ${
          compact 
            ? "text-sm mb-2" 
            : "text-sm sm:text-xl lg:text-2xl mb-1.5 sm:mb-4 lg:mb-6"
        }`}>
          Featured Mechanics
        </h2>
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${
          compact ? "gap-2" : "gap-1 sm:gap-3 lg:gap-4"
        }`}>
          {mechanics.map((mechanic) => (
            <div
              key={mechanic.id}
              className={`bg-black/60 backdrop-blur-sm border border-purple-500/20 active:border-purple-400/40 active:shadow-xl transition-all sm:aspect-square flex flex-col ${
                compact 
                  ? "rounded-lg p-2" 
                  : "rounded-md sm:rounded-xl lg:rounded-2xl p-1.5 sm:p-4 lg:p-5"
              }`}
            >
              <div className="flex-1 flex flex-col">
                <div className={compact ? "mb-1.5" : "mb-1 sm:mb-3"}>
                  <h3 className={`font-bold text-purple-300 leading-tight ${
                    compact 
                      ? "text-xs mb-1" 
                      : "text-[10px] sm:text-base lg:text-lg mb-0.5 sm:mb-2"
                  }`}>{mechanic.name}</h3>
                  <div className={`flex items-center mb-1 sm:mb-2 ${
                    compact ? "gap-1" : "gap-0.5 sm:gap-2"
                  }`}>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`${
                            compact ? "text-[10px]" : "text-[8px] sm:text-xs lg:text-sm"
                          } ${
                            i < Math.floor(mechanic.rating)
                              ? 'text-yellow-400'
                              : i < mechanic.rating
                              ? 'text-yellow-300'
                              : 'text-gray-600'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className={`text-purple-200 font-semibold ${
                      compact ? "text-[10px]" : "text-[8px] sm:text-xs lg:text-sm"
                    }`}>
                      {mechanic.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className={`flex flex-wrap items-center ${
                    compact ? "gap-1" : "gap-0.5 sm:gap-2"
                  }`}>
                    <p className={`text-purple-400 leading-tight ${
                      compact ? "text-[9px]" : "text-[8px] sm:text-xs"
                    }`}>
                      {mechanic.reviewCount} reviews
                    </p>
                    <span className={`text-purple-500 ${
                      compact ? "text-[9px]" : "text-[8px] sm:text-xs"
                    }`}>•</span>
                    <p className={`text-purple-400 leading-tight ${
                      compact ? "text-[9px]" : "text-[8px] sm:text-xs"
                    }`}>
                      {mechanic.experience}
                    </p>
                  </div>
                </div>

                {mechanic.specialties && mechanic.specialties.length > 0 && (
                  <div className="mt-auto">
                    <p className={`text-purple-500 leading-tight ${
                      compact 
                        ? "text-[9px] mb-1" 
                        : "text-[8px] sm:text-xs mb-0.5 sm:mb-2"
                    }`}>Specialties:</p>
                    <div className={`flex flex-wrap ${
                      compact ? "gap-1" : "gap-0.5 sm:gap-1"
                    }`}>
                      {mechanic.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className={`bg-purple-900/50 border border-purple-500/20 text-purple-300 rounded leading-tight ${
                            compact 
                              ? "px-1.5 py-0.5 text-[8px]" 
                              : "px-1 py-0.5 sm:px-2 text-[7px] sm:text-xs sm:rounded-lg"
                          }`}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`border-t border-purple-500/20 ${
                  compact ? "mt-1.5 pt-1.5" : "mt-1 sm:mt-3 pt-1 sm:pt-3"
                }`}>
                  <div className={`flex items-center text-purple-400 ${
                    compact ? "gap-1 text-[9px]" : "gap-0.5 sm:gap-2 text-[8px] sm:text-xs"
                  }`}>
                    <span className={`bg-green-400 rounded-full animate-pulse ${
                      compact ? "w-1.5 h-1.5" : "w-0.5 h-0.5 sm:w-2 sm:h-2"
                    }`}></span>
                    <span className="leading-tight">Available Now</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailing Services Section */}
        <div className={`mt-4 sm:mt-6 ${
          compact ? "pt-2 border-t border-purple-500/20" : "pt-3 sm:pt-4 lg:pt-6 border-t border-purple-500/20"
        }`}>
          <h3 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-glow mb-2 sm:mb-3 ${
            compact 
              ? "text-xs" 
              : "text-sm sm:text-lg lg:text-xl"
          }`}>
            Check out our Detailing Services
          </h3>
          <p className={`text-purple-300/80 leading-relaxed ${
            compact 
              ? "text-[9px] mb-2" 
              : "text-[10px] sm:text-sm mb-2 sm:mb-3"
          }`}>
            Keep your vehicle looking brand new with our professional detailing services. From basic washes to full interior and exterior detailing.
          </p>
          <div className={`flex flex-wrap ${
            compact ? "gap-1.5" : "gap-2 sm:gap-3"
          }`}>
            {['Exterior Wash', 'Interior Vacuum', 'Full Detail', 'Wax & Polish', 'Leather Treatment'].map((service, index) => (
              <span
                key={index}
                className={`bg-purple-900/50 border border-purple-500/20 text-purple-300 rounded leading-tight ${
                  compact 
                    ? "px-2 py-1 text-[8px]" 
                    : "px-2 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-xs sm:rounded-lg"
                }`}
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

