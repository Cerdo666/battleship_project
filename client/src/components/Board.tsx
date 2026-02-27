import { type Cell, type Ship } from '../types'

interface BoardProps {
  cells: Cell[][]
  ships: Ship[]
  onClick: (row: number, col: number) => void
}

export default function Board({ cells, ships, onClick }: BoardProps) {
  return (
    <div className="d-flex justify-content-center">
      <div className="border border-3 border-dark rounded p-2 bg-light" style={{ backgroundColor: '#e0f7fa' }}>
        {cells.map((row, rowIdx) => (
          <div key={rowIdx} className="d-flex">
            {row.map((cell, colIdx) => {
              let className = 'btn btn-outline-secondary m-1 p-0'
              let style: React.CSSProperties = { width: '40px', height: '40px' }

              if (cell.revealed) {
                if (cell.shipId === null) {
                  className = 'btn btn-secondary m-1 p-0' // miss
                } else {
                  const ship = ships.find(s => s.id === cell.shipId)
                  if (ship && ship.hits === ship.size) {
                    className = `btn ${ship.color} m-1 p-0 text-white fw-bold`
                  } else {
                    className = 'btn btn-warning m-1 p-0' // hit parcial
                  }
                }
              } else {
                // No revelado: hover sutil
                className += ' hover-bg-light'
              }

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  className={className}
                  style={style}
                  onClick={() => !cell.revealed && onClick(rowIdx, colIdx)}
                  disabled={cell.revealed}
                >
                  {cell.revealed && cell.shipId !== null ? 'X' : ''}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}