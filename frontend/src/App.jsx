import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SkillsPage from './pages/SkillsPage'
import RoadmapPage from './pages/RoadmapPage'
import QuizPage from './pages/QuizPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/opportunities" element={<OpportunitiesPage />} />
                    <Route path="/opportunities/:id" element={<OpportunitiesPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/community/:id" element={<CommunityPage />} />

                    {/* Protected */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
                    <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
                    <Route path="/roadmap/:id" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
                    <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.875rem',
                        },
                        success: { iconTheme: { primary: '#34d399', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    )
}
