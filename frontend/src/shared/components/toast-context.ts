import { createContext } from 'react'

export type ToastMessage = {
  tone: 'success' | 'error'
  title: string
  description?: string
}

export const ToastContext = createContext<(toast: ToastMessage) => void>(() => undefined)
