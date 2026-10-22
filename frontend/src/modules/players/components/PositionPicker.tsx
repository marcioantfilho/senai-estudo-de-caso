import { POSITIONS, type Position } from '../api/players-api'
import { POSITION_LABELS } from '../player-labels'

type PositionPickerProps = {
  value: Position | undefined
  lockedTo?: Position
  error?: string
  hint?: string
  onChange: (position: Position) => void
}

/** Escolha da posição; com `lockedTo`, só a posição atual fica disponível. */
export default function PositionPicker({ value, lockedTo, error, hint, onChange }: PositionPickerProps) {
  const message = error ?? hint
  return (
    <fieldset className={`position-picker${error ? ' form-field-invalid' : ''}`} aria-describedby={message ? 'position-message' : undefined}>
      <legend>Posição</legend>
      <div className="position-options">
        {POSITIONS.map((position) => (
          <label key={position} className={`position-option${value === position ? ' is-selected' : ''}`}>
            <input
              type="radio"
              name="position"
              value={position}
              checked={value === position}
              disabled={lockedTo !== undefined && lockedTo !== position}
              onChange={() => onChange(position)}
            />
            <span className="position-code">{position}</span>
            <span className="position-name">{POSITION_LABELS[position]}</span>
          </label>
        ))}
      </div>
      {message && (
        <p id="position-message" className={error ? 'field-error' : 'field-hint'} role={error ? 'alert' : undefined}>
          {message}
        </p>
      )}
    </fieldset>
  )
}
