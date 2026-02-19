import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { roadmapAPI, skillsAPI } from '../services/api'
import { saveRoadmapOffline } from '../services/offlineDB'
import toast from 'react-hot-toast'
import { Map, Clock, Target, CheckCircle, ExternalLink, Loader, ChevronRight, Plus } from 'lucide-react'

const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' }, { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' }, { code: 'kn', label: 'Kannada' },
]

import { STATIC_FULLSTACK_ROADMAP } from '../data/staticDemo'

function RoadmapDetail({ id }) {
    const [roadmap, setRoadmap] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id === 'static-fs-roadmap' || id === 'demo') {
            setRoadmap(STATIC_FULLSTACK_ROADMAP)
            setLoading(false)
            return
        }
        roadmapAPI.getById(id)
            .then(res => {
                setRoadmap(res.data.roadmap)
                saveRoadmapOffline(res.data.roadmap).catch(() => { })
            })
            .catch(() => toast.error('Failed to load roadmap'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="loading-center"><div className="spinner" /></div>
    if (!roadmap) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Roadmap not found</div>

    const plan = roadmap.weekly_plan || []
    const missing = roadmap.missing_skills || []

    return (
        <div>
            {/* Header */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                border: '1px solid rgba(99,102,241,0.3)', marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                            <Map size={12} /> Active Roadmap
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{roadmap.target_role}</h2>
                        <p style={{ fontSize: '0.9rem' }}>
                            <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
                            {roadmap.availability_hours}h/week · {plan.length} weeks total
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                        }}>
                            {roadmap.readiness_percentage}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready</div>
                    </div>
                </div>
                <div className="progress-bar" style={{ marginTop: '1rem' }}>
                    <div className="progress-fill" style={{ width: `${roadmap.readiness_percentage}%` }} />
                </div>
                {missing.length > 0 && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {missing.map(s => <span key={s} className="skill-tag missing" style={{ fontSize: '0.75rem' }}>{s}</span>)}
                    </div>
                )}
            </div>

            {/* Weekly Plan */}
            <h3 style={{ marginBottom: '1.5rem' }}>📅 Weekly Learning Plan</h3>
            {plan.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No weekly plan available
                </div>
            ) : (
                <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: '2px', background: 'linear-gradient(180deg, #6366f1, #06b6d4)'
                    }} />
                    {plan.map((week, i) => (
                        <div key={i} className="week-card">
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '0.75rem'
                            }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white', padding: '0.2rem 0.75rem', borderRadius: '999px',
                                    fontSize: '0.75rem', fontWeight: 700
                                }}>Week {week.week}</span>
                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{week.focus_skill}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    ~{week.estimated_hours}h
                                </span>
                            </div>

                            {week.topics && (
                                <ul style={{ listStyle: 'none', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {week.topics.map((topic, j) => (
                                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <CheckCircle size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {week.milestone && (
                                <div style={{
                                    padding: '0.5rem 0.85rem', borderRadius: '8px',
                                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                                    fontSize: '0.8rem', color: '#fbbf24', marginBottom: '0.75rem',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <Target size={13} /> {week.milestone}
                                </div>
                            )}

                            {week.resources && week.resources.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {week.resources.map((r, j) => (
                                        <a key={j} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                                            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                                            color: '#22d3ee', fontSize: '0.75rem', textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}>
                                            <ExternalLink size={11} /> {r.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function GenerateRoadmap() {
    const navigate = useNavigate()
    const [roles, setRoles] = useState([])
    const [form, setForm] = useState({
        role_id: new URLSearchParams(window.location.search).get('role_id') || '',
        availability_hours: parseInt(new URLSearchParams(window.location.search).get('hours')) || 10,
        preferred_language: 'en'
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        skillsAPI.getRoles().then(res => setRoles(res.data.roles)).catch(() => { })
    }, [])

    const handleGenerate = async () => {
        if (!form.role_id) return toast.error('Select a target role')

        const selectedRole = roles.find(r => r.id === form.role_id)
        if (selectedRole?.title.toLowerCase().includes('full stack')) {
            setLoading(true)
            setTimeout(() => {
                toast.success('Generated Full Stack Roadmap! (Demo Mode)')
                navigate('/roadmap/static-fs-roadmap')
                setLoading(false)
            }, 2000)
            return
        }

        setLoading(true)
        try {
            const res = await roadmapAPI.generate(form)
            toast.success('Roadmap generated! 🎉')
            navigate(`/roadmap/${res.data.roadmap.id}`)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate roadmap')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>
                <Map size={22} color="var(--primary-light)" style={{ display: 'inline', marginRight: 8 }} />
                Generate AI Roadmap
            </h2>
            <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                Our AI will create a personalized week-by-week learning plan based on your skill gaps.
            </p>

            <div className="form-group">
                <label className="form-label">Target Role *</label>
                <select className="form-select" value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
                    <option value="">Select your target role...</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Study Hours per Week: {form.availability_hours}h</label>
                <input type="range" min={2} max={40} step={2} value={form.availability_hours}
                    onChange={e => setForm(f => ({ ...f, availability_hours: parseInt(e.target.value) }))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>2h (Casual)</span><span>20h (Regular)</span><span>40h (Intensive)</span>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Preferred Language</label>
                <select className="form-select" value={form.preferred_language} onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={handleGenerate} disabled={loading}>
                {loading ? <><Loader size={18} /> Generating with AI...</> : <>Generate My Roadmap <ChevronRight size={18} /></>}
            </button>

            {loading && (
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ⏳ This may take 15–30 seconds...
                </p>
            )}
        </div>
    )
}

export default function RoadmapPage() {
    const { id } = useParams()
    const [roadmaps, setRoadmaps] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!id) {
            roadmapAPI.getMyRoadmaps()
                .then(res => {
                    const list = res.data.roadmaps || []
                    setRoadmaps([STATIC_FULLSTACK_ROADMAP, ...list])
                })
                .catch(() => {
                    setRoadmaps([STATIC_FULLSTACK_ROADMAP])
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [id])

    if (id === 'generate') return (
        <div className="page"><div className="container" style={{ padding: '2rem 1.5rem' }}><GenerateRoadmap /></div></div>
    )

    if (id) return (
        <div className="page"><div className="container" style={{ padding: '2rem 1.5rem' }}>
            <Link to="/roadmap" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem' }}>
                ← Back to Roadmaps
            </Link>
            <RoadmapDetail id={id} />
        </div></div>
    )

    return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                            <Map size={24} color="var(--primary-light)" style={{ display: 'inline', marginRight: 8 }} />
                            My Roadmaps
                        </h1>
                        <p>Your AI-generated learning plans</p>
                    </div>
                    <Link to="/roadmap/generate" className="btn btn-primary">
                        <Plus size={16} /> Generate New Roadmap
                    </Link>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : roadmaps.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Map size={60} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No Roadmaps Yet</h3>
                        <p style={{ marginBottom: '1rem' }}>Generate your first AI-powered learning roadmap</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to="/roadmap/generate" className="btn btn-primary">
                                Generate Roadmap <ChevronRight size={18} />
                            </Link>
                            <Link to="/roadmap/static-fs-roadmap" className="btn btn-secondary">
                                View Sample Full Stack Roadmap
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid-auto">
                        {roadmaps.map(r => (
                            <Link to={`/roadmap/${r.id}`} key={r.id} className="card" style={{ textDecoration: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <div className={`badge badge-${r.status === 'active' ? 'success' : r.status === 'completed' ? 'primary' : 'warning'}`} style={{ marginBottom: '0.5rem' }}>
                                                {r.status}
                                            </div>
                                            {r.id === 'static-fs-roadmap' && <span className="badge badge-primary">DEMO</span>}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem' }}>{r.target_role}</h3>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', color: 'var(--primary-light)' }}>
                                        {r.readiness_percentage}%
                                    </div>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                                    <div className="progress-fill" style={{ width: `${r.readiness_percentage}%` }} />
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Created {new Date(r.created_at).toLocaleDateString()}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
