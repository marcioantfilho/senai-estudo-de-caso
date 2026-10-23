import type { MenuOption } from './OptionMenu'

type SegmentedOption<T> = MenuOption<T> & { disabledReason?: string }

type SegmentedControlProps<T> = {
  label: string
  options: readonly SegmentedOption<T>[]
  selected: T
  className?: string
  onSelect: (value: T) => void
}

/** Grupo de botões com uma escolha por vez, como as abas de uma página; a opção com motivo fica desabilitada. */
export default function SegmentedControl<T extends string>({ label, options, selected, className, onSelect }: SegmentedControlProps<T>) {
  return (
    <div className={`segmented${className ? ` ${className}` : ''}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === selected}
          disabled={option.disabledReason !== undefined}
          title={option.disabledReason}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
