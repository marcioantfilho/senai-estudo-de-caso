const API_BASE_URL = `${import.meta.env.VITE_API_ORIGIN}/api/v1`
const UNREACHABLE_MESSAGE = 'Não foi possível falar com a API. Verifique a conexão e tente de novo.'
const UNEXPECTED_MESSAGE = 'A API respondeu de um jeito inesperado. Tente de novo.'

export type QueryValue = string | number | boolean | undefined

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  signal?: AbortSignal
}

/** Recusa da API (ou falha de rede): `message` é o texto que a tela mostra. */
export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.status = status
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  return (response.status === 204 ? undefined : await response.json()) as T
}

/** Arquivo devolvido pela API (como o CSV da RN18), sem alterar os bytes; as recusas continuam em JSON. */
export async function apiDownload(path: string, options: Pick<RequestOptions, 'query' | 'signal'> = {}): Promise<Blob> {
  const response = await send(path, options)
  return response.blob()
}

async function send(path: string, { method = 'GET', query, body, signal }: RequestOptions): Promise<Response> {
  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw new ApiError(UNREACHABLE_MESSAGE, null)
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }
  return response
}

function buildUrl(path: string, query: Record<string, QueryValue> = {}): string {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(name, String(value))
    }
  }
  const search = params.toString()
  return `${API_BASE_URL}${path}${search ? `?${search}` : ''}`
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
  } catch {
    return UNEXPECTED_MESSAGE
  }
  return UNEXPECTED_MESSAGE
}
