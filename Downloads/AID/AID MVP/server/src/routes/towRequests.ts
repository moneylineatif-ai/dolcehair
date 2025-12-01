import express from 'express'
import { query } from '../db/index.js'

const router = express.Router()

// Create tow request (public for demo)
router.post('/', async (req, res) => {
  try {
    const { pickupAddress, dropoffAddress, vehicleInfo, latitude, longitude } = req.body
    
    // For demo: use first customer user if no auth
    let customerId
    const customerCheck = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['customer'])
    if (customerCheck.rows.length === 0) {
      return res.status(400).json({ error: 'No customer users found' })
    }
    customerId = customerCheck.rows[0].id

    // Validation
    if (!pickupAddress || !dropoffAddress || !latitude || !longitude) {
      return res.status(400).json({ error: 'Pickup address, dropoff address, and location are required' })
    }

    // Check if customer has pending tow request
    const existingRequest = await query(
      'SELECT id FROM tow_requests WHERE customer_id = $1 AND status IN ($2, $3)',
      [customerId, 'pending', 'accepted']
    )
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'You already have an active tow request' })
    }

    // Create tow request
    const result = await query(
      'INSERT INTO tow_requests (customer_id, pickup_address, dropoff_address, vehicle_info, latitude, longitude, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customerId, pickupAddress.trim(), dropoffAddress.trim(), vehicleInfo?.trim() || null, latitude, longitude, 'pending']
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating tow request:', error)
    res.status(500).json({ error: 'Failed to create tow request' })
  }
})

// Get pending tow requests for towing companies
router.get('/pending', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tow_requests WHERE status = $1 ORDER BY created_at DESC',
      ['pending']
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching pending tow requests:', error)
    res.status(500).json({ error: 'Failed to fetch tow requests' })
  }
})

// Accept tow request (bidding)
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params
    const { bidAmount, towingCompanyId } = req.body

    // For demo: use first mechanic user as towing company
    const companyCheck = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['mechanic'])
    const companyId = companyCheck.rows.length > 0 ? companyCheck.rows[0].id : towingCompanyId

    if (!bidAmount) {
      return res.status(400).json({ error: 'Bid amount is required' })
    }

    // Update tow request with bid
    const result = await query(
      'UPDATE tow_requests SET status = $1, accepted_by = $2, bid_amount = $3, accepted_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      ['accepted', companyId, bidAmount, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tow request not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error accepting tow request:', error)
    res.status(500).json({ error: 'Failed to accept tow request' })
  }
})

// Get customer's tow requests
router.get('/customer', async (req, res) => {
  try {
    // For demo: use first customer
    const customerCheck = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['customer'])
    const customerId = customerCheck.rows.length > 0 ? customerCheck.rows[0].id : null

    if (!customerId) {
      return res.json([])
    }

    const result = await query(
      'SELECT * FROM tow_requests WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching customer tow requests:', error)
    res.status(500).json({ error: 'Failed to fetch tow requests' })
  }
})

export default router







