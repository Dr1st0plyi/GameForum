import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Game } from '../api/client'
import { createApiClient } from '../api/client'
import { useAuth } from '../modules/auth/AuthContext'

export function GamesPage() {
  const { user, token } = useAuth()
  const api = useMemo(() => createApiClient(() => token), [token])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newGameSteamId, setNewGameSteamId] = useState('')
  const [newGameTitle, setNewGameTitle] = useState('')
  const [newGameDescription, setNewGameDescription] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api
      .listGames()
      .then(setGames)
      .catch((err) => {
        console.error(err)
        setError((err as Error).message)
      })
      .finally(() => setLoading(false))
  }, [api])

  const isAdmin = user?.role === 'ADMIN'

  const handleCreateGame = async () => {
    const steamAppId = Number(newGameSteamId)
    if (!steamAppId || !newGameTitle.trim()) return
    try {
      const game = await api.createGame({ steamAppId, title: newGameTitle.trim(), description: newGameDescription })
      setGames((prev) => [...prev, game])
      setNewGameSteamId('')
      setNewGameTitle('')
      setNewGameDescription('')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleDeleteGame = async (gameId: number) => {
    if (!window.confirm('Удалить игру?')) return
    try {
      await api.deleteGame(gameId)
      setGames((prev) => prev.filter((g) => g.id !== gameId))
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="page-card">
      <h1 className="page-title">Список игр</h1>
      {loading && <p className="text-muted">Загрузка...</p>}
      {error && <p className="error-text">{error}</p>}

      <table className="table-pixel">
        <thead>
          <tr>
            <th>ID</th>
            <th>Steam App ID</th>
            <th>Название</th>
            <th>В библиотеке</th>
            {isAdmin && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.steamAppId}</td>
              <td>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  {game.title}
                </button>
              </td>
                <td>{game.hasInLibrary ? 'Да' : <span className="text-muted">Нет</span>}</td>
              {isAdmin && (
                <td>
                  <button
                    type="button"
                    className="pixel-button pixel-button--danger"
                    onClick={() => handleDeleteGame(game.id)}
                  >
                    Удалить
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!user && (
        <p className="text-muted">
          Для работы с форумом и баг репортами авторизуйтесь на странице <Link to="/login">входа</Link>.
        </p>
      )}

      {isAdmin && (
        <section style={{ marginTop: 16 }}>
          <h2 className="page-subtitle">Добавить игру</h2>
          <div className="form-grid">
            <label>
              Steam App ID
              <input
                value={newGameSteamId}
                onChange={(e) => setNewGameSteamId(e.target.value)}
              />
            </label>
            <label>
              Название
              <input
                value={newGameTitle}
                onChange={(e) => setNewGameTitle(e.target.value)}
              />
            </label>
            <label>
              Описание
              <textarea
                value={newGameDescription}
                onChange={(e) => setNewGameDescription(e.target.value)}
              />
            </label>
            <div>
              <button
                type="button"
                className="pixel-button"
                onClick={handleCreateGame}
              >
                Создать
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
