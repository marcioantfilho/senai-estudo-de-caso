import Dropdown from './Dropdown'

export type MenuOption<T> = { value: T; label: string }

type OptionMenuProps<T> = {
  label: string
  options: readonly MenuOption<T>[]
  selected: T
  active?: boolean
  disabled?: boolean
  disabledReason?: string
  align?: 'start' | 'end'
  heading?: string
  onSelect: (value: T) => void
}

/** Botão que abre a lista de opções de um filtro ou de uma ordenação; fecha ao escolher. */
export default function OptionMenu<T>({
  label,
  options,
  selected,
  active,
  disabled,
  disabledReason,
  align,
  heading,
  onSelect,
}: OptionMenuProps<T>) {
  return (
    <Dropdown label={label} active={active} disabled={disabled} disabledReason={disabledReason} align={align}>
      {(close) => (
        <ul className="menu-list" role="listbox" aria-label={heading ?? label}>
          {heading && <li className="menu-heading">{heading}</li>}
          {options.map((option) => (
            <li key={String(option.value ?? 'all')}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === selected}
                className="menu-item"
                onClick={() => {
                  onSelect(option.value)
                  close()
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  )
}
