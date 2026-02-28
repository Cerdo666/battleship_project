import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // AÑADIDO para debug
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('1. Enviando login...', { nickname, password }) // DEBUG
    
    setLoading(true)
    setError('')
    
    try {
      const res = await api.post('/login', { nickname, password })
      console.log('2. Respuesta:', res.data) // DEBUG
      
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('3. Error completo:', err) // DEBUG
      console.error('4. Respuesta error:', err.response?.data) // DEBUG
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Iniciar Sesión</h2>
          
          {/* Mostrar errores */}
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nickname</label>
              <input
                type="text"
                className="form-control"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Entrar'}
            </button>
          </form>
          
          <p className="text-center mt-3">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}