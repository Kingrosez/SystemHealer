export type ApiError = {
  status: number
  code: string
  message: string
  userMessage: string
  traceId?: string
  data?: unknown
}

export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) {
    return false
  }
  const record = error as Record<string, unknown>
  return (
    typeof record.status === 'number' &&
    typeof record.code === 'string' &&
    typeof record.message === 'string' &&
    typeof record.userMessage === 'string'
  )
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(
  /\/+$/,
  ''
)

const DEFAULT_USER_MESSAGE = 'Something went wrong. Please try again.'

function fallbackUserMessage(status: number): string {
  if (status === 0) {
    return 'Unable to reach the SystemHealer backend. Make sure it is running.'
  }
  if (status === 403) {
    return 'Administrator permission is required for this action.'
  }
  if (status === 404) {
    return 'The requested resource was not found.'
  }
  if (status === 409) {
    return 'This action conflicts with the current state. Refresh and try again.'
  }
  if (status === 503) {
    return 'A required system tool is unavailable. Check the backend and try again.'
  }
  if (status >= 500) {
    return 'The backend encountered an error. Please try again.'
  }
  return DEFAULT_USER_MESSAGE
}

type ErrorBody = {
  code?: string
  message?: string
  userMessage?: string
  traceId?: string
}

function asErrorBody(body: unknown): ErrorBody {
  if (typeof body !== 'object' || body === null) {
    return {}
  }
  const record = body as Record<string, unknown>
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
    userMessage:
      typeof record.userMessage === 'string' ? record.userMessage : undefined,
    traceId: typeof record.traceId === 'string' ? record.traceId : undefined,
  }
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) {
    return undefined
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers)
  const hasBody = init?.body !== undefined && init?.body !== null
  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch (error) {
    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network request failed',
      userMessage: fallbackUserMessage(0),
    } satisfies ApiError
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T
  }

  const body = await readResponseBody(res)

  if (!res.ok) {
    const errorBody = asErrorBody(body)
    const textMessage =
      typeof body === 'string' && body.trim() ? body.trim() : undefined
    throw {
      status: res.status,
      code: errorBody.code ?? 'UNKNOWN',
      message:
        errorBody.message ??
        textMessage ??
        (res.statusText || 'Request failed'),
      userMessage: errorBody.userMessage ?? fallbackUserMessage(res.status),
      traceId: errorBody.traceId,
      data: body,
    } satisfies ApiError
  }

  if (body === undefined) {
    return undefined as T
  }

  return body as T
}
