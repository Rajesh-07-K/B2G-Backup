const router = require('express').Router()
const { CommunityProject, User, normalizeDoc } = require('../config/database')
const { authenticateToken, optionalAuth } = require('../middleware/auth')

// ── GET /api/community/projects ───────────────────────────────────────────────
router.get('/projects', optionalAuth, async (req, res) => {
    try {
        const { language } = req.query
        const filter = { status: 'published' }
        if (language) filter.language_tag = language

        const projects = await CommunityProject.find(filter)
            .populate('user_id', 'name district state')
            .sort({ created_at: -1 })
            .lean()

        const formatted = normalizeDoc(projects).map(p => ({
            ...p,
            author_name: p.user_id?.name,
            author_district: p.user_id?.district,
        }))
        res.json({ projects: formatted })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/community/projects/:id ──────────────────────────────────────────
router.get('/projects/:id', optionalAuth, async (req, res) => {
    try {
        const project = await CommunityProject.findById(req.params.id)
            .populate('user_id', 'name district state')
            .lean()
        if (!project) return res.status(404).json({ error: 'Project not found' })

        const normalized = normalizeDoc(project)
        res.json({
            project: {
                ...normalized,
                author_name: project.user_id?.name,
                author_district: project.user_id?.district,
            }
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/community/projects ──────────────────────────────────────────────
router.post('/projects', authenticateToken, async (req, res) => {
    try {
        const { title, summary, steps, tags, language_tag } = req.body
        if (!title || !summary) return res.status(400).json({ error: 'Title and summary required' })

        const project = await CommunityProject.create({
            user_id: req.user.id, title, summary,
            steps: Array.isArray(steps) ? steps : [],
            tags: Array.isArray(tags) ? tags : [],
            language_tag: language_tag || 'en',
            status: 'draft'
        })
        res.status(201).json({ project: normalizeDoc(project.toObject()) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/community/projects/:id/publish ──────────────────────────────────
router.post('/projects/:id/publish', authenticateToken, async (req, res) => {
    try {
        const project = await CommunityProject.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { status: 'published' },
            { new: true }
        ).lean()
        if (!project) return res.status(404).json({ error: 'Project not found or not authorized' })
        res.json({ project: normalizeDoc(project) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/community/my-projects ────────────────────────────────────────────
router.get('/my-projects', authenticateToken, async (req, res) => {
    try {
        const projects = await CommunityProject.find({ user_id: req.user.id }).sort({ created_at: -1 }).lean()
        res.json({ projects: normalizeDoc(projects) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
