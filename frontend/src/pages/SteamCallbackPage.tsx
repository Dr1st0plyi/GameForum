import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext'
import type { AuthenticatedUser } from '../api/client'

export function SteamCallbackPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    const params = new URLSearchParams(rawHash)
    const token = params.get('accessToken')
    const userRaw = params.get('user')

    if (!token || !userRaw) {
      navigate('/login', { replace: true })
      return
    }

    try {
      const user = JSON.parse(userRaw) as AuthenticatedUser
      login(token, user)
      window.location.hash = ''
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Failed to parse Steam callback payload', error)
      navigate('/login', { replace: true })
    }
  }, [login, navigate])

  return <div className="page-card text-muted">Завершаем вход через Steam...</div>
}
