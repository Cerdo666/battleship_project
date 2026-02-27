import { type Ship } from '../types'

const SHIPS_CONFIG = [
  { size: 5, count: 1, color: 'bg-purple' },
  { size: 4, count: 1, color: 'bg-success' },
  { size: 3, count: 1, color: 'bg-primary' },
  { size: 3, count: 1, color: 'bg-danger' },
  { size: 2, count: 1, color: 'bg-warning' },
]

export function placeShips(): { grid: (number | null)[][], ships: Ship[] } {
  const grid = Array(10).fill(null).map(() => Array(10).fill(null))
  const ships: Ship[] = []
  let shipId = 1

  for (const cfg of SHIPS_CONFIG) {
    for (let i = 0; i < cfg.count; i++) {
      let placed = false
      while (!placed) {
        const horizontal = Math.random() < 0.5
        const maxStart = horizontal ? 10 - cfg.size : 10
        const row = Math.floor(Math.random() * maxStart)
        const col = Math.floor(Math.random() * maxStart)

        const positions: { row: number; col: number }[] = []
        let canPlace = true

        for (let j = 0; j < cfg.size; j++) {
          const r = horizontal ? row : row + j
          const c = horizontal ? col + j : col
          if (grid[r][c] !== null) {
            canPlace = false
            break
          }
          positions.push({ row: r, col: c })
        }

        if (canPlace) {
          positions.forEach(p => { grid[p.row][p.col] = shipId })
          ships.push({
            id: shipId,
            size: cfg.size,
            positions,
            color: cfg.color,
            hits: 0
          })
          shipId++
          placed = true
        }
      }
    }
  }

  return { grid, ships }
}