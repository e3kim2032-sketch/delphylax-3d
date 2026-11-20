import { useState } from 'react'
import { Droplets, Moon, AlertTriangle, EyeOff, MapPinned, CalendarDays } from 'lucide-react'
import { CRISIS, INCIDENTS, INCIDENTS_NOTE, FVI, BUSINESS } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal, SimTag, SourceLink } from '../ui/primitives'
import { Tabs } from '../ui/Tabs'

const ICONS = [Droplets, Moon, AlertTriangle, EyeOff]

function VisibilityCompare() {
  const [split, setSplit] = useState(50)
  const W = 640
  const H = 360
  return (
    <div className="card card-pad">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <span className="label">Camera in muddy water · 0.2 m</span>
        <span className="label flex items-center gap-2 !text-[#ff8a73]">
          Sonar, under water <SimTag />
        </span>
      </div>
      <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: `${W}/${H}` }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Simulated comparison. Left: a camera in muddy flood water sees about 0.2 metres and finds nothing. Right: sonar shows one object 4.6 metres away."
        >
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
              <stop offset="0%" stopColor="#0b1d4d" />
              <stop offset="100%" stopColor="#030712" />
            </radialGradient>
            <clipPath id="sonarclip">
              <rect x={(split / 100) * W} y="0" width={W} height={H} />
            </clipPath>
          </defs>

          {/* optical layer */}
          <rect width={W} height={H} fill="#070604" />
          <rect width={W} height={H} filter="url(#mud)" opacity="0.95" />
          <rect width={W} height={H} fill="url(#torch)" />
          {/* faint shape barely visible at 0.2 m */}
          <ellipse cx="86" cy="190" rx="22" ry="10" fill="#3a2f1c" opacity="0.5" />
          <text x="18" y="340" fill="#9c8f6a" fontFamily="JetBrains Mono" fontSize="13" letterSpacing="2">
            VISIBILITY 0.2 m · TARGET NOT FOUND
          </text>

          {/* sonar layer */}
          <g clipPath="url(#sonarclip)">
            <rect width={W} height={H} fill="url(#sonarbg)" />
            {[60, 120, 180, 240, 300, 360, 420, 480, 540].map((r, i) => (
              <circle key={r} cx="40" cy={H / 2} r={r} fill="none" stroke={i % 2 ? '#e8654f' : '#5b8fb8'} strokeOpacity={0.35 - i * 0.025} strokeWidth="1.2" />
            ))}
            {[1, 2, 3, 4, 5].map((m) => (
              <g key={m}>
                <line x1={40 + m * 110} y1={H / 2 - 8} x2={40 + m * 110} y2={H / 2 + 8} stroke="#aab8c2" strokeOpacity="0.6" />
                <text x={40 + m * 110} y={H / 2 + 24} fill="#aab8c2" fontFamily="JetBrains Mono" fontSize="13" textAnchor="middle">
                  {m}m
                </text>
              </g>
            ))}
            {/* debris speckles (rejected by sparsity filter) */}
            {Array.from({ length: 70 }).map((_, i) => {
              const a = ((i * 137.5) % 120) - 60
              const d = 60 + ((i * 97) % 480)
              const x = 40 + Math.cos((a * Math.PI) / 180) * d
              const y = H / 2 + Math.sin((a * Math.PI) / 180) * d * 0.55
              return <circle key={i} cx={x} cy={y} r={1.4} fill="#7fb3d5" opacity="0.35" />
            })}
            {/* human target at 14.2 m */}
            <g transform={`translate(${40 + 4.6 * 110}, ${H / 2 + 36})`}>
              <ellipse cx="0" cy="0" rx="34" ry="12" fill="#ff2d55" opacity="0.18" />
              <path d="M-24 2 C-18 -8 -6 -10 2 -6 L14 -8 C20 -9 24 -4 22 0 C18 4 10 4 4 4 L-20 6 Z" fill="#ff2d55" />
              <circle cx="20" cy="-7" r="6" fill="#ff2d55" />
              <rect x="-40" y="-22" width="80" height="34" fill="none" stroke="#ff2d55" strokeWidth="1.2" strokeDasharray="6 4" />
              <text x="0" y="-28" fill="#ffb4a6" fontFamily="JetBrains Mono" fontSize="13" textAnchor="middle" letterSpacing="1.5">
                SIMULATED · SONAR ECHO · 4.6 m · 98.4%
              </text>
            </g>
            <text x={W - 18} y="340" fill="#aab8c2" fontFamily="JetBrains Mono" fontSize="13" letterSpacing="2" textAnchor="end">
              ECHO FILTER ON · 1 OBJECT FOUND
            </text>
          </g>

          {/* divider */}
          <line x1={(split / 100) * W} y1="0" x2={(split / 100) * W} y2={H} stroke="#fff" strokeWidth="2" />
        </svg>
        <input
          type="range"
          min={2}
          max={98}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label="Compare optical camera and sonar"
          className="absolute inset-x-0 bottom-3 mx-auto w-[94%] cursor-ew-resize"
        />
      </div>
    </div>
  )
}

