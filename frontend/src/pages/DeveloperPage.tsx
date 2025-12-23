import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { BugReport, BugReportStatus, Game } from '../api/client'
import { createApiClient } from '../api/client'
import { useAuth } from '../modules/auth/AuthContext'

function nextStatuses(current: BugReportStatus): BugReportStatus[] {
  if (current === 'VISIBLE_TO_DEV') return ['IN_PROGRESS', 'FIXED', 'CLOSED']
  if (current === 'IN_PROGRESS') return ['FIXED', 'CLOSED']
  return []
}

export function DeveloperPage() {
  const { token, user } = useAuth()
  const api = useMemo(() => createApiClient(() => token), [token])

  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [reports, setReports] = useState<BugReport[]>([])
  const [loadingGames, setLoadingGames] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDeveloper = user?.role === 'DEVELOPER'

  useEffect(() => {
    if (!isDeveloper) return
    setLoadingGames(true)
    api
      .developerListGames()
      .then((data) => {
        setGames(data)
        if (data.length > 0) setSelectedGameId(data[0].id)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoadingGames(false))
  }, [isDeveloper])

  useEffect(() => {
    if (!isDeveloper || !selectedGameId) return
    setLoadingReports(true)
    api
      .developerListBugReports(selectedGameId)
      .then((data) => {
        setReports(data)
        setError(null)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoadingReports(false))
  }, [isDeveloper, selectedGameId])

  if (!isDeveloper) {
    return <div className="page-card">Доступ только для DEVELOPER.</div>
  }

  const handleGameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value)
    setSelectedGameId(Number.isNaN(value) ? null : value)
  }

  const handleStatusChange = async (report: BugReport, newStatus: BugReportStatus) => {
    try {
      const updated = await api.developerUpdateBugStatus(report.id, newStatus)
      setReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)))
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="page-card">
      <h1 className="page-title">Панель разработчика</h1>

      {loadingGames && <p className="text-muted">Загрузка игр...</p>}
      {error && <p className="error-text">{error}</p>}

      {games.length === 0 && !loadingGames && (
        <p className="text-muted">За вами не закреплено ни одной игры.</p>
      )}

      {games.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <label>
            Игра:{' '}
            <select value={selectedGameId ?? ''} onChange={handleGameChange}>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {selectedGameId && (
        <section>
          <h2 className="page-subtitle">Баг репорты по выбранной игре</h2>
          {loadingReports && <p className="text-muted">Загрузка...</p>}
          <ul className="post-list">
            {reports.map((report) => (
              <li key={report.id} className="post-item">
                <div>
                  <strong>
                    #{report.id} [{report.status}] {report.title}
                  </strong>
                </div>
                <div>{report.description}</div>
                <div>
                  <label>
                    Изменить статус:{' '}
                    <select
                      value=""
                      onChange={(e) => {
                        const value = e.target.value as BugReportStatus
                        if (value) handleStatusChange(report, value)
                      }}
                    >
                      <option value="">— выбрать —</option>
                      {nextStatuses(report.status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            ))}
            {reports.length === 0 && !loadingReports && (
              <p className="text-muted">Репортов нет.</p>
            )}
          </ul>
        </section>
      )}
    </div>
  )
}
