import { useState } from 'react'
import FormField from '../../../shared/components/FormField'

type RangeFilterProps = {
  min: string
  max: string
  minLabel: string
  maxLabel: string
  validate: (raw: string) => string | undefined
  onApply: (min: string, max: string) => void
  onClose: () => void
}

/** Faixa inclusiva; um limite vazio usa o extremo da API. A ordem entre os limites é conferida pela API. */
export default function RangeFilter({ min, max, minLabel, maxLabel, validate, onApply, onClose }: RangeFilterProps) {
  const [draftMin, setDraftMin] = useState(min)
  const [draftMax, setDraftMax] = useState(max)
  const [submitted, setSubmitted] = useState(false)
  const minError = submitted ? validate(draftMin) : undefined
  const maxError = submitted ? validate(draftMax) : undefined

  const apply = () => {
    setSubmitted(true)
    if (validate(draftMin) || validate(draftMax)) {
      return
    }
    onApply(draftMin.trim(), draftMax.trim())
    onClose()
  }

  return (
    <form
      className="range-filter"
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
    >
      <div className="range-filter-fields">
        <FormField label={minLabel} error={minError}>
          {({ id, describedBy, invalid }) => (
            <input id={id} inputMode="decimal" value={draftMin} aria-describedby={describedBy} aria-invalid={invalid}
              onChange={(event) => setDraftMin(event.target.value)} />
          )}
        </FormField>
        <FormField label={maxLabel} error={maxError}>
          {({ id, describedBy, invalid }) => (
            <input id={id} inputMode="decimal" value={draftMax} aria-describedby={describedBy} aria-invalid={invalid}
              onChange={(event) => setDraftMax(event.target.value)} />
          )}
        </FormField>
      </div>
      <div className="range-filter-actions">
        <button type="button" className="button button-ghost" onClick={() => { onApply('', ''); onClose() }}>
          Limpar
        </button>
        <button type="submit" className="button button-primary">Aplicar</button>
      </div>
    </form>
  )
}
