import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <nav className="app-nav">
          <Link className="app-nav-link" to="/">
            Игры
          </Link>
          <Link className="app-nav-link" to="/login">
            Вход
          </Link>
          {user?.role === 'ADMIN' && (
            <Link className="app-nav-link" to="/admin">
              Админка
            </Link>
          )}
          {user?.role === 'DEVELOPER' && (
            <Link className="app-nav-link" to="/developer">
              Панель разработчика
            </Link>
          )}
        </nav>
        <div className="app-user-panel">
          {user ? (
            <>
              <span>
                Вы вошли как {user.email ?? user.steamId} ({user.role})
              </span>
              <button
                type="button"
                className="pixel-button pixel-button--secondary"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </>
          ) : (
            <span>Не авторизован</span>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
