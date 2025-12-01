import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './db/index.js'
import authRoutes from './routes/auth.js'
import mechanicRoutes from './routes/mechanics.js'
import requestRoutes from './routes/requests.js'
import towRequestRoutes from './routes/towRequests.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running (in-memory storage)',
    timestamp: new Date().toISOString()
  })
})

// Auth routes
app.use('/api/auth', authRoutes)
app.use('/api/mechanics', mechanicRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/tow-requests', towRequestRoutes)

// Initialize in-memory database
initDatabase().catch(console.error)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

