import { useEffect, useState } from 'react'
import { skillsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Plus, X, Upload, Zap, Target, CheckCircle, AlertCircle, Loader, ChevronRight } from 'lucide-react'

const SKILL_SUGGESTIONS = [
    'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'HTML', 'CSS',
    'Java', 'Machine Learning', 'Data Analysis', 'Excel', 'Figma', 'Docker',
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork'
]

export default function SkillsPage() {
    const [mySkills, setMySkills] = useState([])
    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)
    const [gapResult, setGapResult] = useState(null)
    const [newSkill, setNewSkill] = useState('')
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [activeTab, setActiveTab] = useState('skills') // 'skills' | 'gap' | 'resume'
    const [resumeFile, setResumeFile] = useState(null)
    const [extracting, setExtracting] = useState(false)

    useEffect(() => {
        Promise.all([skillsAPI.getMySkills(), skillsAPI.getRoles()])
            .then(([skillsRes, rolesRes]) => {
                setMySkills(skillsRes.data.skills)
                setRoles(rolesRes.data.roles)
            })
            .catch(() => toast.error('Failed to load data'))
    }, [])

    const addSkill = async () => {
        if (!newSkill.trim()) return
        setLoading(true)
        try {
            const res = await skillsAPI.addSkills([{ skill_name: newSkill.trim(), category: 'general' }])
            setMySkills(prev => [...prev, ...res.data.skills])
            setNewSkill('')
            toast.success(`Added: ${newSkill}`)
        } catch {
            toast.error('Failed to add skill')
        } finally {
            setLoading(false)
        }
    }

    const addSuggestion = async (skill) => {
        if (mySkills.find(s => s.skill_name.toLowerCase() === skill.toLowerCase())) {
            return toast('Already added!', { icon: '✓' })
        }
        setLoading(true)
        try {
            const res = await skillsAPI.addSkills([{ skill_name: skill, category: 'general' }])
            setMySkills(prev => [...prev, ...res.data.skills])
            toast.success(`Added: ${skill}`)
        } catch {
            toast.error('Failed to add')
        } finally {
            setLoading(false)
        }
    }

    const runGapAnalysis = async () => {
        if (!selectedRole) return toast.error('Select a target role first')
        setAnalyzing(true)
        try {
            const res = await skillsAPI.gapAnalysis(selectedRole)
            setGapResult(res.data)
            setActiveTab('gap')
        } catch {
            toast.error('Gap analysis failed')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleResumeUpload = async () => {
        if (!resumeFile) return toast.error('Select a PDF file first')
        setExtracting(true)

        // STATIC DEMO MODE: Simulate extraction of Full Stack skills
        setTimeout(() => {
            const staticSkills = [
                { id: 's1', skill_name: 'JavaScript', category: 'programming', proficiency: 'advanced' },
                { id: 's2', skill_name: 'React', category: 'framework', proficiency: 'intermediate' },
                { id: 's3', skill_name: 'HTML/CSS', category: 'programming', proficiency: 'advanced' },
                { id: 's4', skill_name: 'Git', category: 'tool', proficiency: 'intermediate' }
            ]

            setMySkills(prev => {
                const existing = prev.map(s => s.skill_name.toLowerCase())
                const newOnes = staticSkills.filter(s => !existing.includes(s.skill_name.toLowerCase()))
                return [...prev, ...newOnes]
            })

            setExtracting(false)
            toast.success(`Extracted skills from ${resumeFile.name}! (Demo Mode)`)
            setActiveTab('skills')

            // Auto-select Full Stack Developer for analysis
            const fsRole = roles.find(r => r.title.toLowerCase().includes('full stack'))
            if (fsRole) setSelectedRole(fsRole.id)

        }, 1500)
    }

    const categoryColors = {
        programming: '#6366f1', framework: '#8b5cf6', database: '#06b6d4',
        cloud_devops: '#f59e0b', tool: '#10b981', concept: '#ec4899',
        soft_skill: '#14b8a6', general: '#94a3b8'
    }

    return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        <Zap size={24} color="var(--primary-light)" style={{ display: 'inline', marginRight: 8 }} />
                        Skills & Gap Analysis
                    </h1>
                    <p>Manage your skills and discover what you need to learn for your target role.</p>
                </div>

                {/* ── Tabs ──────────────────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
                    background: 'var(--bg-card)', borderRadius: '12px', padding: '4px',
                    border: '1px solid var(--border)', width: 'fit-content'
                }}>
                    {[['skills', 'My Skills'], ['gap', 'Gap Analysis'], ['resume', 'Resume Upload']].map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: '0.6rem 1.25rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-muted)',
                            fontWeight: activeTab === tab ? 600 : 400, fontSize: '0.875rem',
                            transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
                        }}>{label}</button>
                    ))}
                </div>

                {/* ── My Skills Tab ─────────────────────────────────────────────── */}
                {activeTab === 'skills' && (
                    <div className="grid-2" style={{ gap: '1.5rem' }}>
                        <div>
                            {/* Add Skill */}
                            <div className="card" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add a Skill</h3>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input className="form-input" placeholder="e.g. Python, React, SQL..."
                                        value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addSkill()} />
                                    <button className="btn btn-primary" onClick={addSkill} disabled={loading}>
                                        {loading ? <Loader size={16} /> : <Plus size={16} />}
                                    </button>
                                </div>
                                {/* Suggestions */}
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Quick Add
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {SKILL_SUGGESTIONS.filter(s => !mySkills.find(ms => ms.skill_name.toLowerCase() === s.toLowerCase())).slice(0, 10).map(s => (
                                            <button key={s} onClick={() => addSuggestion(s)} style={{
                                                padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border)',
                                                background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                                                fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                                                fontFamily: 'Inter, sans-serif'
                                            }}
                                                onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary-light)' }}
                                                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}>
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Role Selection for Gap Analysis */}
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                                    <Target size={16} style={{ display: 'inline', marginRight: 6 }} color="#06b6d4" />
                                    Target Role
                                </h3>
                                <select className="form-select" value={selectedRole || ''} onChange={e => setSelectedRole(e.target.value)} style={{ marginBottom: '1rem' }}>
                                    <option value="">Select your target role...</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                </select>
                                <button className="btn btn-primary btn-full" onClick={runGapAnalysis} disabled={analyzing || !selectedRole}>
                                    {analyzing ? <><Loader size={16} /> Analyzing...</> : <>Run Gap Analysis <ChevronRight size={16} /></>}
                                </button>
                            </div>
                        </div>

                        {/* My Skills List */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem' }}>My Skills ({mySkills.length})</h3>
                            </div>
                            {mySkills.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    <Zap size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                                    <p>No skills added yet. Start by adding your skills!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {mySkills.map(skill => (
                                        <span key={skill.id} className="skill-tag" style={{
                                            borderColor: `${categoryColors[skill.category] || '#94a3b8'}40`,
                                            color: categoryColors[skill.category] || '#94a3b8',
                                            background: `${categoryColors[skill.category] || '#94a3b8'}15`
                                        }}>
                                            {skill.skill_name}
                                            <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>• {skill.proficiency}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Gap Analysis Tab ──────────────────────────────────────────── */}
                {activeTab === 'gap' && gapResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Readiness Score */}
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                            border: '1px solid rgba(99,102,241,0.3)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{gapResult.role.title}</h2>
                                    <p style={{ fontSize: '0.9rem' }}>
                                        {gapResult.total_matched} of {gapResult.total_required} required skills matched
                                    </p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '3rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                                    }}>
                                        {gapResult.readiness_percentage}%
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Readiness Score</div>
                                </div>
                            </div>
                            <div className="progress-bar" style={{ marginTop: '1rem', height: '12px' }}>
                                <div className="progress-fill" style={{ width: `${gapResult.readiness_percentage}%` }} />
                            </div>
                        </div>

                        <div className="grid-2">
                            {/* Matched Skills */}
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={18} /> You Have ({gapResult.matched_skills.length})
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {gapResult.matched_skills.map(s => (
                                        <span key={s} className="skill-tag matched">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={18} /> You Need ({gapResult.missing_skills.length})
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {gapResult.missing_skills.map(s => (
                                        <span key={s} className="skill-tag missing">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {gapResult.missing_skills.length > 0 && (
                            <div style={{ textAlign: 'center' }}>
                                <Link to={`/roadmap/generate?role_id=${gapResult.role.id}`} className="btn btn-primary btn-lg">
                                    Generate AI Roadmap for Missing Skills <ChevronRight size={18} />
                                </Link>
                            </div>
                        )}

                    </div>
                )}

                {activeTab === 'gap' && !gapResult && (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <Target size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No Analysis Yet</h3>
                        <p style={{ marginBottom: '1.5rem' }}>Select a target role and run gap analysis from the Skills tab.</p>
                        <button className="btn btn-primary" onClick={() => setActiveTab('skills')}>Go to Skills Tab</button>
                    </div>
                )}

                {/* ── Resume Upload Tab ─────────────────────────────────────────── */}
                {activeTab === 'resume' && (
                    <div className="card" style={{ maxWidth: '600px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                            <Upload size={18} style={{ display: 'inline', marginRight: 6 }} color="var(--primary-light)" />
                            Upload Resume (PDF)
                        </h3>
                        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Our AI will extract your skills automatically from your resume.
                        </p>
                        <div style={{
                            border: '2px dashed var(--border)', borderRadius: '12px', padding: '2rem',
                            textAlign: 'center', marginBottom: '1rem', cursor: 'pointer',
                            transition: 'border-color 0.2s',
                            background: resumeFile ? 'rgba(99,102,241,0.05)' : 'transparent'
                        }}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); setResumeFile(e.dataTransfer.files[0]) }}>
                            <Upload size={40} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                            <p style={{ marginBottom: '0.5rem' }}>
                                {resumeFile ? `📄 ${resumeFile.name}` : 'Drag & drop your PDF resume here'}
                            </p>
                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                Browse File
                                <input type="file" accept=".pdf" style={{ display: 'none' }}
                                    onChange={e => setResumeFile(e.target.files[0])} />
                            </label>
                        </div>
                        <button className="btn btn-primary btn-full" onClick={handleResumeUpload}
                            disabled={!resumeFile || extracting}>
                            {extracting ? <><Loader size={16} /> Extracting Skills...</> : <>Extract Skills from Resume</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
