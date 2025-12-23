import { useEffect, useMemo, useState } from 'react'
import type { PaginatedUsersResponse } from '../api/client'
import { createApiClient } from '../api/client'
import { useAuth } from '../modules/auth/AuthContext'

export function AdminPage() {
  const { token, user } = useAuth()
  const api = useMemo(() => createApiClient(() => token), [token])

  const [users, setUsers] = useState<PaginatedUsersResponse | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const [pendingReports, setPendingReports] = useState<
    Array<{
      id: number
      title: string
      description: string
      status: string
      game: { id: number; title: string }
      author: { id: number; email: string | null; steamId: string | null; role: string }
    }>
  >([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [reportsError, setReportsError] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin) return
    setLoadingUsers(true)
    api
      .adminListUsers(1, 100)
      .then((data) => {
        setUsers(data)
        setUsersError(null)
      })
      .catch((e) => setUsersError((e as Error).message))
      .finally(() => setLoadingUsers(false))
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    setLoadingReports(true)
    api
      .adminListPendingBugReports()
      .then((data) => {
        setPendingReports(data as any)
        setReportsError(null)
      })
      .catch((e) => setReportsError((e as Error).message))
      .finally(() => setLoadingReports(false))
  }, [isAdmin])

  if (!isAdmin) {
    return <div className="page-card">Доступ только для ADMIN.</div>
  }

  const handleToggleBan = async (userId: number, isBanned: boolean) => {
    try {
      await api.adminSetBan(userId, !isBanned)
      setUsers((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((u) => (u.id === userId ? { ...u, isBanned: !isBanned } : u)),
            }
          : prev,
      )
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleReview = async (reportId: number, action: 'APPROVE' | 'REJECT') => {
    const comment = window.prompt('Комментарий администратора (необязательно)') ?? undefined
    try {
      await api.adminReviewBugReport(reportId, { action, comment })
      setPendingReports((prev) => prev.filter((r) => r.id !== reportId))
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="page-card">
      <h1 className="page-title">Админ-панель</h1>

      <section>
        <h2 className="page-subtitle">Пользователи</h2>
        {loadingUsers && <p className="text-muted">Загрузка пользователей...</p>}
        {usersError && <p className="error-text">{usersError}</p>}
        {users && (
          <table className="table-pixel">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Забанен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.items.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email ?? '(нет)'}</td>
                  <td>{u.role}</td>
                  <td>{u.isBanned ? 'Да' : <span className="text-muted">Нет</span>}</td>
                  <td>
                    <button
                      type="button"
                      className="pixel-button pixel-button--danger"
                      onClick={() => handleToggleBan(u.id, u.isBanned)}
                    >
                      {u.isBanned ? 'Разбанить' : 'Забанить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 className="page-subtitle">Баг репорты, ожидающие проверки</h2>
        {loadingReports && <p className="text-muted">Загрузка...</p>}
        {reportsError && <p className="error-text">{reportsError}</p>}
        <ul className="post-list">
          {pendingReports.map((report) => (
            <li key={report.id} className="post-item">
              <div>
                <strong>
                  #{report.id} [{report.status}] {report.title}
                </strong>{' '}
                (игра: {report.game.title})
              </div>
              <div>{report.description}</div>
              <div>
                Автор: {report.author.email ?? report.author.steamId} ({report.author.role})
              </div>
              <button
                type="button"
                className="pixel-button"
                onClick={() => handleReview(report.id, 'APPROVE')}
              >
                Одобрить (видно разработчику)
              </button>{' '}
              <button
                type="button"
                className="pixel-button pixel-button--danger"
                onClick={() => handleReview(report.id, 'REJECT')}
              >
                Отклонить
              </button>
            </li>
          ))}
          {pendingReports.length === 0 && !loadingReports && <p>Нет репортов в статусе PENDING_ADMIN.</p>}
        </ul>
      </section>
    </div>
  )
}
