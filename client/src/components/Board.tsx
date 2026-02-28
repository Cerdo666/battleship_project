import { type Cell, type Ship } from '../types'

interface BoardProps {
  cells: Cell[][]
  ships: Ship[]
  onClick: (row: number, col: number) => void
}

export default function Board({ cells, ships, onClick }: BoardProps) {
  // Función para determinar la clase CSS de cada celda
  const getCellClassName = (cell: Cell, row: number, col: number): string => {
    const baseClass = 'btn m-1 p-0'
    const sizeStyle = { width: '40px', height: '40px' }
    
    if (!cell.revealed) {
      return `${baseClass} btn-outline-secondary hover-bg-light`
    }

    if (cell.shipId === null) {
      return `${baseClass} btn-secondary` // Agua
    }

    const ship = ships.find(s => s.id === cell.shipId)
    if (!ship) return `${baseClass} btn-warning` // Por si acaso

    // Si el barco está completamente encontrado, mostrar su color
    if (ship.hits === ship.size) {
      return `${baseClass} ${ship.color} text-white fw-bold`
    }

    // Si está tocado pero no hundido
    return `${baseClass} btn-warning`
  }

  // Función para el contenido de la celda
  const getCellContent = (cell: Cell): string => {
    if (!cell.revealed) return ''
    if (cell.shipId !== null) return '⚓' // Ancla para barco encontrado
    return '💧' // Agua
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="border border-3 border-dark rounded p-2 bg-light">
        {cells.map((row, rowIdx) => (
          <div key={rowIdx} className="d-flex">
            {row.map((cell, colIdx) => {
              const className = getCellClassName(cell, rowIdx, colIdx)
              
              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  className={className}
                  style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}
                  onClick={() => !cell.revealed && onClick(rowIdx, colIdx)}
                  disabled={cell.revealed}
                  title={`Fila ${rowIdx + 1}, Columna ${colIdx + 1}`}
                >
                  {getCellContent(cell)}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}