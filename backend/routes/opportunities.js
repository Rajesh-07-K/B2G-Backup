const router = require('express').Router()
const { Opportunity, Application, User, normalizeDoc } = require('../config/database')
const { authenticateToken, optionalAuth } = require('../middleware/auth')

// ── GET /api/opportunities ────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { category, district, status = 'open' } = req.query
        const filter = { status }
        if (category) filter.category = category
        if (district) filter.location_district = { $regex: district, $options: 'i' }

        const opportunities = await Opportunity.find(filter)
            .populate('posted_by', 'name district')
            .sort({ created_at: -1 })
            .lean()
        res.json({ opportunities: normalizeDoc(opportunities) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/opportunities/:id ────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('posted_by', 'name district state')
            .lean()
        if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' })

        const applications_count = await Application.countDocuments({ opportunity_id: req.params.id })
        const normalized = normalizeDoc(opportunity)
        res.json({ opportunity: { ...normalized, posted_by_name: opportunity.posted_by?.name }, applications_count })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/opportunities ───────────────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, category, location_district, location_state, required_skills } = req.body
        if (!title || !description || !location_district) return res.status(400).json({ error: 'Title, description and district required' })

        const opp = await Opportunity.create({
            title, description, category: category || 'other',
            location_district, location_state: location_state || '',
            required_skills: Array.isArray(required_skills) ? required_skills : [],
            posted_by: req.user.id
        })
        res.status(201).json({ opportunity: normalizeDoc(opp.toObject()) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/opportunities/:id/apply ─────────────────────────────────────────
router.post('/:id/apply', authenticateToken, async (req, res) => {
    try {
        const { proposal } = req.body
        const opp = await Opportunity.findById(req.params.id)
        if (!opp) return res.status(404).json({ error: 'Opportunity not found' })
        if (opp.status !== 'open') return res.status(400).json({ error: 'Opportunity is no longer open' })

        const existing = await Application.findOne({ opportunity_id: req.params.id, applicant_id: req.user.id })
        if (existing) return res.status(409).json({ error: 'Already applied' })

        const app = await Application.create({
            opportunity_id: req.params.id, applicant_id: req.user.id, proposal: proposal || ''
        })
        res.status(201).json({ application: normalizeDoc(app.toObject()) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/opportunities/:id/applications ───────────────────────────────────
router.get('/:id/applications', authenticateToken, async (req, res) => {
    try {
        const opp = await Opportunity.findById(req.params.id)
        if (!opp) return res.status(404).json({ error: 'Not found' })
        if (String(opp.posted_by) !== String(req.user.id)) return res.status(403).json({ error: 'Not authorized' })

        const applications = await Application.find({ opportunity_id: req.params.id })
            .populate('applicant_id', 'name email district')
            .lean()
        res.json({ applications: normalizeDoc(applications) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/opportunities/seed ──────────────────────────────────────────────
router.post('/seed', async (req, res) => {
    try {
        const count = await Opportunity.countDocuments()
        if (count > 0) return res.json({ message: 'Already seeded', count })

        await Opportunity.insertMany([
            { title: 'Build Inventory App for Kirana Store', description: 'Local grocery store needs a simple inventory management app to track stock and sales.', category: 'shop', location_district: 'Nashik', location_state: 'Maharashtra', required_skills: ['React', 'Node.js', 'MongoDB'] },
            { title: 'School Attendance System', description: 'Government school needs a digital attendance tracking system for 500 students.', category: 'school', location_district: 'Pune', location_state: 'Maharashtra', required_skills: ['Python', 'SQL', 'HTML'] },
            { title: 'Crop Price Alert App', description: 'Farmers need a mobile app to get daily crop price alerts from local mandis.', category: 'agriculture', location_district: 'Aurangabad', location_state: 'Maharashtra', required_skills: ['React Native', 'API Integration'] },
            { title: 'Healthcare Appointment Booking', description: 'Local clinic needs an online appointment booking system for patients.', category: 'health', location_district: 'Mumbai', location_state: 'Maharashtra', required_skills: ['React', 'Node.js', 'SQL'] },
            { title: 'Transport Route Optimizer', description: 'Local bus service needs a route optimization tool to reduce fuel costs.', category: 'transport', location_district: 'Nagpur', location_state: 'Maharashtra', required_skills: ['Python', 'Data Analysis', 'Maps API'] },
        ])
        res.json({ message: 'Seeded!', count: 5 })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
