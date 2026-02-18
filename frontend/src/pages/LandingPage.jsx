import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Zap, Map, BookOpen, Briefcase, Users, ArrowRight, Star, Wifi, Globe, ChevronRight } from 'lucide-react'

const FEATURES = [
    { icon: Zap, title: 'AI Skill Analysis', desc: 'Upload resume or add skills manually. AI categorizes them instantly.', color: '#6366f1' },
    { icon: Map, title: 'Smart Roadmaps', desc: 'Week-by-week learning plans tailored to your target role.', color: '#06b6d4' },
    { icon: BookOpen, title: 'Offline Quizzes', desc: 'Practice quizzes that work without internet. Results sync later.', color: '#10b981' },
    { icon: Briefcase, title: 'Local Opportunities', desc: 'Real tech needs in your district — shops, schools, farms.', color: '#f59e0b' },
    { icon: Users, title: 'Community Projects', desc: 'Learn from and share projects built by students near you.', color: '#8b5cf6' },
    { icon: Globe, title: 'Regional Languages', desc: 'Hindi, Marathi, Tamil, Telugu, Kannada and more.', color: '#ec4899' },
]

const STATS = [
    { value: '8+', label: 'Career Roles' },
    { value: '50+', label: 'Skill Categories' },
    { value: '100%', label: 'Offline Capable' },
    { value: '8+', label: 'Languages' },
]

export default function LandingPage() {
    const { isAuthenticated } = useAuth()

    return (
        <div style={{ paddingTop: 0 }}>
            {/* ── Hero ─────────────────────────────────────────────────────────────── */}
            <section className="hero" style={{ minHeight: '100vh', paddingTop: '70px' }}>
                <div className="hero-grid" />
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />

                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '4rem 1.5rem' }}>
                    <div className="section-tag" style={{ margin: '0 auto 1.5rem' }}>
                        <Star size={12} /> AI Career Platform for Rural India
                    </div>

                    <h1 style={{ marginBottom: '1.25rem', maxWidth: '750px', margin: '0 auto 1.25rem' }}>
                        Bridge the Gap Between{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                        }}>
                            Skills & Success
                        </span>
                    </h1>

                    <p style={{ fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto 2.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        AI-powered skill gap analysis, personalized roadmaps, and local opportunities — in your language.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg">
                                Go to Dashboard <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-primary btn-lg animate-pulse-glow">
                                    Start Your Journey <ArrowRight size={18} />
                                </Link>
                                <Link to="/opportunities" className="btn btn-secondary btn-lg">
                                    Browse Opportunities
                                </Link>
                            </>
                        )}
                    </div>

                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        marginTop: '2rem', padding: '0.45rem 1.1rem', borderRadius: '999px',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                        color: '#34d399', fontSize: '0.82rem', fontWeight: 500
                    }}>
                        <Wifi size={13} /> Works offline — no internet needed for quizzes & roadmaps
                    </div>
                </div>
            </section>

            {/* ── Stats ──────────────────────────────────────────────────────────────── */}
            <section style={{ padding: '2.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <div className="container">
                    <div className="stats-grid">
                        {STATS.map(({ value, label }) => (
                            <div key={label} className="stat-card">
                                <div className="stat-value">{value}</div>
                                <div className="stat-label">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ───────────────────────────────────────────────────────────── */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Everything You Need to Grow</h2>
                    </div>
                    <div className="grid-3">
                        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="card" style={{ cursor: 'default' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '12px', marginBottom: '1rem',
                                    background: `${color}20`, border: `1px solid ${color}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={22} color={color} />
                                </div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{title}</h3>
                                <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────────────────────────── */}
            <section className="section" style={{ background: 'var(--bg-surface)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                        border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px',
                        padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: -80, right: -80, width: 280, height: 280,
                            background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)',
                            borderRadius: '50%', filter: 'blur(40px)'
                        }} />
                        <h2 style={{ marginBottom: '0.75rem' }}>Ready to Start?</h2>
                        <p style={{ maxWidth: '380px', margin: '0 auto 2rem', fontSize: '1rem' }}>
                            Join rural youth building real tech careers with B2G.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Get Started Free <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 0', textAlign: 'center' }}>
                <div className="container">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        © 2026 B2G – Bridge to Growth · Built for Rural India 🇮🇳
                    </p>
                </div>
            </footer>
        </div>
    )
}
