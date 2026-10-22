import { useId, type ReactNode } from 'react'
import './components.css'

type FormFieldProps = {
  label: string
  hint?: ReactNode
  error?: string
  children: (control: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
}

/** Campo com rótulo, dica e mensagem de erro junto ao campo. */
export default function FormField({ label, hint, error, children }: FormFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className={`form-field${error ? ' form-field-invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, describedBy: hasMessage ? messageId : undefined, invalid: Boolean(error) })}
      {hasMessage && (
        <p id={messageId} className={error ? 'field-error' : 'field-hint'} role={error ? 'alert' : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
