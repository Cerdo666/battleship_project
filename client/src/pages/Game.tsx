import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Board from '../components/Board'
import { type Cell, type Ship } from '../types'

export default function Game() {
  const [gameId, setGameId] = useState<number | null>(null)
  const [revealedCells, setRevealedCells] = useState<any[]>([])
  const [ships, setShips] = useState<Ship[]>([])
  const [attempts, setAttempts] = useState(0)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false) // Empieza false porque no creamos partida automáticamente
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Convertir revealedCells al formato que espera Board
  const [boardCells, setBoardCells] = useState<Cell[][]>(() => 
    Array(10).fill(null).map(() => 
      Array(10).fill(null).map(() => ({ revealed: false, shipId: null }))
    )
  )

  // Actualizar boardCells cuando cambien revealedCells
  useEffect(() => {
    if (revealedCells.length > 0) {
      const newCells = Array(10).fill(null).map(() => 
        Array(10).fill(null).map(() => ({ revealed: false, shipId: null }))
      )
      
      revealedCells.forEach(cell => {
        newCells[cell.row][cell.col] = {
          revealed: true,
          shipId: cell.ship_id || null
        }
      })
      setBoardCells(newCells)
    }
  }, [revealedCells])

  const startNewGame = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/games')
      const newGameId = res.data.game_id
      setGameId(newGameId)
      setRevealedCells([])
      setShips([]) // Si el backend devuelve los barcos, aquí los guardarías
      setAttempts(0)
      setWon(false)
      setScore(0)
      setBoardCells(Array(10).fill(null).map(() => 
        Array(10).fill(null).map(() => ({ revealed: false, shipId: null }))
      ))
    } catch (err: any) {
      console.error('Error creando partida', err)
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        setError('No se pudo crear la partida. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) return <div className="text-center mt-5">Cargando partida...</div>

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">Trobar la Flota</h1>
      
      {!gameId ? (
        <div className="mt-5">
          <p className="lead mb-4">¿Listo para encontrar los barcos perdidos?</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <button 
            className="btn btn-primary btn-lg"
            onClick={startNewGame}
          >
            Iniciar Nueva Partida
          </button>
        </div>
      ) : (
        <>
          <p className="lead">
            Partida: <strong>{gameId}</strong> | 
            Tiros: <strong>{attempts}</strong> | 
            Puntuación: <strong>{score}</strong>
            {won && <span className="text-success ms-3">¡GANASTE!</span>}
          </p>

          <Board 
            cells={boardCells}
            ships={ships}
            onClick={handleShot}
          />

          {won && (
            <div className="mt-4">
              <button
                className="btn btn-lg btn-success me-2"
                onClick={startNewGame}
              >
                Jugar de nuevo
              </button>
              <button
                className="btn btn-lg btn-outline-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Volver al Dashboard
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}