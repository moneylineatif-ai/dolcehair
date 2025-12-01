// In-memory database storage (replaces PostgreSQL)

interface User {
  id: number
  email: string
  password_hash: string
  name: string
  role: 'customer' | 'mechanic'
  created_at: Date
}

interface MechanicLocation {
  id: number
  user_id: number
  latitude: number | null
  longitude: number | null
  is_online: boolean
  last_updated: Date
}

interface ServiceRequest {
  id: number
  customer_id: number
  mechanic_id: number
  customer_latitude: number
  customer_longitude: number
  address?: string
  service_type?: string
  description?: string
  rough_estimate?: string
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled'
  created_at: Date
  accepted_at?: Date
  completed_at?: Date
  cancelled_at?: Date
}

interface TowRequest {
  id: number
  customer_id: number
  pickup_address: string
  dropoff_address: string
  vehicle_info?: string
  latitude: number
  longitude: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  accepted_by?: number
  bid_amount?: number
  created_at: Date
  accepted_at?: Date
  completed_at?: Date
}

// In-memory storage
let users: User[] = []
let mechanicLocations: MechanicLocation[] = []
let serviceRequests: ServiceRequest[] = []
let towRequests: TowRequest[] = []
let nextUserId = 1
let nextLocationId = 1
let nextRequestId = 1
let nextTowRequestId = 1

// Create example user: Aid@gmail.com / 123
import bcrypt from 'bcryptjs'

