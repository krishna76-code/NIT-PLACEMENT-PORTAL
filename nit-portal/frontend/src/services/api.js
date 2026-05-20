import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE })

// Attach token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('nit_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nit_token')
      localStorage.removeItem('nit_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const loginUser = (data) => api.post('/api/auth/login', data)

// Drives
export const fetchDrives = (params = {}) => api.get('/api/drives', { params })
export const createDrive = (data) => api.post('/api/drives', data)
export const updateDrive = (id, data) => api.put(`/api/drives/${id}`, data)
export const deleteDrive = (id) => api.delete(`/api/drives/${id}`)

// Stats
export const fetchStats = (batch) => api.get('/api/stats', { params: { batch } })

// Student Profile
export const registerStudent = (data) => api.post('/api/auth/register-student', data)
export const getStudentProfile = () => api.get('/api/student/profile')
export const updateStudentProfile = (data) => api.put('/api/student/profile', data)

// Applications
export const applyToDrive = (driveId) => api.post(`/api/applications/${driveId}`)
export const getMyApplications = () => api.get('/api/applications/me')
export const getDriveApplicants = (driveId) => api.get(`/api/applications/drive/${driveId}`)
export const updateApplicationStatus = (appId, status) => api.put(`/api/applications/${appId}/status`, { status })
export const withdrawApplication = (appId) => api.delete(`/api/applications/${appId}`)

export default api
