const router = require('express').Router()
const { User, Skill, Roadmap, QuizResult, Opportunity, normalizeDoc } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')

// ── GET /api/users/profile ────────────────────────────────────────────────────
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password_hash').lean()
        if (!user) return res.status(404).json({ error: 'User not found' })

        const skills = await Skill.find({ user_id: req.user.id }).lean()
        const roadmaps = await Roadmap.find({ user_id: req.user.id }).select('-weekly_plan').lean()
        const results = await QuizResult.find({ user_id: req.user.id }).lean()

        const total_quizzes = results.length
        const avg_score = total_quizzes > 0
            ? results.reduce((sum, r) => sum + (r.score / (r.total_questions || 1)) * 100, 0) / total_quizzes
            : 0

        res.json({
            user: normalizeDoc(user),
            skills: normalizeDoc(skills),
            roadmaps: normalizeDoc(roadmaps),
            stats: { total_quizzes, avg_score: Math.round(avg_score) }
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── PATCH /api/users/profile ──────────────────────────────────────────────────
router.patch('/profile', authenticateToken, async (req, res) => {
    try {
        const allowed = ['name', 'district', 'state', 'preferred_language', 'education_level']
        const updates = {}
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key]
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password_hash').lean()
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({ user: normalizeDoc(user) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/users/dashboard ──────────────────────────────────────────────────
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean()

        // Active roadmap
        const active_roadmap_raw = await Roadmap.findOne({ user_id: req.user.id, status: 'active' })
            .select('target_role missing_skills readiness_percentage status _id')
            .lean()

        // Recent quiz results
        const recentResults = await QuizResult.find({ user_id: req.user.id })
            .populate('quiz_id', 'title skill_category')
            .sort({ completed_at: -1 })
            .limit(5)
            .lean()

        const recent_quizzes = recentResults.map(r => ({
            title: r.quiz_id?.title || 'Quiz',
            score: r.score,
            total_questions: r.total_questions,
            completed_at: r.completed_at
        }))

        // Skill stats
        const skills = await Skill.find({ user_id: req.user.id }).lean()
        const skillByCategory = {}
        for (const s of skills) {
            skillByCategory[s.category] = (skillByCategory[s.category] || 0) + 1
        }
        const skill_stats = Object.entries(skillByCategory).map(([category, count]) => ({ category, count }))

        // Local opportunities
        let local_opportunities = []
        if (user?.district) {
            const opps = await Opportunity.find({
                location_district: { $regex: user.district, $options: 'i' },
                status: 'open'
            }).limit(3).lean()
            local_opportunities = normalizeDoc(opps)
        }

        res.json({
            active_roadmap: normalizeDoc(active_roadmap_raw),
            recent_quizzes,
            skill_stats,
            local_opportunities
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
