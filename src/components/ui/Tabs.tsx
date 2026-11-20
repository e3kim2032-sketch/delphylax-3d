import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

export interface TabDef {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

/**
 * A card with tabs: only one panel shows at a time, which keeps long sections short.
 * Keyboard: Left / Right move between tabs, Home / End jump to the first / last.
 */
export function Tabs({ tabs, label, className = '', panelClassName = 'card-pad' }: { tabs: TabDef[]; label: string; className?: string; panelClassName?: string }) {
  const [active, setActive] = useState(tabs[0].id)
  const base = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, tabs.findIndex((t) => t.id === active))
  const current = tabs[index]

  const onKey = (e: KeyboardEvent) => {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    else return
    e.preventDefault()
    setActive(tabs[next].id)
    buttons.current[next]?.focus()
  }

  return (
    <div className={`card ${className}`}>
      <div role="tablist" aria-label={label} className="tab-list" onKeyDown={onKey}>
        {tabs.map((t, i) => {
          const on = t.id === current.id
          return (
            <button
              key={t.id}
              ref={(el) => {
                buttons.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              className="tab"
              onClick={() => setActive(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${base}-panel-${current.id}`} aria-labelledby={`${base}-tab-${current.id}`} className={panelClassName}>
        {current.content}
      </div>
    </div>
  )
}
