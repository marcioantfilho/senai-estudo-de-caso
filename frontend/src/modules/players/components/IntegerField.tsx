import FormField from '../../../shared/components/FormField'

type IntegerFieldProps = {
  label: string
  value: string
  error?: string
  hint?: string
  onChange: (value: string) => void
}

export default function IntegerField({ label, value, error, hint, onChange }: IntegerFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          inputMode="numeric"
          value={value}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FormField>
  )
}
