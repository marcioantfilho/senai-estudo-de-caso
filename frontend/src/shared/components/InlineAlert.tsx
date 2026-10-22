import type { ReactNode } from 'react'
import './components.css'

type InlineAlertProps = {
  tone: 'error' | 'warning'
  title?: string
  children: ReactNode
}

/** Aviso dentro de um formulário ou modal, como o `message` de uma recusa da API. */
export default function InlineAlert({ tone, title, children }: InlineAlertProps) {
  return (
    <div className={`inline-alert inline-alert-${tone}`} role={tone === 'error' ? 'alert' : 'note'}>
      {title && <p className="inline-alert-title">{title}</p>}
      <div>{children}</div>
    </div>
  )
}
