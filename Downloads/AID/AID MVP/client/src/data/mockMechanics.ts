export interface Mechanic {
  id: number
  name: string
  location: {
    lat: number
    lng: number
  }
  rating: number
  status: 'online' | 'offline'
  specialties?: string[]
  hourlyRate?: number
}

// Mock mechanics data - centered around NYC area
export const mockMechanics: Mechanic[] = [
  {
    id: 1,
    name: 'John\'s Auto Repair',
    location: { lat: 40.7589, lng: -73.9851 }, // Times Square area
    rating: 4.8,
    status: 'online',
    specialties: ['Engine Repair', 'Brakes'],
    hourlyRate: 75
  },
  {
    id: 2,
    name: 'Mike\'s Mobile Mechanics',
    location: { lat: 40.7505, lng: -73.9934 }, // Midtown
    rating: 4.6,
    status: 'online',
    specialties: ['Tire Service', 'Oil Change'],
    hourlyRate: 65
  },
  {
    id: 3,
    name: 'Quick Fix Auto',
    location: { lat: 40.7282, lng: -73.9942 }, // Greenwich Village
    rating: 4.9,
    status: 'online',
    specialties: ['AC Repair', 'Electrical'],
    hourlyRate: 80
  },
  {
    id: 4,
    name: 'City Auto Service',
    location: { lat: 40.7614, lng: -73.9776 }, // Central Park area
    rating: 4.5,
    status: 'offline',
    specialties: ['Transmission', 'Diagnostics'],
    hourlyRate: 90
  },
  {
    id: 5,
    name: 'Express Mobile Repair',
    location: { lat: 40.7128, lng: -74.0060 }, // Lower Manhattan
    rating: 4.7,
    status: 'online',
    specialties: ['Battery', 'Starter'],
    hourlyRate: 70
  },
  {
    id: 6,
    name: 'Pro Auto Solutions',
    location: { lat: 40.7489, lng: -73.9680 }, // Upper East Side
    rating: 4.4,
    status: 'online',
    specialties: ['Suspension', 'Alignment'],
    hourlyRate: 85
  }
]







