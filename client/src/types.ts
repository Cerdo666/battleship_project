export interface Ship {
  id: number
  size: number
  positions: { row: number; col: number }[]
  color: string          // clase Bootstrap o custom para color final
  hits: number
}

export interface Cell {
  revealed: boolean
  shipId: number | null
}