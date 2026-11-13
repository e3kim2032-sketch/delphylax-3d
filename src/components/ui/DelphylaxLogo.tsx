import { useId } from 'react'

/**
 * DELPHYLAX logo: the supplied artwork (public/logo.png, transparent PNG) —
 * blue dolphin head and fin, two coral sonar arcs, pink tail.
 */

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`
/** width / height of the trimmed artwork */
const LOGO_ASPECT = 1070 / 1030

interface MarkProps {
  size?: number
  className?: string
  animated?: boolean
  title?: string
}

export function DelphylaxMark({ size = 40, className = '', animated = true, title = 'Delphylax' }: MarkProps) {
  return (
    <img
      src={LOGO_SRC}
      alt={title}
      width={Math.round(size * LOGO_ASPECT)}
      height={size}
      draggable={false}
      className={`${animated ? 'transition-transform duration-300 hover:scale-105' : ''} ${className}`}
      style={{ height: size, width: 'auto', display: 'block' }}
    />
  )
}

interface LockupProps {
  height?: number
  className?: string
  subtitle?: boolean
}

/**
 * Full lockup: mark + geometric wordmark drawn as SVG strokes, so it renders
 * the same on every platform without a font dependency.
 */
export function DelphylaxLockup({ height = 44, className = '', subtitle = true }: LockupProps) {
  const id = useId().replace(/:/g, '')
  const grad = `dlx-word-${id}`
  const w = height * 7.6
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} style={{ height }}>
      <DelphylaxMark size={height} animated={false} />
      <svg height={height} width={w - height - 12} viewBox="0 0 300 44" role="img" aria-label="DELPHYLAX wordmark">
        <defs>
          <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#aab8c2" />
            <stop offset="60%" stopColor="#f3ede1" />
            <stop offset="100%" stopColor="#ffb4a6" />
          </linearGradient>
        </defs>
        <g fill="none" stroke={`url(#${grad})`} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round">
          {/* D */}
          <path d="M6 5 V29 M6 5 H14 A12 12 0 0 1 14 29 H6" />
          {/* E */}
          <path d="M38 5 V29 H54 M38 5 H54 M38 17 H51" />
          {/* L */}
          <path d="M64 5 V29 H80" />
          {/* P */}
          <path d="M90 29 V5 H100 A8 8 0 0 1 100 21 H90" />
          {/* H */}
          <path d="M118 5 V29 M136 5 V29 M118 17 H136" />
          {/* Y */}
          <path d="M146 5 L156 17 L166 5 M156 17 V29" />
          {/* L */}
          <path d="M178 5 V29 H194" />
          {/* A */}
          <path d="M202 29 L212 5 L222 29 M206 20 H218" />
          {/* X */}
          <path d="M232 5 L250 29 M250 5 L232 29" />
        </g>
        {subtitle && (
          <text x="6" y="42" fill="#7aa2ff" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" letterSpacing="3.2">
            DOLPHIN GUARDIAN · FLOOD RESCUE
          </text>
        )}
      </svg>
    </div>
  )
}

export default DelphylaxMark
