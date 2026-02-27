import { useEffect, useState } from 'react'
import Board from './components/Board'
import { placeShips } from './utils/placeShips'
import { type Cell, type Ship } from './types'

function App() {
  const [cells, setCells] = useState<Cell[][]>([])
  const [ships, setShips] = useState<Ship[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  const startNewGame = () => {
    const { grid, ships: newShips } = placeShips()
    const newCells = grid.map(row =>
      row.map(shipId => ({ revealed: false, shipId }))
    )
    setCells(newCells)
    setShips(newShips)
    setMoves(0)
    setWon(false)
  }

  useEffect(() => {
    startNewGame()
  }, [])

  const handleClick = (row: number, col: number) => {
    if (won) return

    const newCells = cells.map(r => [...r])
    newCells[row][col].revealed = true

    const shipId = newCells[row][col].shipId
    if (shipId !== null) {
      const shipIdx = ships.findIndex(s => s.id === shipId)
      const newShips = [...ships]
      newShips[shipIdx].hits += 1
      setShips(newShips)
    }

    setCells(newCells)
    setMoves(m => m + 1)

    // Check victoria
    const allFound = ships.every(s => s.hits === s.size)
    if (allFound) setWon(true)
  }

  return (
    <div className="container my-5 text-center">
      <h1 className="mb-4">Trobar la Flota</h1>
      <p className="lead mb-4">Tiros: {moves} {won && ' - ¡Has ganado!'}</p>

      <Board cells={cells} ships={ships} onClick={handleClick} />

      {won && (
        <div className="mt-5">
          <h3 className="text-success">¡Has encontrado todos los barcos!</h3>
          <button
            className="btn btn-primary btn-lg mt-3"
            onClick={startNewGame}
          >
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}

export default App