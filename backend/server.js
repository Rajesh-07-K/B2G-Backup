require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { connectDB, seedRoles } = require('./config/database')

const app = express()

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
}))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/skills', require('./routes/skills'))
app.use('/api/roadmap', require('./routes/roadmap'))
app.use('/api/quiz', require('./routes/quiz'))
app.use('/api/opportunities', require('./routes/opportunities'))
app.use('/api/community', require('./routes/community'))
app.use('/api/users', require('./routes/users'))

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'B2G Backend', db: 'MongoDB Atlas', timestamp: new Date().toISOString() })
})

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()

  const { seedRoles, seedQuizzes, seedOpportunities } = require('./config/database')
  await seedRoles()
  await seedQuizzes()
  await seedOpportunities()

  app.listen(PORT, () => {
    console.log(`🚀 B2G Backend running on http://localhost:${PORT}`)
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}


start()
