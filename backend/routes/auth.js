const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, OTP, normalizeDoc } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')

const signToken = (user) =>
    jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body
        if (!phone) return res.status(400).json({ error: 'Phone number required' })

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expires_at = new Date(Date.now() + 10 * 60 * 1000) // 10 min

        await OTP.deleteMany({ phone })
        await OTP.create({ phone, otp, expires_at })

        // TODO: integrate Twilio for production SMS
        console.log(`📱 OTP for ${phone}: ${otp}`)

        res.json({ message: 'OTP sent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp, name, district, state, preferred_language } = req.body
        if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' })

        const record = await OTP.findOne({ phone, otp, expires_at: { $gt: new Date() } })
        if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' })

        await OTP.deleteMany({ phone })

        let user = await User.findOne({ phone })
        if (!user) {
            user = await User.create({
                phone, name: name || `User_${phone.slice(-4)}`,
                district: district || '', state: state || '',
                preferred_language: preferred_language || 'en',
                is_verified: true
            })
        } else {
            user.is_verified = true
            await user.save()
        }

        const u = normalizeDoc(user.toObject())
        res.json({ token: signToken(user), user: { id: u.id, name: u.name, email: u.email, phone: u.phone, district: u.district, state: u.state, preferred_language: u.preferred_language } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, district, state, preferred_language, education_level } = req.body
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' })
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists) return res.status(409).json({ error: 'Email already registered' })

        const password_hash = await bcrypt.hash(password, 12)
        const user = await User.create({
            name, email: email.toLowerCase(), password_hash,
            district: district || '', state: state || '',
            preferred_language: preferred_language || 'en',
            education_level: education_level || '',
            is_verified: true
        })

        const u = normalizeDoc(user.toObject())
        res.status(201).json({ token: signToken(user), user: { id: u.id, name: u.name, email: u.email, district: u.district, state: u.state, preferred_language: u.preferred_language } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid email or password' })

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

        const u = normalizeDoc(user.toObject())
        res.json({ token: signToken(user), user: { id: u.id, name: u.name, email: u.email, district: u.district, state: u.state, preferred_language: u.preferred_language } })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password_hash').lean()
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({ user: normalizeDoc(user) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
