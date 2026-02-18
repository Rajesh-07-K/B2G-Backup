import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('b2g_token')
        const savedUser = localStorage.getItem('b2g_user')
        if (token && savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = (token, userData) => {
        localStorage.setItem('b2g_token', token)
        localStorage.setItem('b2g_user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('b2g_token')
        localStorage.removeItem('b2g_user')
        setUser(null)
    }

    const updateUser = (updates) => {
        const updated = { ...user, ...updates }
        localStorage.setItem('b2g_user', JSON.stringify(updated))
        setUser(updated)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
