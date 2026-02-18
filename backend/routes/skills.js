const router = require('express').Router()
const axios = require('axios')
const { Skill, Role, normalizeDoc } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// ── GET /api/skills/roles ─────────────────────────────────────────────────────
router.get('/roles', async (req, res) => {
    try {
        const roles = await Role.find().lean()
        res.json({ roles: normalizeDoc(roles) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── GET /api/skills/my-skills ─────────────────────────────────────────────────
router.get('/my-skills', authenticateToken, async (req, res) => {
    try {
        const skills = await Skill.find({ user_id: req.user.id }).lean()
        res.json({ skills: normalizeDoc(skills) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/skills/add ──────────────────────────────────────────────────────
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { skills } = req.body
        if (!skills || !Array.isArray(skills)) return res.status(400).json({ error: 'skills array required' })

        const created = []
        for (const s of skills) {
            const exists = await Skill.findOne({ user_id: req.user.id, skill_name: { $regex: new RegExp(`^${s.skill_name}$`, 'i') } })
            if (!exists) {
                const skill = await Skill.create({ user_id: req.user.id, skill_name: s.skill_name, category: s.category || 'general', proficiency: s.proficiency || 'beginner', source: s.source || 'manual' })
                created.push(normalizeDoc(skill.toObject()))
            }
        }
        res.status(201).json({ skills: created, added: created.length })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ── POST /api/skills/extract-resume ──────────────────────────────────────────
router.post('/extract-resume', authenticateToken, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

        let extractedSkills = []
        try {
            // Try sending to AI service using multipart
            const boundary = '----FormBoundary' + Date.now()
            const body = Buffer.concat([
                Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="${req.file.originalname}"\r\nContent-Type: ${req.file.mimetype}\r\n\r\n`),
                req.file.buffer,
                Buffer.from(`\r\n--${boundary}--\r\n`)
            ])
            const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/skills/extract-resume`, body, {
                headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
                timeout: 30000
            })
            extractedSkills = aiRes.data.skills || []
        } catch (aiErr) {
            console.warn('AI service unavailable for resume extraction:', aiErr.message)
            return res.status(503).json({ error: 'AI service unavailable. Please add skills manually.' })
        }

        const saved = []
        for (const s of extractedSkills) {
            const exists = await Skill.findOne({ user_id: req.user.id, skill_name: { $regex: new RegExp(`^${s.skill_name}$`, 'i') } })
            if (!exists) {
                const skill = await Skill.create({ user_id: req.user.id, skill_name: s.skill_name, category: s.category || 'general', proficiency: s.proficiency || 'beginner', source: 'resume' })
                saved.push(normalizeDoc(skill.toObject()))
            }
        }
        res.json({ skills: saved, extracted: extractedSkills.length, saved: saved.length })
    } catch (err) {
        res.status(500).json({ error: 'Resume extraction failed: ' + err.message })
    }
})

// ── POST /api/skills/gap-analysis ─────────────────────────────────────────────
router.post('/gap-analysis', authenticateToken, async (req, res) => {
    try {
        const { role_id } = req.body
        if (!role_id) return res.status(400).json({ error: 'role_id required' })

        const role = await Role.findById(role_id)
        if (!role) return res.status(404).json({ error: 'Role not found' })

        const mySkills = await Skill.find({ user_id: req.user.id }).lean()
        const mySkillNames = mySkills.map(s => s.skill_name.toLowerCase())

        const matched = role.required_skills.filter(s => mySkillNames.includes(s.toLowerCase()))
        const missing = role.required_skills.filter(s => !mySkillNames.includes(s.toLowerCase()))
        const readiness = role.required_skills.length > 0 ? Math.round((matched.length / role.required_skills.length) * 100) : 0

        res.json({ role: normalizeDoc(role.toObject()), matched_skills: matched, missing_skills: missing, total_matched: matched.length, total_required: role.required_skills.length, readiness_percentage: readiness })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
