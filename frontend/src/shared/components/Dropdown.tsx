import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './components.css'

const PANEL_GAP = 6
const VIEWPORT_MARGIN = 8
const HIDDEN_UNTIL_PLACED: CSSProperties = { position: 'fixed', visibility: 'hidden' }

type DropdownProps = {
  label: ReactNode
  ariaLabel?: string
  active?: boolean
  disabled?: boolean
  disabledReason?: string
  align?: 'start' | 'end'
  triggerClassName?: string
  children: (close: () => void) => ReactNode
}

/** Botão que abre um painel; fecha ao escolher, ao clicar fora ou com Esc. */
export default function Dropdown({
  label,
  ariaLabel,
  active = false,
  disabled = false,
  disabledReason,
  align = 'start',
  triggerClassName = 'filter-button',
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<CSSProperties>()
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  /**
   * Painel fixo na janela, para não ser cortado por áreas com rolagem (como a tabela);
   * abre para cima quando não cabe abaixo do botão e acompanha o botão ao rolar.
   */
  const place = useCallback(() => {
    if (!containerRef.current || !panelRef.current) {
      return
    }
    const trigger = containerRef.current.getBoundingClientRect()
    const height = panelRef.current.offsetHeight
    const fitsBelow = trigger.bottom + PANEL_GAP + height <= window.innerHeight - VIEWPORT_MARGIN
    const top = fitsBelow
      ? trigger.bottom + PANEL_GAP
      : Math.max(VIEWPORT_MARGIN, trigger.top - PANEL_GAP - height)
    const horizontal = align === 'end' ? { right: window.innerWidth - trigger.right } : { left: trigger.left }
    setPosition({ position: 'fixed', top, ...horizontal })
  }, [align])

  useLayoutEffect(() => {
    if (open) {
      place()
    }
  }, [open, place])

  useEffect(() => {
    if (!open) {
      return
    }
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, place])

  useEffect(() => {
    if (!open) {
      return
    }
    const closeOnOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="dropdown" ref={containerRef}>
      <button
        type="button"
        className={`${triggerClassName}${active ? ' is-active' : ''}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open && (
        <div id={panelId} ref={panelRef} className="dropdown-panel" style={position ?? HIDDEN_UNTIL_PLACED}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
