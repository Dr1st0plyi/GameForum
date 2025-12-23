import { Route, Routes, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { GamesPage } from './pages/GamesPage'
import { GamePage } from './pages/GamePage'
import { AdminPage } from './pages/AdminPage'
import { DeveloperPage } from './pages/DeveloperPage'
import { SteamCallbackPage } from './pages/SteamCallbackPage'
import { useAuth } from './modules/auth/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth()
  if (loading) return <p>Проверка авторизации...</p>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<GamesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/steam-callback" element={<SteamCallbackPage />} />
        <Route
          path="/games/:id"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer"
          element={
            <ProtectedRoute>
              <DeveloperPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
