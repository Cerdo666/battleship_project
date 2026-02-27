import { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Game() {
  const [gameId, setGameId] = useState<number | null>(null)
  const [revealedCells, setRevealedCells] = useState<any[]>([])
  const [attempts, setAttempts] = useState(0)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()


  
  // Crear partida al cargar la página (solo una vez)
  useEffect(() => {
    const initGame = async () => {
      try {
        // Crear nueva partida
        const res = await api.post('/games')
        const newGameId = res.data.game_id
        setGameId(newGameId)
        setLoading(false)
      } catch (err) {
        console.error('Error creando partida', err)
        // Si falla (ej: no auth), redirige a login
        navigate('/login')
      }
    }

    initGame()
  }, [navigate])

  const handleShot = async (row: number, col: number) => {
    if (!gameId || won || loading) return

    try {
      const res = await api.post(`/games/${gameId}/shots`, { row, col })
      const data = res.data

      setRevealedCells(data.revealed_cells)
      setAttempts(data.attempts)
      setWon(data.won)
      setScore(data.score)

      if (data.won) {
        alert(`¡Ganaste! Puntuación: ${data.score}\nTiros: ${data.attempts}`)
      }
    } catch (err: any) {
      console.error('Error en tiro', err)
      alert(err.response?.data?.error || 'Error al disparar')
    }
  }

  // Función para saber si una celda está revelada y su resultado
  const getCellStatus = (row: number, col: number) => {
    const cell = revealedCells.find(c => c.row === row && c.col === col)
    if (!cell) return null
    return cell.result
  }

  if (loading) return <div className="text-center mt-5">Cargando partida...</div>

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">Trobar la Flota - Partida {gameId}</h1>
      <p className="lead">
        Tiros: <strong>{attempts}</strong> | Puntuación: <strong>{score}</strong>
        {won && <span className="text-success ms-3">¡GANASTE!</span>}
      </p>

      <div className="d-flex justify-content-center">
        <div className="border border-3 border-dark rounded p-2 bg-light">
          {Array.from({ length: 10 }).map((_, row) => (
            <div key={row} className="d-flex">
              {Array.from({ length: 10 }).map((_, col) => {
                const status = getCellStatus(row, col)
                let className = 'btn btn-outline-secondary m-1 p-0'
                if (status === 'hit') className = 'btn btn-danger m-1 p-0 text-white'
                if (status === 'miss') className = 'btn btn-primary m-1 p-0 text-white'

                return (
                  <button
                    key={`${row}-${col}`}
                    className={className}
                    style={{ width: '45px', height: '45px' }}
                    onClick={() => handleShot(row, col)}
                    disabled={!!status || won}
                  >
                    {status === 'hit' ? 'X' : status === 'miss' ? '•' : ''}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {won && (
        <div className="mt-4">
          <button
            className="btn btn-lg btn-success"
            onClick={() => window.location.reload()} // Recarga para nueva partida
          >
            Jugar de nuevo
          </button>
        </div>
      )}

      <button
    className="btn btn-outline-danger mb-3"
    onClick={async () => {
        await api.post('/logout')
        localStorage.removeItem('token')
        navigate('/login')
    }}
    >
    Cerrar sesión
    </button>

    </div>

    
  )
}