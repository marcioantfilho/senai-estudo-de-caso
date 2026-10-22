import type { ReactNode } from 'react'
import './components.css'

type LoadingStateProps = {
  label: string
  rows?: number
}

export function LoadingState({ label, rows = 5 }: LoadingStateProps) {
  return (
    <div className="list-state" role="status" aria-live="polite">
      <p className="list-state-loading-label">
        <span className="spinner" aria-hidden="true" />
        {label}
      </p>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton-row" aria-hidden="true" />
      ))}
    </div>
  )
}

type MessageStateProps = {
  title: string
  description: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, action }: MessageStateProps) {
  return (
    <div className="list-state list-state-message">
      <p className="list-state-title">{title}</p>
      <p className="list-state-description">{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({ title, description, action }: MessageStateProps) {
  return (
    <div className="list-state list-state-message" role="alert">
      <p className="list-state-title list-state-error-title">{title}</p>
      <p className="list-state-description">{description}</p>
      {action}
    </div>
  )
}
