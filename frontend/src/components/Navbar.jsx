import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import {
    Home, BookOpen, Map, Zap, Users, Briefcase,
    LogOut, User, Wifi, WifiOff, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/skills', label: 'Skills', icon: Zap },
    { path: '/roadmap', label: 'Roadmap', icon: Map },
    { path: '/quiz', label: 'Quiz', icon: BookOpen },
    { path: '/opportunities', label: 'Opportunities', icon: Briefcase },
    { path: '/community', label: 'Community', icon: Users },
]

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth()
    const isOnline = useOnlineStatus()
    const location = useLocation()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <div className="navbar-logo-icon">🚀</div>
                        B2G
                    </Link>

                    {/* Desktop Nav */}
                    {isAuthenticated && (
                        <ul className="navbar-nav" style={{ display: 'flex' }}>
                            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                                <li key={path}>
                                    <Link
                                        to={path}
                                        className={location.pathname.startsWith(path) ? 'active' : ''}
                                    >
                                        <Icon size={15} />
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Right Side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Online Status */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.35rem 0.75rem', borderRadius: '999px',
                            background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                            fontSize: '0.75rem', fontWeight: 600,
                            color: isOnline ? '#34d399' : '#fbbf24'
                        }}>
                            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isOnline ? 'Online' : 'Offline'}
                        </div>

                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.4rem 0.85rem', borderRadius: '999px',
                                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                                    fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 500
                                }}>
                                    <User size={14} />
                                    {user?.name?.split(' ')[0] || 'Profile'}
                                </Link>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                    <LogOut size={14} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={{
                                display: 'none', background: 'none', border: 'none',
                                color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem'
                            }}
                            className="mobile-menu-btn"
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            {mobileOpen && isAuthenticated && (
                <div style={{
                    position: 'fixed', top: 70, left: 0, right: 0, bottom: 0,
                    background: 'rgba(10,10,20,0.97)', backdropFilter: 'blur(20px)',
                    zIndex: 999, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                    {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '1rem 1.25rem', borderRadius: '12px',
                                background: location.pathname.startsWith(path) ? 'rgba(99,102,241,0.15)' : 'transparent',
                                border: `1px solid ${location.pathname.startsWith(path) ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                                color: location.pathname.startsWith(path) ? 'var(--primary-light)' : 'var(--text-secondary)',
                                fontSize: '1rem', fontWeight: 500, textDecoration: 'none'
                            }}
                        >
                            <Icon size={20} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .navbar-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </>
    )
}
