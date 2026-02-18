import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usersAPI } from '../services/api'
import toast from 'react-hot-toast'
import { User, MapPin, Globe, GraduationCap, Phone, Mail, Save, Loader, Edit3 } from 'lucide-react'

const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' }, { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' }, { code: 'kn', label: 'Kannada' },
    { code: 'gu', label: 'Gujarati' }, { code: 'bn', label: 'Bengali' },
]

const EDUCATION_LEVELS = [
    '10th Pass', '12th Pass', 'Diploma', 'Graduate (B.Tech/B.Sc/BA/B.Com)',
    'Post Graduate', 'Dropout', 'Self-Taught'
]

export default function ProfilePage() {
    const { user, updateUser } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({})

    useEffect(() => {
        usersAPI.getProfile()
            .then(res => {
                setProfile(res.data.user)
                setForm({
                    name: res.data.user.name || '',
                    district: res.data.user.district || '',
                    state: res.data.user.state || '',
                    preferred_language: res.data.user.preferred_language || 'en',
                    education_level: res.data.user.education_level || '',
                })
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await usersAPI.updateProfile(form)
            setProfile(res.data.user)
            updateUser(res.data.user)
            setEditing(false)
            toast.success('Profile updated!')
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="page loading-center">
            <div className="spinner" />
        </div>
    )

    const skills = profile?.skills || []
    const roadmaps = profile?.roadmaps || []
    const stats = profile?.stats || {}

    return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
                {/* Profile Header */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(99,102,241,0.25)', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                        background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)',
                        borderRadius: '50%', filter: 'blur(30px)'
                    }} />
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
                        {/* Avatar */}
                        <div style={{
                            width: 80, height: 80, borderRadius: '20px', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 800, color: 'white',
                            boxShadow: '0 0 30px rgba(99,102,241,0.4)'
                        }}>
                            {(profile?.name || 'U')[0].toUpperCase()}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{profile?.name}</h1>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                {profile?.email && <span><Mail size={13} style={{ display: 'inline', marginRight: 3 }} />{profile.email}</span>}
                                {profile?.phone && <span><Phone size={13} style={{ display: 'inline', marginRight: 3 }} />{profile.phone}</span>}
                                {profile?.district && <span><MapPin size={13} style={{ display: 'inline', marginRight: 3 }} />{profile.district}, {profile.state}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {profile?.education_level && (
                                    <span className="badge badge-primary">
                                        <GraduationCap size={11} /> {profile.education_level}
                                    </span>
                                )}
                                {profile?.preferred_language && (
                                    <span className="badge badge-cyan">
                                        <Globe size={11} /> {LANGUAGES.find(l => l.code === profile.preferred_language)?.label || profile.preferred_language}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(!editing)}>
                            <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                {editing && (
                    <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Edit Profile</h3>
                        <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Education Level</label>
                                <select className="form-select" value={form.education_level} onChange={e => setForm(f => ({ ...f, education_level: e.target.value }))}>
                                    <option value="">Select...</option>
                                    {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">District</label>
                                <input className="form-input" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">State</label>
                                <input className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Preferred Language</label>
                                <select className="form-select" value={form.preferred_language} onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <><Loader size={16} /> Saving...</> : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                )}

                {/* Stats Row */}
                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Skills', value: skills.length },
                        { label: 'Roadmaps', value: roadmaps.length },
                        { label: 'Quizzes', value: stats.total_quizzes || 0 },
                        { label: 'Avg Score', value: stats.avg_score ? `${Math.round(stats.avg_score)}%` : 'N/A' },
                    ].map(({ label, value }) => (
                        <div key={label} className="stat-card">
                            <div className="stat-value">{value}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                    {/* Skills */}
                    <div className="card">
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                            <User size={16} style={{ display: 'inline', marginRight: 6 }} color="var(--primary-light)" />
                            My Skills ({skills.length})
                        </h3>
                        {skills.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No skills added yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {skills.map(s => (
                                    <span key={s.id} className="skill-tag" style={{ fontSize: '0.8rem' }}>
                                        {s.skill_name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Roadmaps */}
                    <div className="card">
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                            My Roadmaps ({roadmaps.length})
                        </h3>
                        {roadmaps.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No roadmaps generated yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {roadmaps.map(r => (
                                    <div key={r.id} style={{
                                        padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-elevated)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.target_role}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.status}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{r.readiness_percentage}%</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
