import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { BugReport, Game, Post, Thread } from '../api/client'
import { createApiClient } from '../api/client'
import { useAuth } from '../modules/auth/AuthContext'

function ForumTab({ gameId }: { gameId: number }) {
  const { token, user } = useAuth()
  const api = useMemo(() => createApiClient(() => token), [token])

  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadContent, setNewThreadContent] = useState('')
  const [newPostContent, setNewPostContent] = useState('')

  const loadThreads = () => {
    setLoadingThreads(true)
    api
      .listThreads(gameId)
      .then((data) => {
        setThreads(data)
        setError(null)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoadingThreads(false))
  }

  useEffect(() => {
    loadThreads()
  }, [gameId])

  const handleSelectThread = async (thread: Thread) => {
    setSelectedThread(thread)
    setLoadingPosts(true)
    try {
      const data = await api.listPosts(thread.id)
      setPosts(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleCreateThread = async (e: FormEvent) => {
    e.preventDefault()
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return
    try {
      const created = await api.createThread(gameId, {
        title: newThreadTitle.trim(),
        content: newThreadContent.trim(),
      })
      setNewThreadTitle('')
      setNewThreadContent('')
      loadThreads()
      setSelectedThread(created)
      const threadPosts = await api.listPosts(created.id)
      setPosts(threadPosts)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !newPostContent.trim()) return
    try {
      const post = await api.createPost(selectedThread.id, { content: newPostContent.trim() })
      setNewPostContent('')
      setPosts((prev) => [...prev, post])
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  const handleToggleLock = async (thread: Thread) => {
    try {
      const updated = await api.setThreadLock(thread.id, !thread.isLocked)
      setThreads((prev) => prev.map((t) => (t.id === thread.id ? updated : t)))
      if (selectedThread && selectedThread.id === thread.id) {
        setSelectedThread(updated)
      }
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleDeleteThread = async (thread: Thread) => {
    if (!window.confirm('Удалить тему?')) return
    try {
      await api.deleteThread(thread.id)
      setThreads((prev) => prev.filter((t) => t.id !== thread.id))
      if (selectedThread?.id === thread.id) {
        setSelectedThread(null)
        setPosts([])
      }
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleEditPost = async (post: Post) => {
    const content = window.prompt('Новое содержание', post.content)
    if (content == null || !content.trim()) return
    try {
      const updated = await api.updatePost(post.id, { content })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)))
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleDeletePost = async (post: Post) => {
    if (!window.confirm('Удалить сообщение?')) return
    try {
      await api.deletePost(post.id)
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleToggleSpoiler = async (post: Post) => {
    try {
      const updated = await api.setPostSpoiler(post.id, !post.isSpoiler)
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)))
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <section style={{ marginTop: 12 }}>
      <h2 className="page-subtitle">Форум</h2>
      {loadingThreads && <p className="text-muted">Загрузка тем...</p>}
      {error && <p className="error-text">{error}</p>}

      <div style={{ marginTop: 8 }}>
        <h3 className="page-subtitle">Темы</h3>
        <ul className="thread-list">
          {threads.map((thread) => (
            <li key={thread.id} className="thread-item">
              <button
                type="button"
                className="thread-title-button"
                onClick={() => handleSelectThread(thread)}
              >
                {thread.title}
              </button>{' '}
              {thread.isLocked && <span className="badge badge-locked">Закрыта</span>}{' '}
              {isAdmin && (
                <>
                  <button
                    type="button"
                    className="pixel-button pixel-button--secondary"
                    onClick={() => handleToggleLock(thread)}
                  >
                    {thread.isLocked ? 'Открыть' : 'Закрыть'}
                  </button>{' '}
                  <button
                    type="button"
                    className="pixel-button pixel-button--danger"
                    onClick={() => handleDeleteThread(thread)}
                  >
                    Удалить
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {user && (
        <div style={{ marginTop: 12 }}>
          <h3 className="page-subtitle">Создать новую тему</h3>
          <form onSubmit={handleCreateThread} className="form-grid">
            <label>
              Заголовок
              <input
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
              />
            </label>
            <label>
              Сообщение
              <textarea
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
              />
            </label>
            <div>
              <button type="submit" className="pixel-button">
                Создать тему
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedThread && (
        <div style={{ marginTop: 16 }}>
          <h3 className="page-subtitle">Сообщения в теме: {selectedThread.title}</h3>
          {loadingPosts ? (
            <p className="text-muted">Загрузка сообщений...</p>
          ) : (
            <ul className="post-list">
              {posts.map((post) => (
                <li key={post.id} className="post-item">
                  <div className="post-meta">#{post.id}</div>
                  <div className={post.isSpoiler ? 'post-spoiler' : ''}>
                    {post.isSpoiler && <span className="badge badge-outline">спойлер</span>}{' '}
                    <span>{post.content}</span>
                  </div>
                  {user && (user.id === post.authorId || user.role === 'ADMIN') && (
                    <button
                      type="button"
                      className="pixel-button pixel-button--secondary"
                      onClick={() => handleEditPost(post)}
                    >
                      Редактировать
                    </button>
                  )}{' '}
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        className="pixel-button pixel-button--danger"
                        onClick={() => handleDeletePost(post)}
                      >
                        Удалить
                      </button>{' '}
                      <button
                        type="button"
                        className="pixel-button pixel-button--secondary"
                        onClick={() => handleToggleSpoiler(post)}
                      >
                        {post.isSpoiler ? 'Снять спойлер' : 'Спойлер'}
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {user && !selectedThread.isLocked && (
            <form onSubmit={handleCreatePost} className="form-grid">
              <label>
                Ответ
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </label>
              <div>
                <button type="submit" className="pixel-button">
                  Отправить
                </button>
              </div>
            </form>
          )}
          {selectedThread.isLocked && (
            <p className="text-muted">Тема закрыта для новых сообщений.</p>
          )}
        </div>
      )}
    </section>
  )
}

function BugReportsTab({ gameId }: { gameId: number }) {
  const { token, user } = useAuth()
  const api = useMemo(() => createApiClient(() => token), [token])
  const [reports, setReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const loadReports = () => {
    setLoading(true)
    api
      .listBugReports(gameId)
      .then((data) => {
        setReports(data)
        setError(null)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReports()
  }, [gameId])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDescription.trim()) return
    try {
      await api.createBugReport(gameId, { title: newTitle.trim(), description: newDescription.trim() })
      setNewTitle('')
      setNewDescription('')
      loadReports()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <section style={{ marginTop: 12 }}>
      <h2 className="page-subtitle">Баг репорты</h2>
      {loading && <p className="text-muted">Загрузка...</p>}
      {error && <p className="error-text">{error}</p>}

      <ul className="post-list">
        {reports.map((report) => (
          <li key={report.id} className="post-item">
            <div>
              <strong>#{report.id}</strong>{' '}
              <span
                className={`status-pill ${
                  report.status === 'PENDING_ADMIN'
                    ? 'status-pill--pending'
                    : report.status === 'VISIBLE_TO_DEV'
                    ? 'status-pill--visible'
                    : report.status === 'IN_PROGRESS'
                    ? 'status-pill--progress'
                    : report.status === 'FIXED'
                    ? 'status-pill--fixed'
                    : report.status === 'CLOSED'
                    ? 'status-pill--closed'
                    : ''
                }`}
              >
                {report.status}
              </span>{' '}
              {report.title}
            </div>
            <div>{report.description}</div>
          </li>
        ))}
      </ul>

      {user && user.role === 'USER' && (
        <div style={{ marginTop: 12 }}>
          <h3 className="page-subtitle">Создать баг репорт</h3>
          <form onSubmit={handleCreate} className="form-grid">
            <label>
              Заголовок
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </label>
            <label>
              Описание
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </label>
            <div>
              <button type="submit" className="pixel-button">
                Отправить
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export function GamePage() {
  const { id } = useParams<{ id: string }>()
  const gameId = Number(id)
  const { token } = useAuth()
  const api = useMemo(() => createApiClient(() => token), [token])

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'forum' | 'bugs'>('forum')

  useEffect(() => {
    setLoading(true)
    api
      .listGames()
      .then((games) => {
        const found = games.find((g) => g.id === gameId) ?? null
        setGame(found)
        if (!found) {
          setError('Игра не найдена')
        } else {
          setError(null)
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [gameId])

  if (!id || Number.isNaN(gameId)) {
    return <div className="page-card">Некорректный идентификатор игры</div>
  }

  if (loading && !game) {
    return <div className="page-card text-muted">Загрузка игры...</div>
  }

  if (error) {
    return <div className="page-card error-text">{error}</div>
  }

  if (!game) {
    return <div className="page-card">Игра не найдена</div>
  }

  return (
    <div className="page-card">
      <h1 className="page-title">
        {game.title}{' '}
        <span className="chip">Steam ID: {game.steamAppId}</span>
      </h1>
      {game.description && <p className="text-muted">{game.description}</p>}
      <p>
        В библиотеке:{' '}
        {game.hasInLibrary ? 'Да' : <span className="text-muted">Нет</span>}
      </p>

      <div className="tabs">
        <button type="button" onClick={() => setTab('forum')} disabled={tab === 'forum'}>
          Форум
        </button>{' '}
        <button type="button" onClick={() => setTab('bugs')} disabled={tab === 'bugs'}>
          Баг репорты
        </button>
      </div>

      {tab === 'forum' ? <ForumTab gameId={gameId} /> : <BugReportsTab gameId={gameId} />}
    </div>
  )
}
