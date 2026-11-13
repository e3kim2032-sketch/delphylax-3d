import { useState } from 'react'
import { CRISIS } from '../../data/research'
import { SectionShell, Kicker, Title, Accent, Reveal, SimTag } from '../ui/primitives'

const TEAL = '#4dd4c6'
const TEAL_DIM = '#2a8f85'

/** Camera vs sonar in muddy water, with a drag-to-compare divider. Simulated. */
function VisibilityCompare() {
  const [split, setSplit] = useState(50)
  const W = 640
  const H = 400
  return (
    <figure className="card overflow-hidden">
      <div className="relative" style={{ aspectRatio: `${W}/${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
          <defs>
            <filter id="mud">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0.9 0" />
            </filter>
            <radialGradient id="torch" cx="0.1" cy="0.5" r="0.45">
              <stop offset="0%" stopColor="#8a7a55" stopOpacity="0.55" />
              <stop offset="35%" stopColor="#4a3f2a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sonarbg" cx="0.08" cy="0.5" r="1">
              <stop offset="0%" stopColor="#0c2a2c" />
              <stop offset="100%" stopColor="#070d12" />
            </radialGradient>
            <clipPath id="sonarclip">
              <rect x={(split / 100) * W} y="0" width={W} height={H} />
            </clipPath>
          </defs>

          {/* camera side */}
          <rect width={W} height={H} fill="#070604" />
          <rect width={W} height={H} filter="url(#mud)" opacity="0.95" />
          <rect width={W} height={H} fill="url(#torch)" />
          <ellipse cx="86" cy="210" rx="22" ry="10" fill="#3a2f1c" opacity="0.5" />
          <text x="20" y={H - 22} fill="#cbbf9a" fontFamily="Inter, sans-serif" fontSize="14">
            Camera · sees about 0.2 m · nothing found
          </text>

          {/* sonar side */}
          <g clipPath="url(#sonarclip)">
            <rect width={W} height={H} fill="url(#sonarbg)" />
            {[60, 120, 180, 240, 300, 360, 420, 480, 540].map((r, i) => (
              <circle key={r} cx="40" cy={H / 2} r={r} fill="none" stroke={i % 2 ? TEAL_DIM : TEAL} strokeOpacity={0.4 - i * 0.03} strokeWidth="1.2" />
            ))}
            {[1, 2, 3, 4, 5].map((m) => (
              <g key={m}>
                <line x1={40 + m * 110} y1={H / 2 - 8} x2={40 + m * 110} y2={H / 2 + 8} stroke="#b7c3cc" strokeOpacity="0.7" />
                <text x={40 + m * 110} y={H / 2 + 26} fill="#b7c3cc" fontFamily="JetBrains Mono, monospace" fontSize="13" textAnchor="middle">
                  {m} m
                </text>
              </g>
            ))}
            {Array.from({ length: 70 }).map((_, i) => {
              const a = ((i * 137.5) % 120) - 60
              const d = 60 + ((i * 97) % 480)
              const x = 40 + Math.cos((a * Math.PI) / 180) * d
              const y = H / 2 + Math.sin((a * Math.PI) / 180) * d * 0.55
              return <circle key={i} cx={x} cy={y} r={1.4} fill={TEAL} opacity="0.35" />
            })}
            <g transform={`translate(${40 + 4.6 * 110}, ${H / 2 + 44})`}>
              <ellipse cx="0" cy="0" rx="34" ry="12" fill={TEAL} opacity="0.2" />
              <path d="M-24 2 C-18 -8 -6 -10 2 -6 L14 -8 C20 -9 24 -4 22 0 C18 4 10 4 4 4 L-20 6 Z" fill="#eef3f6" />
              <circle cx="20" cy="-7" r="6" fill="#eef3f6" />
              <rect x="-40" y="-22" width="80" height="34" fill="none" stroke={TEAL} strokeWidth="1.2" strokeDasharray="6 4" />
              <text x="0" y="-30" fill={TEAL} fontFamily="JetBrains Mono, monospace" fontSize="13" textAnchor="middle">
                echo · 4.6 m
              </text>
            </g>
            <text x={W - 20} y={H - 22} fill="#b7c3cc" fontFamily="Inter, sans-serif" fontSize="14" textAnchor="end">
              Sonar · 1 object found
            </text>
          </g>

          <line x1={(split / 100) * W} y1="0" x2={(split / 100) * W} y2={H} stroke="#eef3f6" strokeWidth="2" />
        </svg>
        <input
          type="range"
          min={2}
          max={98}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label="Compare the camera view with the sonar view"
          className="absolute inset-x-0 bottom-14 mx-auto w-[94%] cursor-ew-resize"
        />
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-[#b7c3cc]">
        <span>Drag to compare a camera with sonar in muddy water</span>
        <SimTag />
      </figcaption>
    </figure>
  )
}

export function Problem() {
  return (
    <SectionShell id="problem">
      <div className="pointer-events-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Reveal>
            <Kicker index="02">The problem</Kicker>
            <Title>
              Rescuers go in <Accent>blind.</Accent>
            </Title>
          </Reveal>
          <Reveal delay={1}>
            <div className="card mt-10 inline-block min-w-64 px-7 py-6">
              <div className="font-mono text-6xl font-semibold leading-none text-[#eef3f6]">{CRISIS.livesLost}</div>
              <div className="mt-3 max-w-xs text-base leading-snug text-[#b7c3cc]">
                lives lost when water trapped a family in a Seoul semi-basement, {CRISIS.event.split(', ')[1]}
              </div>
              <div className="mt-3 text-xs text-[#b7c3cc]">
                {CRISIS.summaryNote}: {CRISIS.sources.slice(0, 2).join('; ')}
              </div>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#eef3f6]/90">
              {CRISIS.lines[0]} {CRISIS.lines[1]}
            </p>
          </Reveal>
        </div>
        <Reveal delay={2}>
          <VisibilityCompare />
        </Reveal>
      </div>
    </SectionShell>
  )
}
