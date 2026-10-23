import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/http-client'

export type ApiResourceState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string }

/** Leitura da API refeita quando `load` muda (use `useCallback`) ou em `reload`; a resposta mais recente vence. */
export function useApiResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<ApiResourceState<T>>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    load(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: error instanceof ApiError ? error.message : String(error) })
        }
      })
    return () => controller.abort()
  }, [load, reloadKey])

  const reload = useCallback(() => setReloadKey((current) => current + 1), [])

  return { state, reload }
}
