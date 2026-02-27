import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Ranking() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await api.get('/ranking')
        setRanking(res.data.ranking)
      } catch (err) {
        console.error('Error al cargar ranking', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRanking()
  }, [])

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Ranking Histórico</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : ranking.length === 0 ? (
        <p>Aún no hay partidas ganadas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Usuario</th>
              <th>Puntos totales</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item, index) => (
              <tr key={item.nickname}>
                <td>{index + 1}</td>
                <td>{item.nickname}</td>
                <td>{item.total_puntos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}