import express from 'express'
import { query } from '../db/index.js'
import { authenticateToken } from './auth.js'

const router = express.Router()

// Get all online mechanics
router.get('/online', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        ml.user_id,
        ml.latitude,
        ml.longitude,
        ml.last_updated,
        u.name,
        u.email
      FROM mechanic_locations ml
      JOIN users u ON ml.user_id = u.id
      WHERE ml.is_online = true
        AND ml.latitude IS NOT NULL
        AND ml.longitude IS NOT NULL
    `)

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching online mechanics:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update mechanic location and availability
router.post('/location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, isOnline } = req.body
    const userId = req.user.userId

    // Verify user is a mechanic
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [userId])
    if (userCheck.rows[0].role !== 'mechanic') {
      return res.status(403).json({ error: 'Only mechanics can update location' })
    }

    // Upsert mechanic location
    await query(
      `INSERT INTO mechanic_locations (user_id, latitude, longitude, is_online, last_updated)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         latitude = $2,
         longitude = $3,
         is_online = $4,
         last_updated = CURRENT_TIMESTAMP`,
      [userId, latitude, longitude, isOnline ?? true]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating mechanic location:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Toggle mechanic availability
router.post('/availability', authenticateToken, async (req, res) => {
  try {
    const { isOnline } = req.body
    const userId = req.user.userId

    // Verify user is a mechanic
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [userId])
    if (userCheck.rows[0].role !== 'mechanic') {
      return res.status(403).json({ error: 'Only mechanics can update availability' })
    }

    await query(
      `INSERT INTO mechanic_locations (user_id, is_online, last_updated)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         is_online = $2,
         last_updated = CURRENT_TIMESTAMP`,
      [userId, isOnline]
    )

    res.json({ success: true, isOnline })
  } catch (error) {
    console.error('Error updating availability:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get mechanic's current status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const result = await query(
      'SELECT * FROM mechanic_locations WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.json({ isOnline: false, latitude: null, longitude: null })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching mechanic status:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router







