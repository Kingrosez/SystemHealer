export type ApiError = {
  status: number
  code: string
  message: string
  userMessage: string
  traceId?: string
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`/api${path}`, {
    ...init,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw {
      status: res.status,
      code: body.code ?? 'UNKNOWN',
      message: body.message ?? res.statusText,
      userMessage: body.userMessage ?? 'Something went wrong. Please try again.',
      traceId: body.traceId,
    } satisfies ApiError
  }

  return res.json() as Promise<T>
}