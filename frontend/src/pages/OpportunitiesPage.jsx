import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { opportunitiesAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Briefcase, MapPin, Tag, Users, Plus, Send, Filter, ChevronRight, Loader } from 'lucide-react'

const CATEGORY_ICONS = {
    agriculture: '🌾', shop: '🏪', school: '🏫', health: '🏥',
    transport: '🚗', default: '💼'
}

const CATEGORY_COLORS = {
    agriculture: '#10b981', shop: '#f59e0b', school: '#6366f1',
    health: '#ef4444', transport: '#06b6d4', default: '#8b5cf6'
}

function OpportunityDetail({ id }) {
    const { user } = useAuth()
    const [opp, setOpp] = useState(null)
    const [loading, setLoading] = useState(true)
    const [proposal, setProposal] = useState('')
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)

    useEffect(() => {
        opportunitiesAPI.getById(id)
            .then(res => setOpp(res.data))
            .catch(() => toast.error('Failed to load opportunity'))
            .finally(() => setLoading(false))
    }, [id])

    const handleApply = async () => {
        if (!proposal.trim()) return toast.error('Write a brief proposal')
        setApplying(true)
        try {
            await opportunitiesAPI.apply(id, proposal)
            toast.success('Application submitted! 🎉')
            setApplied(true)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to apply')
        } finally {
            setApplying(false)
        }
    }

    if (loading) return <div className="loading-center"><div className="spinner" /></div>
    if (!opp) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Not found</div>

    const opportunity = opp.opportunity
    const color = CATEGORY_COLORS[opportunity.category] || CATEGORY_COLORS.default
    const icon = CATEGORY_ICONS[opportunity.category] || CATEGORY_ICONS.default

    return (
        <div style={{ maxWidth: '800px' }}>
            <Link to="/opportunities" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem' }}>
                ← Back to Opportunities
            </Link>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '16px', flexShrink: 0,
                        background: `${color}20`, border: `1px solid ${color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                    }}>{icon}</div>
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="badge" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                                {opportunity.category}
                            </span>
                            <span className={`badge badge-${opportunity.status === 'open' ? 'success' : 'warning'}`}>
                                {opportunity.status}
                            </span>
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{opportunity.title}</h2>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span><MapPin size={13} style={{ display: 'inline', marginRight: 3 }} />{opportunity.location_district}, {opportunity.location_state}</span>
                            <span><Users size={13} style={{ display: 'inline', marginRight: 3 }} />{opp.applications_count} applicants</span>
                            {opportunity.posted_by_name && <span>Posted by {opportunity.posted_by_name}</span>}
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>About this Opportunity</h3>
                    <p style={{ lineHeight: 1.7 }}>{opportunity.description}</p>
                </div>

                {opportunity.required_skills?.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                            <Tag size={15} style={{ display: 'inline', marginRight: 5 }} />
                            Required Skills
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {opportunity.required_skills.map(s => (
                                <span key={s} className="skill-tag">{s}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Apply Section */}
            {user && opportunity.status === 'open' && (
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                        <Send size={16} style={{ display: 'inline', marginRight: 6 }} color="var(--primary-light)" />
                        Apply for this Opportunity
                    </h3>
                    {applied ? (
                        <div style={{
                            padding: '1.25rem', borderRadius: '12px', textAlign: 'center',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399'
                        }}>
                            ✅ Application submitted successfully!
                        </div>
                    ) : (
                        <>
                            <textarea className="form-textarea" placeholder="Describe how you can help with this project. Mention your relevant skills and approach..."
                                value={proposal} onChange={e => setProposal(e.target.value)} rows={5} style={{ marginBottom: '1rem' }} />
                            <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                                {applying ? <><Loader size={16} /> Submitting...</> : <>Submit Application <Send size={14} /></>}
                            </button>
                        </>
                    )}
                </div>
            )}

            {!user && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ marginBottom: '1rem' }}>Login to apply for this opportunity</p>
                    <Link to="/login" className="btn btn-primary">Login / Register</Link>
                </div>
            )}
        </div>
    )
}

export default function OpportunitiesPage() {
    const { id } = useParams()
    const { user, isAuthenticated } = useAuth()
    const [opportunities, setOpportunities] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ category: '', district: '' })
    const [showCreate, setShowCreate] = useState(false)
    const [createForm, setCreateForm] = useState({
        title: '', description: '', category: 'shop',
        location_district: '', location_state: '', required_skills: ''
    })
    const [creating, setCreating] = useState(false)

    const loadOpportunities = () => {
        setLoading(true)
        opportunitiesAPI.list({ category: filters.category || undefined, district: filters.district || undefined })
            .then(res => setOpportunities(res.data.opportunities))
            .catch(() => toast.error('Failed to load opportunities'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadOpportunities() }, [filters])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!createForm.title || !createForm.description || !createForm.location_district) {
            return toast.error('Fill all required fields')
        }
        setCreating(true)
        try {
            await opportunitiesAPI.create({
                ...createForm,
                required_skills: createForm.required_skills.split(',').map(s => s.trim()).filter(Boolean)
            })
            toast.success('Opportunity posted! 🎉')
            setShowCreate(false)
            loadOpportunities()
        } catch {
            toast.error('Failed to post opportunity')
        } finally {
            setCreating(false)
        }
    }

    if (id) return (
        <div className="page"><div className="container" style={{ padding: '2rem 1.5rem' }}>
            <OpportunityDetail id={id} />
        </div></div>
    )

    return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                            <Briefcase size={24} color="#f59e0b" style={{ display: 'inline', marginRight: 8 }} />
                            Local Opportunities
                        </h1>
                        <p>Real tech needs from your community — apply and make an impact</p>
                    </div>
                    {isAuthenticated && (
                        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                            <Plus size={16} /> Post Opportunity
                        </button>
                    )}
                </div>

                {/* Create Form */}
                {showCreate && (
                    <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Post a New Opportunity</h3>
                        <form onSubmit={handleCreate}>
                            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Title *</label>
                                    <input className="form-input" placeholder="e.g. Build inventory app for local shop"
                                        value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Category *</label>
                                    <select className="form-select" value={createForm.category} onChange={e => setCreateForm(f => ({ ...f, category: e.target.value }))}>
                                        {['shop', 'school', 'agriculture', 'health', 'transport', 'other'].map(c => (
                                            <option key={c} value={c}>{CATEGORY_ICONS[c] || '💼'} {c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea className="form-textarea" rows={3} placeholder="Describe the tech need in detail..."
                                    value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">District *</label>
                                    <input className="form-input" placeholder="e.g. Nashik"
                                        value={createForm.location_district} onChange={e => setCreateForm(f => ({ ...f, location_district: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">State</label>
                                    <input className="form-input" placeholder="e.g. Maharashtra"
                                        value={createForm.location_state} onChange={e => setCreateForm(f => ({ ...f, location_state: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Required Skills (comma-separated)</label>
                                <input className="form-input" placeholder="e.g. React, Python, SQL"
                                    value={createForm.required_skills} onChange={e => setCreateForm(f => ({ ...f, required_skills: e.target.value }))} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? <Loader size={16} /> : <Plus size={16} />} Post Opportunity
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Filter size={16} color="var(--text-muted)" />
                    {['', 'agriculture', 'shop', 'school', 'health'].map(cat => (
                        <button key={cat} onClick={() => setFilters(f => ({ ...f, category: cat }))} style={{
                            padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid var(--border)',
                            background: filters.category === cat ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-elevated)',
                            color: filters.category === cat ? 'white' : 'var(--text-secondary)',
                            fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.2s'
                        }}>
                            {cat ? `${CATEGORY_ICONS[cat]} ${cat}` : 'All'}
                        </button>
                    ))}
                    <input className="form-input" placeholder="Filter by district..." style={{ maxWidth: '200px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                        value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))} />
                </div>

                {/* Opportunities Grid */}
                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : opportunities.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <Briefcase size={60} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No Opportunities Found</h3>
                        <p>Be the first to post a local tech need!</p>
                    </div>
                ) : (
                    <div className="grid-auto">
                        {opportunities.map(opp => {
                            const color = CATEGORY_COLORS[opp.category] || CATEGORY_COLORS.default
                            const icon = CATEGORY_ICONS[opp.category] || CATEGORY_ICONS.default
                            return (
                                <Link to={`/opportunities/${opp.id}`} key={opp.id} className="opp-card" style={{ textDecoration: 'none' }}>
                                    <div className="opp-category-icon" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                                        {icon}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        <span className="badge" style={{ background: `${color}20`, color, border: `1px solid ${color}40`, fontSize: '0.7rem' }}>
                                            {opp.category}
                                        </span>
                                        <span className={`badge badge-${opp.status === 'open' ? 'success' : 'warning'}`} style={{ fontSize: '0.7rem' }}>
                                            {opp.status}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{opp.title}</h3>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                        <MapPin size={12} style={{ display: 'inline', marginRight: 3 }} />
                                        {opp.location_district}, {opp.location_state}
                                    </div>
                                    {opp.required_skills?.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                            {opp.required_skills.slice(0, 3).map(s => (
                                                <span key={s} className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{s}</span>
                                            ))}
                                            {opp.required_skills.length > 3 && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{opp.required_skills.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
