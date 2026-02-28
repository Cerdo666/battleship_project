import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  // URL completa al backend
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Interceptor para el token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('Petición a:', config.url) // Para debug
  return config
})

// Interceptor para errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Error API:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api