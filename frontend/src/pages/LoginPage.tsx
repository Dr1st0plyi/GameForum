import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createApiClient } from '../api/client'
import { useAuth } from '../modules/auth/AuthContext'
import { API_BASE_URL } from '../api/client'

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = createApiClient(() => null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await api.login(email, password)
      login(result.accessToken, result.user)
      navigate('/')
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSteamLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/steam`
  }

  if (user) {
    return (
      <div className="page-card">
        <h1 className="page-title">Вы уже авторизованы</h1>
        <p className="text-muted">
          Текущий пользователь: {user.email ?? user.steamId} ({user.role})
        </p>
      </div>
    )
  }

  return (
    <div className="page-card">
      <h1 className="page-title">Вход</h1>

      <section style={{ marginBottom: 18 }}>
        <h2 className="page-subtitle">Войти через Steam (роль USER)</h2>
        <button
          type="button"
          className="pixel-button"
          onClick={handleSteamLogin}
        >
          Войти через Steam
        </button>
      </section>

      <hr />

      <section>
        <h2 className="page-subtitle">Локальный вход (ADMIN / DEVELOPER)</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <div>
            <button
              type="submit"
              className="pixel-button pixel-button--secondary"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>
    </div>
  )
}
