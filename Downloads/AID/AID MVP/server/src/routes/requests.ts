import express from 'express'
import { query } from '../db/index.js'
import { authenticateToken } from './auth.js'

const router = express.Router()

// Create service request (public for demo - remove authenticateToken for now)
router.post('/', async (req, res) => {
  try {
    const { mechanicId, latitude, longitude, address, description, roughEstimate } = req.body
    
    // For demo: use first customer user if no auth
    let customerId
    if (req.user?.userId) {
      customerId = req.user.userId
      // Verify user is a customer
      const userCheck = await query('SELECT role FROM users WHERE id = $1', [customerId])
      if (userCheck.rows[0].role !== 'customer') {
        return res.status(403).json({ error: 'Only customers can create requests' })
      }
    } else {
      // Demo mode: use first customer user
      const customerCheck = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['customer'])
      if (customerCheck.rows.length === 0) {
        return res.status(400).json({ error: 'No customer users found' })
      }
      customerId = customerCheck.rows[0].id
    }

    // Validation
    if (!mechanicId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Mechanic ID and location are required' })
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Address is required' })
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description of car issue is required' })
    }

    // Check if customer has pending request
    const existingRequest = await query(
      'SELECT id FROM service_requests WHERE customer_id = $1 AND status IN ($2, $3)',
      [customerId, 'pending', 'accepted']
    )
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'You already have an active request' })
    }

    // Create request
    const result = await query(
      'INSERT INTO service_requests (customer_id, mechanic_id, customer_latitude, customer_longitude, address, description, rough_estimate, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [customerId, mechanicId, latitude, longitude, address.trim(), description.trim(), roughEstimate?.trim() || null, 'pending']
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating request:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get customer's requests
router.get('/customer', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.userId

    const result = await query(
      'SELECT sr.*, u.name as mechanic_name, u.email as mechanic_email FROM service_requests sr LEFT JOIN users u ON sr.mechanic_id = u.id WHERE sr.customer_id = $1 ORDER BY sr.created_at DESC',
      [customerId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching customer requests:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get mechanic's incoming requests
router.get('/mechanic/pending', authenticateToken, async (req, res) => {
  try {
    const mechanicId = req.user.userId

    // Verify user is a mechanic
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [mechanicId])
    if (userCheck.rows[0].role !== 'mechanic') {
      return res.status(403).json({ error: 'Only mechanics can view requests' })
    }

    const result = await query(
      'SELECT sr.*, u.name as customer_name, u.email as customer_email FROM service_requests sr JOIN users u ON sr.customer_id = u.id WHERE sr.mechanic_id = $1 AND sr.status = $2 ORDER BY sr.created_at ASC',
      [mechanicId, 'pending']
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching mechanic requests:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get mechanic's all requests
router.get('/mechanic/all', authenticateToken, async (req, res) => {
  try {
    const mechanicId = req.user.userId

    // Verify user is a mechanic
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [mechanicId])
    if (userCheck.rows[0].role !== 'mechanic') {
      return res.status(403).json({ error: 'Only mechanics can view requests' })
    }

    const result = await query(
      'SELECT sr.*, u.name as customer_name, u.email as customer_email FROM service_requests sr JOIN users u ON sr.customer_id = u.id WHERE sr.mechanic_id = $1 ORDER BY sr.created_at DESC',
      [mechanicId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching mechanic requests:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Accept request
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id)
    const mechanicId = req.user.userId

    // Verify user is a mechanic
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [mechanicId])
    if (userCheck.rows[0].role !== 'mechanic') {
      return res.status(403).json({ error: 'Only mechanics can accept requests' })
    }

    // Check request exists and is pending
    const requestCheck = await query('SELECT * FROM service_requests WHERE id = $1', [requestId])
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' })
    }

    const request = requestCheck.rows[0]
    if (request.mechanic_id !== mechanicId) {
      return res.status(403).json({ error: 'This request is not for you' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer available' })
    }

    // Update request status
    const result = await query(
      'UPDATE service_requests SET status = $1, accepted_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['accepted', requestId]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error accepting request:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Decline request
router.post('/:id/decline', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id)
    const mechanicId = req.user.userId

    // Verify user is a mechanic
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [mechanicId])
    if (userCheck.rows[0].role !== 'mechanic') {
      return res.status(403).json({ error: 'Only mechanics can decline requests' })
    }

    // Check request exists
    const requestCheck = await query('SELECT * FROM service_requests WHERE id = $1', [requestId])
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' })
    }

    const request = requestCheck.rows[0]
    if (request.mechanic_id !== mechanicId) {
      return res.status(403).json({ error: 'This request is not for you' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer available' })
    }

    // Update request status
    const result = await query(
      'UPDATE service_requests SET status = $1 WHERE id = $2 RETURNING *',
      ['declined', requestId]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error declining request:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update request status (in_progress, completed, cancelled) - public for demo
router.patch('/:id/status', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id)
    const { status } = req.body
    
    // For demo: allow without auth
    let userId = req.user?.userId

    if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // Get request
    const requestCheck = await query('SELECT * FROM service_requests WHERE id = $1', [requestId])
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' })
    }

    const request = requestCheck.rows[0]
    
    // For demo: allow updates without strict auth check
    // In production, you'd verify userId matches customer_id or mechanic_id
    if (userId) {
      const isCustomer = request.customer_id === userId
      const isMechanic = request.mechanic_id === userId

      if (!isCustomer && !isMechanic) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      // Only customers can cancel, mechanics can complete
      if (status === 'cancelled' && !isCustomer) {
        return res.status(403).json({ error: 'Only customers can cancel requests' })
      }
    }

    // Update status
    let updateQuery = 'UPDATE service_requests SET status = $1'
    const params: any[] = [status, requestId]

    if (status === 'completed') {
      updateQuery += ', completed_at = CURRENT_TIMESTAMP'
    } else if (status === 'cancelled') {
      updateQuery += ', cancelled_at = CURRENT_TIMESTAMP'
    }

    updateQuery += ' WHERE id = $2 RETURNING *'

    const result = await query(updateQuery, params)
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating request status:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get active request for customer (public for demo)
router.get('/customer/active', async (req, res) => {
  try {
    // For demo: use first customer user if no auth
    let customerId
    if (req.user?.userId) {
      customerId = req.user.userId
    } else {
      const customerCheck = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['customer'])
      if (customerCheck.rows.length === 0) {
        return res.json(null)
      }
      customerId = customerCheck.rows[0].id
    }

    const result = await query(
      'SELECT sr.*, u.name as mechanic_name FROM service_requests sr LEFT JOIN users u ON sr.mechanic_id = u.id WHERE sr.customer_id = $1 AND sr.status IN ($2, $3) ORDER BY sr.created_at DESC LIMIT 1',
      [customerId, 'pending', 'accepted']
    )

    if (result.rows.length === 0) {
      return res.json(null)
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching active request:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

