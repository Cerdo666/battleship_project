import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function NavBar() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch (err) {
      console.error('Logout falló', err)
    }
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          ⚓ Trobar la Flota
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/ranking">
                📊 Ranking
              </Link>
            </li>
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    👤 Mi Perfil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/game">
                    🎮 Jugar
                  </Link>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link btn btn-link text-danger" 
                    onClick={handleLogout}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    🔑 Iniciar Sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    📝 Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}