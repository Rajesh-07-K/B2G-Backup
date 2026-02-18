import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Phone, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader } from 'lucide-react'

const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' }, { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' }, { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'gu', label: 'ગુજરાતી' }, { code: 'bn', label: 'বাংলা' },
]

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [mode, setMode] = useState('login') // 'login' | 'register' | 'otp'
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '', otp: '', preferred_language: 'en'
    })

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

    // ── OTP Flow ─────────────────────────────────────────────────────────────────
    const handleSendOTP = async () => {
        if (!form.phone) return toast.error('Enter your phone number')
        setLoading(true)
        try {
            const res = await authAPI.sendOTP(form.phone)
            toast.success('OTP sent!')
            if (res.data.otp) toast(`Dev OTP: ${res.data.otp}`, { icon: '🔑', duration: 10000 })
            setStep(2)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send OTP')
        } finally { setLoading(false) }
    }

    const handleVerifyOTP = async () => {
        if (!form.otp) return toast.error('Enter the OTP')
        setLoading(true)
        try {
            const res = await authAPI.verifyOTP({
                phone: form.phone, otp: form.otp,
                name: form.name, preferred_language: form.preferred_language
            })
            login(res.data.token, res.data.user)
            toast.success(`Welcome, ${res.data.user.name}! 🎉`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid OTP')
        } finally { setLoading(false) }
    }

    // ── Email Login ──────────────────────────────────────────────────────────────
    const handleEmailLogin = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) return toast.error('Fill all fields')
        setLoading(true)
        try {
            const res = await authAPI.login({ email: form.email, password: form.password })
            login(res.data.token, res.data.user)
            toast.success(`Welcome back, ${res.data.user.name}! 👋`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed')
        } finally { setLoading(false) }
    }

    // ── Register ─────────────────────────────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields')
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
        setLoading(true)
        try {
            const res = await authAPI.register({
                name: form.name, email: form.email, password: form.password,
                preferred_language: form.preferred_language
            })
            login(res.data.token, res.data.user)
            toast.success(`Welcome to B2G, ${res.data.user.name}! 🚀`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed')
        } finally { setLoading(false) }
    }

    const iconStyle = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '5rem 1rem 2rem', position: 'relative', overflow: 'hidden'
        }}>
            {/* Background orbs */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.15) 0%, transparent 60%)'
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '16px', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem', boxShadow: '0 0 30px rgba(99,102,241,0.5)'
                    }}>🚀</div>
                    <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>
                        {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join B2G' : 'Phone Login'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {mode === 'login' ? 'Sign in to continue' : mode === 'register' ? 'Create your free account' : 'Login with your phone number'}
                    </p>
                </div>

                {/* Mode Tabs */}
                <div style={{
                    display: 'flex', background: 'var(--bg-card)', borderRadius: '12px',
                    padding: '4px', marginBottom: '1.5rem', border: '1px solid var(--border)'
                }}>
                    {[['login', 'Email Login'], ['otp', 'Phone OTP'], ['register', 'Register']].map(([m, label]) => (
                        <button key={m} onClick={() => { setMode(m); setStep(1) }} style={{
                            flex: 1, padding: '0.55rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            background: mode === m ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                            color: mode === m ? 'white' : 'var(--text-muted)',
                            fontWeight: mode === m ? 600 : 400, fontSize: '0.78rem',
                            transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
                        }}>{label}</button>
                    ))}
                </div>

                {/* Card */}
                <div className="card" style={{ padding: '2rem' }}>

                    {/* ── OTP Mode ── */}
                    {mode === 'otp' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {step === 1 ? (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Your Name (optional)</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={15} style={iconStyle} />
                                            <input className="form-input" style={{ paddingLeft: '2.5rem' }}
                                                placeholder="Full name" value={form.name} onChange={set('name')} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={15} style={iconStyle} />
                                            <input className="form-input" style={{ paddingLeft: '2.5rem' }}
                                                placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Preferred Language</label>
                                        <select className="form-select" value={form.preferred_language} onChange={set('preferred_language')}>
                                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <button className="btn btn-primary btn-full" onClick={handleSendOTP} disabled={loading}>
                                        {loading ? <><Loader size={16} className="spin" /> Sending...</> : <>Send OTP <ArrowRight size={16} /></>}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{
                                        padding: '0.85rem', borderRadius: '10px',
                                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                                        color: '#34d399', fontSize: '0.875rem', textAlign: 'center'
                                    }}>
                                        ✅ OTP sent to {form.phone}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Enter OTP</label>
                                        <input className="form-input" placeholder="6-digit OTP" maxLength={6}
                                            value={form.otp} onChange={set('otp')}
                                            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 }} />
                                    </div>
                                    <button className="btn btn-primary btn-full" onClick={handleVerifyOTP} disabled={loading}>
                                        {loading ? <><Loader size={16} /> Verifying...</> : <>Verify & Login <ArrowRight size={16} /></>}
                                    </button>
                                    <button className="btn btn-secondary btn-full" onClick={() => setStep(1)}>
                                        ← Change Number
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Email Login Mode ── */}
                    {mode === 'login' && (
                        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} style={iconStyle} />
                                    <input className="form-input" style={{ paddingLeft: '2.5rem' }} type="email"
                                        placeholder="you@example.com" value={form.email} onChange={set('email')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} style={iconStyle} />
                                    <input className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                        type={showPass ? 'text' : 'password'} placeholder="••••••••"
                                        value={form.password} onChange={set('password')} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                    }}>
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? <><Loader size={16} /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                No account?{' '}
                                <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
                                    Register here
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ── Register Mode ── */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={15} style={iconStyle} />
                                    <input className="form-input" style={{ paddingLeft: '2.5rem' }}
                                        placeholder="Your full name" value={form.name} onChange={set('name')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} style={iconStyle} />
                                    <input className="form-input" style={{ paddingLeft: '2.5rem' }} type="email"
                                        placeholder="you@example.com" value={form.email} onChange={set('email')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} style={iconStyle} />
                                    <input className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                        type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
                                        value={form.password} onChange={set('password')} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                    }}>
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Preferred Language</label>
                                <select className="form-select" value={form.preferred_language} onChange={set('preferred_language')}>
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? <><Loader size={16} /> Creating Account...</> : <>Create Account <ArrowRight size={16} /></>}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Already have an account?{' '}
                                <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
                                    Sign in
                                </button>
                            </p>
                        </form>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    By continuing, you agree to our <Link to="/" style={{ color: 'var(--primary-light)' }}>Terms of Service</Link>
                </p>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
        </div>
    )
}
