import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // gracias al proxy de Vite
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Interceptor: añade token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Manejo de errores global (ej: 401 → logout)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api