/** Real past floods, oldest first, each with linked sources. One shows at a time. */
function IncidentTimeline() {
  const [picked, setPicked] = useState(0)
  const inc = INCIDENTS[picked]
  return (
    <div>
      <h3 className="font-display text-xl font-700 leading-tight text-[#f3ede1]">Three floods where rescuers could not see or reach people</h3>
      <div className="relative mt-4 grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Choose a flood">
        {INCIDENTS.map((x, k) => {
          const on = k === picked
          return (
            <button
              key={x.date}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(k)}
              className="card-action rounded-[10px] border px-3 py-2 text-left"
              style={{ borderColor: on ? '#e8654f' : '#2a3740', background: on ? 'rgba(232,101,79,0.14)' : 'rgba(15,21,25,0.55)' }}
            >
              <span className="block font-mono text-xs text-[#ff8a73]">{x.date}</span>
              <span className="mt-0.5 block font-display text-base font-700 text-white">{x.place.split(' · ')[0]}</span>
            </button>
          )
        })}
      </div>
      <article className="mt-5 grid gap-x-10 gap-y-3 md:grid-cols-2" aria-live="polite">
        <div>
          <h4 className="font-display text-lg font-700 text-white">{inc.place}</h4>
          <p className="mt-2 text-base leading-relaxed text-[#eef3f6]/90">{inc.what}</p>
        </div>
        <div>
          <p className="text-base leading-relaxed text-[#c3ced6]">
            <span className="font-semibold text-[#eef3f6]">Why rescuers could not see or reach them: </span>
            {inc.why}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#aab8c2]">
            <span>Sources:</span>
            {inc.sources.map((src) => (
              <SourceLink key={src.href} href={src.href}>
                {src.label}
              </SourceLink>
            ))}
          </p>
        </div>
      </article>
      <p className="mt-5 border-t border-white/10 pt-4 text-base leading-relaxed text-[#c3ced6]">{INCIDENTS_NOTE}</p>
    </div>
  )
}

/** Luna's Flood Vulnerability Index: which neighbourhoods to search first. */
function FviCard() {
  const luna = BUSINESS.team.find((m) => m.name === 'Luna')
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-700 text-[#f3ede1]">Flood Vulnerability Index: where to search first</h3>
        {luna && <span className="chip">{luna.name} · FVI program developer</span>}
      </div>
      <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <div className="font-mono text-xs text-[#ff8a73]">What it is</div>
          <p className="mt-1 text-base leading-relaxed text-[#eef3f6]/90">{FVI.what}</p>
        </div>
        <div>
          <div className="font-mono text-xs text-[#ff8a73]">What goes into it</div>
          <p className="mt-1 text-base leading-relaxed text-[#eef3f6]/90">{FVI.inputs}</p>
          <SourceLink href={FVI.source.href} className="mt-2 text-sm text-[#aab8c2]">
            {FVI.source.label}
          </SourceLink>
        </div>
        <div>
          <div className="font-mono text-xs text-[#ff8a73]">How it guides Delphylax</div>
          <p className="mt-1 text-base leading-relaxed text-[#eef3f6]/90">{FVI.use}</p>
        </div>
      </div>
    </div>
  )
}

function WhyDeadly() {
  return (
    <div>
      <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {CRISIS.whyDeadly.map((w, i) => {
          const Icon = ICONS[i]
          return (
            <li key={w.title}>
              <div className="flex items-center gap-2 font-display text-base font-700 text-white">
                <Icon size={16} className="shrink-0 text-[#ff8a73]" aria-hidden /> {w.title}
              </div>
              <p className="mt-1 text-base leading-relaxed text-[#c3ced6]">{w.body}</p>
            </li>
          )
        })}
      </ul>
      <p className="label mt-5">Monsoon window · {CRISIS.monsoonWindow} · every summer</p>
    </div>
  )
}

export function Crisis() {
  return (
    <SectionShell id="crisis" align="right">
      <div className="pointer-events-auto w-full max-w-6xl">
      <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <Reveal className="text-scrim">
            <Kicker index="02">The crisis & the muddy-water gap</Kicker>
            <Title className="lg:!text-[3.1rem]">
              The first <span className="text-gradient">minutes</span> are lost to blind water.
            </Title>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="card card-pad">
                <div className="font-mono text-4xl font-semibold text-white">{CRISIS.recordYears}</div>
                <div className="mt-2 text-base leading-snug text-[#dbe2e8]">years: {CRISIS.recordLabel}</div>
              </div>
              <div className="card card-pad" style={{ borderColor: 'rgba(255,107,87,0.4)' }}>
                <div className="font-mono text-4xl font-semibold text-[#ff6b57]">{CRISIS.livesLost}</div>
                <div className="mt-2 text-base leading-snug text-[#dbe2e8]">lives {CRISIS.livesLabel}</div>
              </div>
            </div>
            <div className="mt-6 border-l-2 border-[#e8654f] pl-4 text-base leading-relaxed text-[#eef3f6]">
              {CRISIS.summary}
              <div className="mt-2 text-sm text-[#aab8c2]">
                {CRISIS.event} · {CRISIS.summaryNote}:{' '}
                {CRISIS.sources.map((src, i) => (
                  <span key={src.href}>
                    {i > 0 && '; '}
                    <SourceLink href={src.href}>{src.label}</SourceLink>
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={2}>
          <VisibilityCompare />
          <p className="mt-4 text-base leading-relaxed text-[#c3ced6]">
            A rescuer wading in cannot see what is under the water, and tethered ROVs rely on cameras that struggle in muddy water. Delphylax floats
            in: sonar finds objects under the water, the AMG8833 heat sensor spots people at the surface, and it drops a glowing marker where rescuers should look.
          </p>
        </Reveal>
      </div>
      <Reveal>
        <Tabs
          className="mt-8"
          label="More about the problem"
          tabs={[
            { id: 'floods', label: 'Three floods', icon: <CalendarDays size={15} aria-hidden />, content: <IncidentTimeline /> },
            { id: 'why', label: 'Why floods are deadly', icon: <AlertTriangle size={15} aria-hidden />, content: <WhyDeadly /> },
            { id: 'fvi', label: 'Where to search first', icon: <MapPinned size={15} aria-hidden />, content: <FviCard /> },
          ]}
        />
      </Reveal>
      </div>
    </SectionShell>
  )
}
