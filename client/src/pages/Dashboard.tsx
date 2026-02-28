import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface UserStats {
  nickname: string
  email?: string
  games_count: number
  won_games: number
  total_attempts: number
  total_puntos: number
  average_score: number
  best_score: number
  ranking_position: number | string
  first_login: string
}

interface Game {
  id: number
  status: string
  attempts: number
  score: number
  created_at: string
  won: boolean
}

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<UserStats | null>(null)
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Obtener estadísticas del usuario (nuevo endpoint)
        const statsRes = await api.get('/user/stats')
        
        // 2. Obtener historial de partidas
        const gamesRes = await api.get('/user/games')
        
        setUserInfo({
          nickname: statsRes.data.nickname,
          email: statsRes.data.email,
          games_count: statsRes.data.stats.total_games,
          won_games: statsRes.data.stats.won_games,
          total_attempts: statsRes.data.stats.total_attempts,
          total_puntos: statsRes.data.stats.total_score,
          average_score: statsRes.data.stats.average_score,
          best_score: statsRes.data.stats.best_score,
          ranking_position: statsRes.data.stats.ranking_position || 'No clasificado',
          first_login: new Date(statsRes.data.created_at).toLocaleDateString()
        })

        setRecentGames(gamesRes.data.data.slice(0, 5)) // Últimas 5 partidas

      } catch (err: any) {
        console.error('Error cargando dashboard:', err)
        setError('No se pudo cargar la información del usuario')
        if (err.response?.status === 401) {
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })

    // Validaciones básicas
    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordMessage({ type: 'danger', text: 'Las contraseñas no coinciden' })
      return
    }

    if (passwordData.password.length < 6) {
      setPasswordMessage({ type: 'danger', text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    try {
      await api.put('/user/password', passwordData)
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente' })
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: ''
      })
    } catch (err: any) {
      setPasswordMessage({ 
        type: 'danger', 
        text: err.response?.data?.message || 'Error al actualizar la contraseña'
      })
    }
  }

  if (loading) return <div className="text-center mt-5">Cargando tu perfil...</div>
  if (error) return <div className="alert alert-danger mt-5">{error}</div>
  if (!userInfo) return <div className="alert alert-warning mt-5">No se encontraron datos del usuario</div>

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0">Mi Perfil</h2>
              <span className="badge bg-light text-dark">#{userInfo.ranking_position}</span>
            </div>
            
            <div className="card-body">
              {/* Información básica */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <p><strong>Nickname:</strong> {userInfo.nickname}</p>
                  <p><strong>Email:</strong> {userInfo.email || 'No disponible'}</p>
                  <p><strong>Miembro desde:</strong> {userInfo.first_login}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Partidas jugadas:</strong> {userInfo.games_count}</p>
                  <p><strong>Partidas ganadas:</strong> {userInfo.won_games}</p>
                  <p><strong>Total intentos:</strong> {userInfo.total_attempts}</p>
                </div>
              </div>

              {/* Estadísticas destacadas */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card bg-success text-white text-center p-3">
                    <h5>Puntos totales</h5>
                    <h3>{userInfo.total_puntos}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-info text-white text-center p-3">
                    <h5>Promedio por partida</h5>
                    <h3>{userInfo.average_score}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-warning text-white text-center p-3">
                    <h5>Mejor puntuación</h5>
                    <h3>{userInfo.best_score}</h3>
                  </div>
                </div>
              </div>

              {/* Últimas partidas */}
              {recentGames.length > 0 && (
                <div className="mb-4">
                  <h5>Últimas partidas</h5>
                  <div className="table-responsive">
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Intentos</th>
                          <th>Puntuación</th>
                          <th>Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentGames.map(game => (
                          <tr key={game.id}>
                            <td>{new Date(game.created_at).toLocaleDateString()}</td>
                            <td>{game.attempts}</td>
                            <td>{game.score}</td>
                            <td>
                              {game.won ? (
                                <span className="badge bg-success">Victoria</span>
                              ) : (
                                <span className="badge bg-secondary">En curso</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <hr />

              {/* Botones de acción */}
              <div className="d-grid gap-2 mb-4">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/game')}
                >
                  🎮 Iniciar Nueva Partida
                </button>
                
                <button 
                  className="btn btn-outline-info"
                  onClick={() => navigate('/ranking')}
                >
                  📊 Ver Ranking Completo
                </button>
              </div>

              <hr />

              {/* Cambiar contraseña */}
              <h5 className="mb-3">Cambiar Contraseña</h5>
              
              {passwordMessage.text && (
                <div className={`alert alert-${passwordMessage.type} alert-dismissible fade show`}>
                  {passwordMessage.text}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setPasswordMessage({ type: '', text: '' })}
                  />
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label htmlFor="current_password" className="form-label">
                    Contraseña actual <small className="text-muted">(opcional)</small>
                  </label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="current_password"
                    value={passwordData.current_password}
                    onChange={e => setPasswordData({
                      ...passwordData,
                      current_password: e.target.value
                    })}
                  />
                  <small className="text-muted">Déjalo vacío si no quieres verificar</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password"
                    value={passwordData.password}
                    onChange={e => setPasswordData({
                      ...passwordData,
                      password: e.target.value
                    })}
                    minLength={6}
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password_confirmation" className="form-label">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password_confirmation"
                    value={passwordData.password_confirmation}
                    onChange={e => setPasswordData({
                      ...passwordData,
                      password_confirmation: e.target.value
                    })}
                    minLength={6}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-warning">
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}