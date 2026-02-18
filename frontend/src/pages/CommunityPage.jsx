import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { communityAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Users, Plus, Globe, Tag, Image, Send, Loader, BookOpen, ChevronRight } from 'lucide-react'

const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' }, { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' }, { code: 'kn', label: 'Kannada' },
]

function ProjectDetail({ id }) {
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        communityAPI.getById(id)
            .then(res => setProject(res.data.project))
            .catch(() => toast.error('Failed to load project'))
            .finally(() => setLoading(false))
    }, [id])

    const handlePublish = async () => {
        try {
            await communityAPI.publish(id)
            setProject(p => ({ ...p, status: 'published' }))
            toast.success('Project published! 🎉')
        } catch {
            toast.error('Failed to publish')
        }
    }

    if (loading) return <div className="loading-center"><div className="spinner" /></div>
    if (!project) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Project not found</div>

    return (
        <div style={{ maxWidth: '800px' }}>
            <Link to="/community" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem' }}>
                ← Back to Community
            </Link>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            <span className={`badge badge-${project.status === 'published' ? 'success' : 'warning'}`}>{project.status}</span>
                            {project.language_tag && <span className="badge badge-cyan"><Globe size={11} /> {project.language_tag}</span>}
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{project.title}</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            By {project.author_name} · {project.author_district}
                        </p>
                    </div>
                    {user?.id === project.user_id && project.status === 'draft' && (
                        <button className="btn btn-primary btn-sm" onClick={handlePublish}>
                            <Send size={14} /> Publish
                        </button>
                    )}
                </div>

                <p style={{ lineHeight: 1.7, marginBottom: '1.5rem' }}>{project.summary}</p>

                {project.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {project.tags.map(t => <span key={t} className="skill-tag"><Tag size={11} /> {t}</span>)}
                    </div>
                )}

                {project.steps?.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>📋 Project Steps</h3>
                        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {project.steps.map((step, i) => (
                                <li key={i} style={{
                                    display: 'flex', gap: '1rem', padding: '0.75rem', borderRadius: '10px',
                                    background: 'var(--bg-elevated)', alignItems: 'flex-start'
                                }}>
                                    <span style={{
                                        minWidth: 28, height: 28, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '0.8rem', fontWeight: 700
                                    }}>{i + 1}</span>
                                    <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {project.screenshots?.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>📸 Screenshots</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                            {project.screenshots.map((src, i) => (
                                <img key={i} src={src} alt={`Screenshot ${i + 1}`} style={{
                                    width: '100%', borderRadius: '10px', border: '1px solid var(--border)', objectFit: 'cover', aspectRatio: '16/9'
                                }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function CommunityPage() {
    const { id } = useParams()
    const { isAuthenticated } = useAuth()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ title: '', summary: '', steps: '', language_tag: 'en', tags: '' })
    const [creating, setCreating] = useState(false)
    const [langFilter, setLangFilter] = useState('')

    useEffect(() => {
        if (!id) {
            communityAPI.getProjects({ language: langFilter || undefined })
                .then(res => setProjects(res.data.projects))
                .catch(() => { })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [id, langFilter])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!form.title || !form.summary) return toast.error('Title and summary required')
        setCreating(true)
        try {
            const steps = form.steps.split('\n').map(s => s.trim()).filter(Boolean)
            const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
            await communityAPI.create({ ...form, steps, tags })
            toast.success('Project created! Publish it when ready.')
            setShowCreate(false)
            setForm({ title: '', summary: '', steps: '', language_tag: 'en', tags: '' })
            communityAPI.getProjects().then(res => setProjects(res.data.projects))
        } catch {
            toast.error('Failed to create project')
        } finally {
            setCreating(false)
        }
    }

    if (id) return (
        <div className="page"><div className="container" style={{ padding: '2rem 1.5rem' }}>
            <ProjectDetail id={id} />
        </div></div>
    )

    return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                            <Users size={24} color="#8b5cf6" style={{ display: 'inline', marginRight: 8 }} />
                            Community Knowledge
                        </h1>
                        <p>Learn from projects built by students in your region</p>
                    </div>
                    {isAuthenticated && (
                        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                            <Plus size={16} /> Share Project
                        </button>
                    )}
                </div>

                {/* Create Form */}
                {showCreate && (
                    <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Share Your Project</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Project Title *</label>
                                <input className="form-input" placeholder="e.g. Inventory App for Kirana Store"
                                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Summary *</label>
                                <textarea className="form-textarea" rows={3} placeholder="What did you build? What problem does it solve?"
                                    value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Steps (one per line)</label>
                                <textarea className="form-textarea" rows={4} placeholder={"Step 1: Set up the project\nStep 2: Build the UI\nStep 3: Connect to database"}
                                    value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))} />
                            </div>
                            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Language</label>
                                    <select className="form-select" value={form.language_tag} onChange={e => setForm(f => ({ ...f, language_tag: e.target.value }))}>
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Tags (comma-separated)</label>
                                    <input className="form-input" placeholder="e.g. React, Firebase, Mobile"
                                        value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? <Loader size={16} /> : <Plus size={16} />} Create Project
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Language Filter */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setLangFilter('')} style={{
                        padding: '0.35rem 0.85rem', borderRadius: '999px', border: '1px solid var(--border)',
                        background: !langFilter ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-elevated)',
                        color: !langFilter ? 'white' : 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                    }}>All Languages</button>
                    {LANGUAGES.map(l => (
                        <button key={l.code} onClick={() => setLangFilter(l.code)} style={{
                            padding: '0.35rem 0.85rem', borderRadius: '999px', border: '1px solid var(--border)',
                            background: langFilter === l.code ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-elevated)',
                            color: langFilter === l.code ? 'white' : 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                        }}>{l.label}</button>
                    ))}
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : projects.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <BookOpen size={60} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No Projects Yet</h3>
                        <p style={{ marginBottom: '1.5rem' }}>Be the first to share a project with the community!</p>
                        {isAuthenticated && (
                            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Share Your Project</button>
                        )}
                    </div>
                ) : (
                    <div className="grid-auto">
                        {projects.map(p => (
                            <Link to={`/community/${p.id}`} key={p.id} className="card" style={{ textDecoration: 'none' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                    {p.language_tag && <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}><Globe size={10} /> {p.language_tag}</span>}
                                    {(p.tags || []).slice(0, 2).map(t => (
                                        <span key={t} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{t}</span>
                                    ))}
                                </div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{p.title}</h3>
                                <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {p.summary}
                                </p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>By {p.author_name}</span>
                                    <span>📍 {p.author_district}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
