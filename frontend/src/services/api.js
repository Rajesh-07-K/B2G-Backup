import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
})

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('b2g_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// ─── Response Interceptor: Handle Auth Errors ─────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('b2g_token')
            localStorage.removeItem('b2g_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export const skillsAPI = {
    getRoles: () => api.get('/skills/roles'),
    getMySkills: () => api.get('/skills/my-skills'),
    addSkills: (skills) => api.post('/skills/add', { skills }),
    extractFromResume: (formData) => api.post('/skills/extract-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    gapAnalysis: (role_id) => api.post('/skills/gap-analysis', { role_id }),
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────
export const roadmapAPI = {
    generate: (data) => api.post('/roadmap/generate', data),
    getMyRoadmaps: () => api.get('/roadmap/my-roadmaps'),
    getById: (id) => api.get(`/roadmap/${id}`),
    updateStatus: (id, status) => api.patch(`/roadmap/${id}/status`, { status }),
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export const quizAPI = {
    list: (params) => api.get('/quiz/list', { params }),
    getById: (id) => api.get(`/quiz/${id}`),
    submit: (data) => api.post('/quiz/submit', data),
    syncOffline: (results) => api.post('/quiz/sync', { offline_results: results }),
    myResults: () => api.get('/quiz/user/my-results'),
}

// ─── Opportunities ────────────────────────────────────────────────────────────
export const opportunitiesAPI = {
    list: (params) => api.get('/opportunities', { params }),
    getById: (id) => api.get(`/opportunities/${id}`),
    create: (data) => api.post('/opportunities', data),
    apply: (id, proposal) => api.post(`/opportunities/${id}/apply`, { proposal }),
    getApplications: (id) => api.get(`/opportunities/${id}/applications`),
}

// ─── Community ────────────────────────────────────────────────────────────────
export const communityAPI = {
    getProjects: (params) => api.get('/community/projects', { params }),
    getById: (id) => api.get(`/community/projects/${id}`),
    create: (data) => api.post('/community/projects', data),
    publish: (id) => api.post(`/community/projects/${id}/publish`),
    myProjects: () => api.get('/community/my-projects'),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.patch('/users/profile', data),
    getDashboard: () => api.get('/users/dashboard'),
}

export default api
