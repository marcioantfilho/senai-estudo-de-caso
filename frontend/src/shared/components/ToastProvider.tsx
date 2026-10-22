import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ToastContext, type ToastMessage } from './toast-context'
import './components.css'

const TOAST_DURATION_MS = 6000

type VisibleToast = ToastMessage & { id: number }

/** Mostra os avisos de sucesso e de erro das ações, no canto da tela. */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<VisibleToast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback((toast: ToastMessage) => {
    setToasts((current) => [...current, { ...toast, id: Date.now() + Math.random() }])
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ toast, onDismiss }: { toast: VisibleToast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div className={`toast toast-${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
      <div>
        <p className="toast-title">{toast.title}</p>
        {toast.description && <p className="toast-description">{toast.description}</p>}
      </div>
      <button type="button" className="icon-button" aria-label="Fechar aviso" onClick={() => onDismiss(toast.id)}>
        ×
      </button>
    </div>
  )
}
