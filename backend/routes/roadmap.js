const router = require('express').Router()
const axios = require('axios')
const { Roadmap, Role, Skill, normalizeDoc } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')

// ── POST /api/roadmap/generate ────────────────────────────────────────────────
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { role_id, availability_hours = 10, preferred_language = 'en' } = req.body
        if (!role_id) return res.status(400).json({ error: 'role_id required' })

        const role = await Role.findById(role_id)
        if (!role) return res.status(404).json({ error: 'Role not found' })

        const mySkills = await Skill.find({ user_id: req.user.id }).lean()
        const mySkillNames = mySkills.map(s => s.skill_name.toLowerCase())
        const missing = role.required_skills.filter(s => !mySkillNames.includes(s.toLowerCase()))
        const matched = role.required_skills.filter(s => mySkillNames.includes(s.toLowerCase()))
        const readiness = role.required_skills.length > 0 ? Math.round((matched.length / role.required_skills.length) * 100) : 0

        // Call AI service
        let weekly_plan = []
        try {
            const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/roadmap/generate`, {
                target_role: role.title, missing_skills: missing,
                availability_hours, preferred_language
            }, { timeout: 60000 })
            weekly_plan = aiRes.data.weekly_plan || []
        } catch (aiErr) {
            console.warn('AI service unavailable, using fallback roadmap')
            weekly_plan = missing.slice(0, 8).map((skill, i) => ({
                week: i + 1, focus_skill: skill,
                topics: [`Introduction to ${skill}`, `Core concepts of ${skill}`, `Practice projects`],
                estimated_hours: availability_hours,
                milestone: `Complete ${skill} basics`,
                resources: [{ title: `${skill} on YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}` }]
            }))
        }

        const roadmap = await Roadmap.create({
            user_id: req.user.id, target_role: role.title,
            missing_skills: missing, weekly_plan,
            availability_hours, preferred_language, readiness_percentage: readiness
        })

        res.status(201).json({ roadmap: normalizeDoc(roadmap.toObject()) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/roadmap/my-roadmaps ──────────────────────────────────────────────
router.get('/my-roadmaps', authenticateToken, async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ user_id: req.user.id }).sort({ created_at: -1 }).lean()
        res.json({ roadmaps: normalizeDoc(roadmaps) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/roadmap/:id ──────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ _id: req.params.id, user_id: req.user.id }).lean()
        if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' })
        res.json({ roadmap: normalizeDoc(roadmap) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── PATCH /api/roadmap/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body
        const roadmap = await Roadmap.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { status }, { new: true }
        ).lean()
        if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' })
        res.json({ roadmap: normalizeDoc(roadmap) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
