import { useId } from 'react'

/**
 * DELPHYLAX logo — vectorized from the hand-drawn sketch.
 *
 * The sketch reads as three elements:
 *   1. A dolphin dorsal fin: convex leading edge, concave trailing edge, swept tip (the blue shape).
 *   2. Two concentric sonar arcs nested behind the fin, radiating up-right.
 *   3. A burst of five droplets at the top right — the splash / acoustic return.
 *
 * Proportions follow the golden ratio: the mark sits in a 100×100 box, the
 * swoosh occupies the left φ⁻¹ (≈61.8) of the width, and the arc radii step by φ.
 */

interface MarkProps {
  size?: number
  className?: string
  animated?: boolean
  title?: string
}

const R1 = 20
const R2 = R1 * 1.618 // ≈ 32
const CX = 60
const CY = 94

function arcPath(r: number, a0: number, a1: number) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x0 = CX + r * Math.cos(toRad(a0))
  const y0 = CY + r * Math.sin(toRad(a0))
  const x1 = CX + r * Math.cos(toRad(a1))
  const y1 = CY + r * Math.sin(toRad(a1))
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

// dorsal fin: base along y≈93, leading edge sweeps up-right to the tip, trailing edge falls concave
const SWOOSH =
  'M 6 93 C 10 62, 26 28, 50 9 C 55 5, 60 3, 64 4 C 58 22, 55 48, 60 70 C 61.5 78, 64 86, 68 93 Z'

const DROPS = [
  { angle: -158, len: 13, s: 0.85 },
  { angle: -118, len: 16, s: 1 },
  { angle: -78, len: 17, s: 1.05 },
  { angle: -36, len: 15, s: 0.95 },
  { angle: 4, len: 12, s: 0.8 },
]
const BURST = { x: 82, y: 30 }

export function DelphylaxMark({ size = 40, className = '', animated = true, title = 'Delphylax' }: MarkProps) {
  const id = useId().replace(/:/g, '')
  const grad = `dlx-grad-${id}`
  const gradArc = `dlx-arc-${id}`
  const glow = `dlx-glow-${id}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`dlx-mark ${animated ? 'dlx-animated' : ''} ${className}`}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0%" stopColor="#2f6fb0" />
          <stop offset="100%" stopColor="#5aa0e0" />
        </linearGradient>
        <linearGradient id={gradArc} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8654f" />
          <stop offset="100%" stopColor="#ff9a85" />
        </linearGradient>
        <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* swoosh / dolphin fin */}
      <path d={SWOOSH} fill={`url(#${grad})`} />

      {/* sonar arcs */}
      <g
        className="dlx-arcs"
        fill="none"
        stroke={`url(#${gradArc})`}
        strokeLinecap="round"
        filter={`url(#${glow})`}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      >
        <path className="dlx-arc dlx-arc-1" d={arcPath(R1, -78, -6)} strokeWidth="6.5" />
        <path className="dlx-arc dlx-arc-2" d={arcPath(R2, -74, -4)} strokeWidth="5.5" />
      </g>

      {/* burst — crimson accents */}
      <g className="dlx-burst" style={{ transformOrigin: `${BURST.x}px ${BURST.y}px` }}>
        {DROPS.map((d, i) => {
          const rad = (d.angle * Math.PI) / 180
          const cx = BURST.x + Math.cos(rad) * (d.len * 0.62)
          const cy = BURST.y + Math.sin(rad) * (d.len * 0.62)
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={2.6 * d.s}
              ry={d.len * 0.42}
              transform={`rotate(${d.angle + 90} ${cx} ${cy})`}
              fill={i === 2 ? '#e8654f' : i === 1 || i === 3 ? '#ff8a73' : '#ff8a73'}
              className="dlx-drop"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          )
        })}
        <circle cx={BURST.x} cy={BURST.y} r="2.1" fill="#f3ede1" />
      </g>

      <style>{`
        .dlx-mark .dlx-arc { transition: opacity .3s; }
        .dlx-animated:hover .dlx-arc-1 { animation: dlx-arc 1.6s ease-out infinite; }
        .dlx-animated:hover .dlx-arc-2 { animation: dlx-arc 1.6s ease-out .35s infinite; }
        .dlx-animated:hover .dlx-drop { animation: dlx-drop 1.6s ease-in-out infinite; }
        @keyframes dlx-arc {
          0% { stroke-dasharray: 0 400; opacity: 0; }
          20% { opacity: 1; }
          100% { stroke-dasharray: 400 0; opacity: 1; }
        }
        @keyframes dlx-drop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
      `}</style>
    </svg>
  )
}

interface LockupProps {
  height?: number
  className?: string
  subtitle?: boolean
}

/**
 * Full lockup: mark + custom geometric wordmark.
 * The wordmark is drawn with SVG paths built from a modular geometric grid
 * (stroke-based letterforms with rounded terminals), so it renders identically
 * on every platform without a font dependency.
 */
export function DelphylaxLockup({ height = 44, className = '', subtitle = true }: LockupProps) {
  const id = useId().replace(/:/g, '')
  const grad = `dlx-word-${id}`
  const w = height * 7.6
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} style={{ height }}>
      <DelphylaxMark size={height} />
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
          <text
            x="6"
            y="42"
            fill="#7aa2ff"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="8.5"
            letterSpacing="3.2"
          >
            DOLPHIN GUARDIAN · AMPHIBIOUS SAR
          </text>
        )}
      </svg>
    </div>
  )
}

export default DelphylaxMark
