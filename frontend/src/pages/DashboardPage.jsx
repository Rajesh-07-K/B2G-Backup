import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usersAPI } from '../services/api'
import { Map, BookOpen, Zap, Briefcase, TrendingUp, Clock, CheckCircle, ArrowRight, Award } from 'lucide-react'

export default function DashboardPage() {
    const { user } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        usersAPI.getDashboard()
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="page loading-center">
            <div className="spinner" />
            <p>Loading your dashboard...</p>
        </div>
    )

    const roadmap = data?.active_roadmap
    const quizzes = data?.recent_quizzes || []
    const skillStats = data?.skill_stats || []
    const localOpps = data?.local_opportunities || []
    const totalSkills = skillStats.reduce((sum, s) => sum + parseInt(s.count), 0)

    return (
        <div className="page">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>

                {/* ── Welcome Header ─────────────────────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px',
                    padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                        background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent)',
                        borderRadius: '50%', filter: 'blur(30px)'
                    }} />
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            🌅 Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
                        </div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                            {user?.district ? `📍 ${user.district}, ${user.state || ''}` : 'Complete your profile to get personalized opportunities'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Link to="/skills" className="btn btn-primary btn-sm">
                                <Zap size={14} /> Manage Skills
                            </Link>
                            <Link to="/roadmap" className="btn btn-secondary btn-sm">
                                <Map size={14} /> My Roadmap
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Quick Stats ────────────────────────────────────────────────── */}
                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    {[
                        { icon: Zap, label: 'Total Skills', value: totalSkills, color: '#6366f1', link: '/skills' },
                        { icon: Map, label: 'Active Roadmap', value: roadmap ? '1 Active' : 'None', color: '#06b6d4', link: '/roadmap' },
                        { icon: BookOpen, label: 'Quizzes Taken', value: quizzes.length, color: '#10b981', link: '/quiz' },
                        { icon: Award, label: 'Readiness', value: roadmap ? `${roadmap.readiness_percentage}%` : 'N/A', color: '#f59e0b', link: '/skills' },
                    ].map(({ icon: Icon, label, value, color, link }) => (
                        <Link to={link} key={label} className="stat-card" style={{ textDecoration: 'none', display: 'block' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '12px', margin: '0 auto 0.75rem',
                                background: `${color}20`, border: `1px solid ${color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Icon size={20} color={color} />
                            </div>
                            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{value}</div>
                            <div className="stat-label">{label}</div>
                        </Link>
                    ))}
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                    {/* ── Active Roadmap ─────────────────────────────────────────── */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Map size={18} color="var(--primary-light)" /> Active Roadmap
                            </h3>
                            <Link to="/roadmap" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                                View All <ArrowRight size={12} style={{ display: 'inline' }} />
                            </Link>
                        </div>

                        {roadmap ? (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600 }}>{roadmap.target_role}</span>
                                        <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{roadmap.readiness_percentage}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${roadmap.readiness_percentage}%` }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {(roadmap.missing_skills || []).slice(0, 4).map(skill => (
                                        <span key={skill} className="skill-tag missing" style={{ fontSize: '0.75rem' }}>{skill}</span>
                                    ))}
                                    {(roadmap.missing_skills || []).length > 4 && (
                                        <span className="badge badge-warning">+{roadmap.missing_skills.length - 4} more</span>
                                    )}
                                </div>
                                <Link to={`/roadmap/${roadmap.id}`} className="btn btn-outline btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
                                    View Full Plan <ArrowRight size={14} />
                                </Link>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <Map size={40} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>No active roadmap yet</p>
                                <Link to="/skills" className="btn btn-primary btn-sm">
                                    Start Skill Analysis <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ── Recent Quizzes ─────────────────────────────────────────── */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={18} color="#10b981" /> Recent Quizzes
                            </h3>
                            <Link to="/quiz" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                                Take Quiz <ArrowRight size={12} style={{ display: 'inline' }} />
                            </Link>
                        </div>

                        {quizzes.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {quizzes.map((q, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-elevated)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{q.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                                <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                                                {new Date(q.completed_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontWeight: 700, fontSize: '1rem',
                                            color: (q.score / q.total_questions) >= 0.7 ? '#34d399' : '#f87171'
                                        }}>
                                            {q.score}/{q.total_questions}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <BookOpen size={40} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>No quizzes taken yet</p>
                                <Link to="/quiz" className="btn btn-primary btn-sm">Take a Quiz</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Local Opportunities ────────────────────────────────────────── */}
                {localOpps.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={18} color="#f59e0b" />
                                Local Opportunities in {user?.district}
                            </h3>
                            <Link to="/opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                                View All <ArrowRight size={12} style={{ display: 'inline' }} />
                            </Link>
                        </div>
                        <div className="grid-3">
                            {localOpps.map(opp => (
                                <Link to={`/opportunities/${opp.id}`} key={opp.id} className="opp-card" style={{ textDecoration: 'none' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {opp.category}
                                    </div>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{opp.title}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {opp.location_district}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Quick Actions ──────────────────────────────────────────────── */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Quick Actions</h3>
                    <div className="grid-4">
                        {[
                            { icon: Zap, label: 'Add Skills', desc: 'Update your skill list', link: '/skills', color: '#6366f1' },
                            { icon: Map, label: 'Generate Roadmap', desc: 'AI-powered learning plan', link: '/roadmap/generate', color: '#06b6d4' },
                            { icon: BookOpen, label: 'Take Quiz', desc: 'Test your knowledge', link: '/quiz', color: '#10b981' },
                            { icon: Briefcase, label: 'Find Opportunities', desc: 'Local tech needs', link: '/opportunities', color: '#f59e0b' },
                        ].map(({ icon: Icon, label, desc, link, color }) => (
                            <Link to={link} key={label} className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.25rem' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '12px', margin: '0 auto 0.75rem',
                                    background: `${color}20`, border: `1px solid ${color}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={20} color={color} />
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
