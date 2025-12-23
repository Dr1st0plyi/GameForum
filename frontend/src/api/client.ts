const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000/api'

export type UserRole = 'USER' | 'DEVELOPER' | 'ADMIN'

export interface AuthenticatedUser {
  id: number
  email?: string | null
  steamId?: string | null
  role: UserRole
}

export interface Game {
  id: number
  steamAppId: number
  title: string
  description?: string | null
  hasInLibrary?: boolean
}

export interface Thread {
  id: number
  gameId: number
  authorId: number
  title: string
  isDeleted: boolean
  isLocked: boolean
  createdAt: string
}

export interface Post {
  id: number
  threadId: number
  authorId: number
  content: string
  isDeleted: boolean
  isSpoiler: boolean
  createdAt: string
}

export type BugReportStatus =
  | 'PENDING_ADMIN'
  | 'REJECTED_BY_ADMIN'
  | 'VISIBLE_TO_DEV'
  | 'IN_PROGRESS'
  | 'FIXED'
  | 'CLOSED'

export interface BugReport {
  id: number
  gameId: number
  authorId: number
  title: string
  description: string
  status: BugReportStatus
  createdAt: string
}

export interface PaginatedUsersResponse {
  items: Array<{ id: number; email: string | null; role: UserRole; isBanned: boolean }>
  total: number
}

export interface LoginResponse {
  accessToken: string
  user: AuthenticatedUser
}

export class ApiClient {
  private readonly getToken: () => string | null

  constructor(getToken: () => string | null) {
    this.getToken = getToken
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers ?? {})
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const token = this.getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })

    if (res.status === 204) {
      return undefined as unknown as T
    }

    const text = await res.text()
    const data = text ? (JSON.parse(text) as any) : undefined

    if (!res.ok) {
      const rawMessage = data?.message
      let message: string
      if (Array.isArray(rawMessage)) {
        message = rawMessage.join(', ')
      } else if (typeof rawMessage === 'string') {
        message = rawMessage
      } else {
        message = res.statusText || 'Request failed'
      }
      throw new Error(message)
    }

    return data
  }

  login(email: string, password: string) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  getMe() {
    return this.request<AuthenticatedUser>('/users/me')
  }

  listGames() {
    return this.request<Game[]>('/games')
  }

  createGame(payload: { steamAppId: number; title: string; description?: string }) {
    return this.request<Game>('/games', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  updateGame(id: number, payload: Partial<{ steamAppId: number; title: string; description?: string }>) {
    return this.request<Game>(`/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  deleteGame(id: number) {
    return this.request<void>(`/games/${id}`, { method: 'DELETE' })
  }

  listThreads(gameId: number) {
    return this.request<Thread[]>(`/games/${gameId}/threads`)
  }

  createThread(gameId: number, payload: { title: string; content: string }) {
    return this.request<Thread>(`/games/${gameId}/threads`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  getThread(threadId: number) {
    return this.request<Thread>(`/threads/${threadId}`)
  }

  updateThread(threadId: number, payload: { title?: string }) {
    return this.request<Thread>(`/threads/${threadId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  deleteThread(threadId: number) {
    return this.request<void>(`/threads/${threadId}`, { method: 'DELETE' })
  }

  setThreadLock(threadId: number, isLocked: boolean) {
    return this.request<Thread>(`/threads/${threadId}/lock`, {
      method: 'PATCH',
      body: JSON.stringify({ isLocked }),
    })
  }

  listPosts(threadId: number) {
    return this.request<Post[]>(`/threads/${threadId}/posts`)
  }

  createPost(threadId: number, payload: { content: string }) {
    return this.request<Post>(`/threads/${threadId}/posts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  updatePost(postId: number, payload: { content?: string }) {
    return this.request<Post>(`/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  deletePost(postId: number) {
    return this.request<void>(`/posts/${postId}`, { method: 'DELETE' })
  }

  setPostSpoiler(postId: number, isSpoiler: boolean) {
    return this.request<Post>(`/posts/${postId}/spoiler`, {
      method: 'PATCH',
      body: JSON.stringify({ isSpoiler }),
    })
  }

  createBugReport(gameId: number, payload: { title: string; description: string }) {
    return this.request<BugReport>(`/games/${gameId}/bug-reports`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  listBugReports(gameId: number, params?: { status?: BugReportStatus }) {
    const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : ''
    return this.request<BugReport[]>(`/games/${gameId}/bug-reports${query}`)
  }

  getBugReport(id: number) {
    return this.request<BugReport>(`/bug-reports/${id}`)
  }

  adminListPendingBugReports() {
    return this.request<
      (BugReport & { game: { id: number; title: string }; author: { id: number; email: string | null; steamId: string | null; role: UserRole } })[]
    >('/admin/bug-reports/pending')
  }

  adminReviewBugReport(id: number, payload: { action: 'APPROVE' | 'REJECT'; comment?: string }) {
    return this.request<BugReport>(`/bug-reports/${id}/admin-review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  developerUpdateBugStatus(id: number, status: BugReportStatus) {
    return this.request<BugReport>(`/bug-reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  adminListUsers(page = 1, pageSize = 50) {
    const query = `?page=${page}&pageSize=${pageSize}`
    return this.request<PaginatedUsersResponse>(`/admin/users${query}`)
  }

  adminSetBan(userId: number, isBanned: boolean) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned }),
    })
  }

  developerListGames() {
    return this.request<Game[]>('/developer/games')
  }

  developerListBugReports(gameId: number, params?: { status?: BugReportStatus }) {
    const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : ''
    return this.request<BugReport[]>(`/developer/games/${gameId}/bug-reports${query}`)
  }
}

export const createApiClient = (getToken: () => string | null) => new ApiClient(getToken)

export { API_BASE_URL }