async function initializeExampleUser() {
  const email = 'aid@gmail.com'
  const password = '123'
  
  // Check if user already exists (case-insensitive)
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    // If user exists but is not a customer, don't overwrite
    if (existing.role === 'customer') {
      // Update password if needed
      const passwordHash = await bcrypt.hash(password, 10)
      existing.password_hash = passwordHash
      console.log('✅ Customer user already exists, password updated:', email, '/', password)
      return
    } else {
      // User exists but is a mechanic, create customer with different approach
      console.log('⚠️ Email already used for mechanic, customer account will use same email')
      // Still update to ensure customer role and password
      existing.role = 'customer'
      existing.name = 'AID Customer'
      const passwordHash = await bcrypt.hash(password, 10)
      existing.password_hash = passwordHash
      console.log('✅ Updated existing user to customer:', email, '/', password)
      return
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Create example user
  const exampleUser: User = {
    id: nextUserId++,
    email,
    password_hash: passwordHash,
    name: 'AID Customer',
    role: 'customer',
    created_at: new Date()
  }

  users.push(exampleUser)
  console.log('✅ Example customer user created:', email, '/', password)
}

async function initializeExampleMechanic() {
  const email = 'aid@gmail.com'
  const password = '123'
  
  // Check if mechanic user already exists (case-insensitive)
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    // Always ensure mechanic account exists with correct password
    // This runs first, so mechanic account will be created, then customer will override it
    // But we'll handle this by making mechanic initialization set the role correctly
    existing.role = 'mechanic'
    existing.name = 'AID Mechanic'
    const passwordHash = await bcrypt.hash(password, 10)
    existing.password_hash = passwordHash
    console.log('✅ Mechanic account ensured:', email, '/', password)
    return
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Create example mechanic user
  const mechanicUser: User = {
    id: nextUserId++,
    email,
    password_hash: passwordHash,
    name: 'AID Mechanic',
    role: 'mechanic',
    created_at: new Date()
  }

  users.push(mechanicUser)
  console.log('✅ Example mechanic user created:', email, '/', password)
}

async function initializeExampleMechanics() {
  const exampleMechanics = [
    { name: 'Mike Johnson', email: 'mike@mechanic.com', lat: 32.7767, lng: -96.7970 }, // Downtown Dallas
    { name: 'Sarah Williams', email: 'sarah@mechanic.com', lat: 32.7831, lng: -96.8067 }, // Uptown Dallas
    { name: 'David Chen', email: 'david@mechanic.com', lat: 32.8209, lng: -96.8717 }, // North Dallas
  ]

  for (const mechanic of exampleMechanics) {
    // Check if mechanic already exists
    const existing = users.find(u => u.email.toLowerCase() === mechanic.email.toLowerCase())
    
    if (!existing) {
      // Create mechanic user
      const passwordHash = await bcrypt.hash('123456', 10) // Default password
      const mechanicUser: User = {
        id: nextUserId++,
        email: mechanic.email,
        password_hash: passwordHash,
        name: mechanic.name,
        role: 'mechanic',
        created_at: new Date()
      }
      users.push(mechanicUser)

      // Create mechanic location and set as online
      const mechanicLocation: MechanicLocation = {
        id: nextLocationId++,
        user_id: mechanicUser.id,
        latitude: mechanic.lat,
        longitude: mechanic.lng,
        is_online: true,
        last_updated: new Date()
      }
      mechanicLocations.push(mechanicLocation)
      console.log(`✅ Example mechanic created: ${mechanic.name} (${mechanic.email}) - Online`)
    } else {
      // Update existing mechanic to be online if not already
      const location = mechanicLocations.find(ml => ml.user_id === existing.id)
      if (location) {
        location.is_online = true
        location.latitude = mechanic.lat
        location.longitude = mechanic.lng
        location.last_updated = new Date()
        console.log(`✅ Example mechanic updated: ${mechanic.name} - Set online`)
      } else {
        // Create location for existing mechanic
        const mechanicLocation: MechanicLocation = {
          id: nextLocationId++,
          user_id: existing.id,
          latitude: mechanic.lat,
          longitude: mechanic.lng,
          is_online: true,
          last_updated: new Date()
        }
        mechanicLocations.push(mechanicLocation)
        console.log(`✅ Example mechanic location created: ${mechanic.name} - Set online`)
      }
    }
  }
  
  console.log(`✅ Total example mechanics: ${exampleMechanics.length}`)
  console.log(`   Total users in database: ${users.length}`)
  console.log(`   Total mechanic locations: ${mechanicLocations.length}`)
}

// Initialize example user on startup (removed - now called in initDatabase)

// Database query interface (mimics PostgreSQL query structure)
export const query = async (text: string, params?: any[]) => {
  // Parse SQL-like queries and execute against in-memory storage
  const start = Date.now()
  
  try {
    let result: any = { rows: [], rowCount: 0 }

    // SELECT queries
    if (text.includes('SELECT')) {
      // SELECT * FROM users WHERE email = $1
      if (text.includes('FROM users') && text.includes('WHERE email')) {
        const email = params?.[0]
        // Case-insensitive email matching
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        result.rows = user ? [user] : []
        result.rowCount = result.rows.length
        if (!user) {
          console.log('User lookup failed for email:', email, 'Available users:', users.map(u => u.email))
        }
      }
      // SELECT * FROM users WHERE id = $1
      else if (text.includes('FROM users') && text.includes('WHERE id')) {
        const id = params?.[0]
        const user = users.find(u => u.id === id)
        result.rows = user ? [user] : []
        result.rowCount = result.rows.length
      }
      // SELECT id FROM users WHERE email = $1
      else if (text.includes('SELECT id FROM users')) {
        const email = params?.[0]
        const user = users.find(u => u.email === email)
        result.rows = user ? [{ id: user.id }] : []
        result.rowCount = result.rows.length
      }
      // SELECT id, email, name, role FROM users WHERE id = $1
      else if (text.includes('SELECT id, email, name, role FROM users')) {
        const id = params?.[0]
        const user = users.find(u => u.id === id)
        if (user) {
          result.rows = [{
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }]
        }
        result.rowCount = result.rows.length
      }
      // SELECT role FROM users WHERE id = $1
      else if (text.includes('SELECT role FROM users')) {
        const id = params?.[0]
        const user = users.find(u => u.id === id)
        result.rows = user ? [{ role: user.role }] : []
        result.rowCount = result.rows.length
      }
      // SELECT * FROM mechanic_locations WHERE user_id = $1
      else if (text.includes('FROM mechanic_locations') && text.includes('WHERE user_id')) {
        const userId = params?.[0]
        const location = mechanicLocations.find(ml => ml.user_id === userId)
        result.rows = location ? [location] : []
        result.rowCount = result.rows.length
      }
      // SELECT online mechanics with JOIN
      else if (text.includes('FROM mechanic_locations ml') && text.includes('JOIN users u')) {
        const onlineLocations = mechanicLocations.filter(ml => 
          ml.is_online && ml.latitude !== null && ml.longitude !== null
        )
        result.rows = onlineLocations.map(ml => {
          const user = users.find(u => u.id === ml.user_id)
          return {
            user_id: ml.user_id,
            latitude: ml.latitude,
            longitude: ml.longitude,
            last_updated: ml.last_updated,
            name: user?.name || '',
            email: user?.email || ''
          }
        })
        result.rowCount = result.rows.length
      }
      // SELECT service requests
      else if (text.includes('FROM service_requests')) {
        // SELECT id FROM service_requests WHERE customer_id = $1 AND status IN ($2, $3)
        if (text.includes('SELECT id FROM service_requests') && text.includes('status IN')) {
          const customerId = params?.[0]
          const status1 = params?.[1]
          const status2 = params?.[2]
          const requests = serviceRequests.filter(sr => 
            sr.customer_id === customerId && (sr.status === status1 || sr.status === status2)
          )
          result.rows = requests.map(sr => ({ id: sr.id }))
          result.rowCount = result.rows.length
        }
        // SELECT with JOIN for customer requests
        else if (text.includes('LEFT JOIN users u ON sr.mechanic_id') && text.includes('WHERE sr.customer_id')) {
          const customerId = params?.[0]
          let requests = serviceRequests.filter(sr => sr.customer_id === customerId)
          
          if (text.includes('status IN')) {
            const status1 = params?.[1]
            const status2 = params?.[2]
            requests = requests.filter(sr => sr.status === status1 || sr.status === status2)
          }
          
          if (text.includes('LIMIT 1')) {
            requests = requests.slice(0, 1)
          }
          
          result.rows = requests.map(sr => {
            const mechanic = users.find(u => u.id === sr.mechanic_id)
            return {
              ...sr,
              mechanic_name: mechanic?.name || null,
              mechanic_email: mechanic?.email || null
            }
          })
          result.rowCount = result.rows.length
        }
        // SELECT with JOIN for mechanic requests
        else if (text.includes('JOIN users u ON sr.customer_id') && text.includes('WHERE sr.mechanic_id')) {
          const mechanicId = params?.[0]
          let requests = serviceRequests.filter(sr => sr.mechanic_id === mechanicId)
          
          if (text.includes('status =')) {
            const status = params?.[1]
            requests = requests.filter(sr => sr.status === status)
          }
          
          result.rows = requests.map(sr => {
            const customer = users.find(u => u.id === sr.customer_id)
            return {
              ...sr,
              customer_name: customer?.name || null,
              customer_email: customer?.email || null
            }
          })
          result.rowCount = result.rows.length
        }
        // SELECT * FROM service_requests WHERE id = $1
        else if (text.includes('SELECT * FROM service_requests') && text.includes('WHERE id')) {
          const id = params?.[0]
          const request = serviceRequests.find(sr => sr.id === id)
          result.rows = request ? [request] : []
          result.rowCount = result.rows.length
        }
      }
    }
    // INSERT queries
    else if (text.includes('INSERT INTO users')) {
      const email = params?.[0]
      const password_hash = params?.[1]
      const name = params?.[2]
      const role = params?.[3]

      const newUser: User = {
        id: nextUserId++,
        email,
        password_hash,
        name,
        role,
        created_at: new Date()
      }

      users.push(newUser)
      result.rows = [newUser]
      result.rowCount = 1
    }
    // INSERT INTO mechanic_locations
    else if (text.includes('INSERT INTO mechanic_locations')) {
      const userId = params?.[0]
      const latitude = params?.[1]
      const longitude = params?.[2]
      const isOnline = params?.[3] ?? true

      // Check if location exists (for upsert)
      const existing = mechanicLocations.find(ml => ml.user_id === userId)
      
      if (existing) {
        // Update existing (ON CONFLICT DO UPDATE)
        if (latitude !== undefined && latitude !== null) existing.latitude = latitude
        if (longitude !== undefined && longitude !== null) existing.longitude = longitude
        if (isOnline !== undefined) existing.is_online = isOnline
        existing.last_updated = new Date()
        result.rows = [existing]
      } else {
        // Create new
        const newLocation: MechanicLocation = {
          id: nextLocationId++,
          user_id: userId,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          is_online: isOnline,
          last_updated: new Date()
        }
        mechanicLocations.push(newLocation)
        result.rows = [newLocation]
      }
      result.rowCount = 1
    }
    // INSERT INTO service_requests
    else if (text.includes('INSERT INTO service_requests')) {
      const customerId = params?.[0]
      const mechanicId = params?.[1]
      const customerLat = params?.[2]
      const customerLng = params?.[3]
      // Check if new format with address and rough_estimate
      if (text.includes('address') && text.includes('rough_estimate')) {
        const address = params?.[4]
        const description = params?.[5]
        const roughEstimate = params?.[6]
        const status = params?.[7] || 'pending'

        const newRequest: ServiceRequest = {
          id: nextRequestId++,
          customer_id: customerId,
          mechanic_id: mechanicId,
          customer_latitude: customerLat,
          customer_longitude: customerLng,
          address: address || undefined,
          description: description || undefined,
          rough_estimate: roughEstimate || undefined,
          status: status as any,
          created_at: new Date()
        }

        serviceRequests.push(newRequest)
        result.rows = [newRequest]
        result.rowCount = 1
      } else {
        // Old format for backward compatibility
        const serviceType = params?.[4]
        const description = params?.[5]
        const status = params?.[6] || 'pending'

        const newRequest: ServiceRequest = {
          id: nextRequestId++,
          customer_id: customerId,
          mechanic_id: mechanicId,
          customer_latitude: customerLat,
          customer_longitude: customerLng,
          service_type: serviceType || undefined,
          description: description || undefined,
          status: status as any,
          created_at: new Date()
        }

        serviceRequests.push(newRequest)
        result.rows = [newRequest]
        result.rowCount = 1
      }
    }
    // INSERT INTO tow_requests
    else if (text.includes('INSERT INTO tow_requests')) {
      const customerId = params?.[0]
      const pickupAddress = params?.[1]
      const dropoffAddress = params?.[2]
      const vehicleInfo = params?.[3]
      const latitude = params?.[4]
      const longitude = params?.[5]
      const status = params?.[6] || 'pending'

      const newRequest: TowRequest = {
        id: nextTowRequestId++,
        customer_id: customerId,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        vehicle_info: vehicleInfo || undefined,
        latitude: latitude,
        longitude: longitude,
        status: status as any,
        created_at: new Date()
      }

      towRequests.push(newRequest)
      result.rows = [newRequest]
      result.rowCount = 1
    }
    // SELECT FROM tow_requests
    else if (text.includes('FROM tow_requests')) {
      if (text.includes('WHERE status =')) {
        const status = params?.[0]
        const requests = towRequests.filter(tr => tr.status === status)
        result.rows = requests
        result.rowCount = requests.length
      }
      else if (text.includes('WHERE customer_id')) {
        const customerId = params?.[0]
        const requests = towRequests.filter(tr => tr.customer_id === customerId)
        result.rows = requests
        result.rowCount = requests.length
      }
      else if (text.includes('WHERE id')) {
        const id = params?.[0]
        const request = towRequests.find(tr => tr.id === id)
        result.rows = request ? [request] : []
        result.rowCount = request ? 1 : 0
      }
    }
    // UPDATE tow_requests
    else if (text.includes('UPDATE tow_requests')) {
      const requestId = params?.[params.length - 1]
      const request = towRequests.find(tr => tr.id === requestId)
      
      if (request) {
        const statusParam = params?.[0]
        const acceptedBy = params?.[1]
        const bidAmount = params?.[2]
        
        if (statusParam && ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(statusParam)) {
          request.status = statusParam as any
        }
        if (acceptedBy) {
          request.accepted_by = acceptedBy
          request.accepted_at = new Date()
        }
        if (bidAmount) {
          request.bid_amount = bidAmount
        }
        
        result.rows = [request]
        result.rowCount = 1
      }
    }
    // UPDATE service_requests
    else if (text.includes('UPDATE service_requests')) {
      // Parse UPDATE query: UPDATE service_requests SET status = $1, accepted_at = CURRENT_TIMESTAMP WHERE id = $2
      const requestId = params?.[params.length - 1] // Last param is usually the ID
      const request = serviceRequests.find(sr => sr.id === requestId)
      
      if (request) {
        // Find status parameter (usually first param before ID)
        const statusParam = params?.[0]
        if (statusParam && ['pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled'].includes(statusParam)) {
          request.status = statusParam as any
        }
        
        if (text.includes('accepted_at')) {
          request.accepted_at = new Date()
        }
        if (text.includes('completed_at')) {
          request.completed_at = new Date()
        }
        if (text.includes('cancelled_at')) {
          request.cancelled_at = new Date()
        }
        
        result.rows = [request]
        result.rowCount = 1
      } else {
        result.rows = []
        result.rowCount = 0
      }
    }

    const duration = Date.now() - start
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount })
    
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

async function initializeExampleServiceHistory() {
  // Get customer user
  const customer = users.find(u => u.role === 'customer' && u.email.toLowerCase() === 'aid@gmail.com')
  if (!customer) {
    console.log('⚠️ Customer not found, skipping example service history')
    return
  }

  // Get mechanics
  const mechanics = users.filter(u => u.role === 'mechanic')
  if (mechanics.length === 0) {
    console.log('⚠️ No mechanics found, skipping example service history')
    return
  }

  // Check if example service history already exists
  const existingHistory = serviceRequests.filter(sr => 
    sr.customer_id === customer.id && sr.status === 'completed'
  )
  if (existingHistory.length > 0) {
    console.log('✅ Example service history already exists')
    return
  }

  // Create example completed service requests
  const exampleServices = [
    {
      mechanic: mechanics[0] || mechanics[Math.floor(Math.random() * mechanics.length)],
      service_type: 'Oil Change',
      description: 'Full synthetic oil change and filter replacement',
      rough_estimate: '$45',
      address: '123 Main St, Dallas, TX',
      lat: 32.7767,
      lng: -96.7970,
      daysAgo: 5
    },
    {
      mechanic: mechanics[1] || mechanics[Math.floor(Math.random() * mechanics.length)],
      service_type: 'Brake Repair',
      description: 'Front brake pad replacement',
      rough_estimate: '$180',
      address: '456 Oak Ave, Dallas, TX',
      lat: 32.7831,
      lng: -96.8067,
      daysAgo: 12
    },
    {
      mechanic: mechanics[0] || mechanics[Math.floor(Math.random() * mechanics.length)],
      service_type: 'Tire Service',
      description: 'Tire rotation and balance',
      rough_estimate: '$75',
      address: '789 Elm St, Dallas, TX',
      lat: 32.8209,
      lng: -96.8717,
      daysAgo: 20
    },
    {
      mechanic: mechanics[2] || mechanics[Math.floor(Math.random() * mechanics.length)],
      service_type: 'Battery Replacement',
      description: 'Car battery replacement',
      rough_estimate: '$150',
      address: '321 Pine Rd, Dallas, TX',
      lat: 32.7767,
      lng: -96.7970,
      daysAgo: 35
    },
    {
      mechanic: mechanics[1] || mechanics[Math.floor(Math.random() * mechanics.length)],
      service_type: 'Engine Diagnostic',
      description: 'Engine check and diagnostic',
      rough_estimate: '$120',
      address: '654 Maple Dr, Dallas, TX',
      lat: 32.7831,
      lng: -96.8067,
      daysAgo: 45
    }
  ]

  for (const service of exampleServices) {
    const completedDate = new Date()
    completedDate.setDate(completedDate.getDate() - service.daysAgo)
    
    const newRequest: ServiceRequest = {
      id: nextRequestId++,
      customer_id: customer.id,
      mechanic_id: service.mechanic.id,
      customer_latitude: service.lat,
      customer_longitude: service.lng,
      address: service.address,
      service_type: service.service_type,
      description: service.description,
      rough_estimate: service.rough_estimate,
      status: 'completed',
      created_at: new Date(completedDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before completion
      accepted_at: new Date(completedDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day before completion
      completed_at: completedDate
    }

    serviceRequests.push(newRequest)
  }

  console.log(`✅ Created ${exampleServices.length} example service history records`)
}

export const initDatabase = async () => {
  console.log('✅ In-memory database initialized')
  // Initialize customer first, then mechanic (mechanic will override since same email)
  await initializeExampleUser() // Customer initialized first
  await initializeExampleMechanics() // Other mechanics
  await initializeExampleMechanic() // Mechanic initialized last, will override customer account
  await initializeExampleServiceHistory() // Add example service history
}

export default { query, initDatabase }
