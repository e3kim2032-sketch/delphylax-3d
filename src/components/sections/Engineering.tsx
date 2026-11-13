import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layers, Lightbulb, Anchor, FlaskConical, History } from 'lucide-react'
import { useSiteStore } from '../../store/useSiteStore'
import { HOW_IT_WORKS, HULL, SPECS, TIMELINE, PIVOT_REASON, WATER_TEST, BIOACOUSTICS, CONTROL_MODE, buoyancy, hullSpeed } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'

/** Buoyancy chart — one measure (kg) against the two-pipe capacity line. */
function BuoyancyChart({ payload }: { payload: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const b = buoyancy(payload)
  const rows = [
    { label: 'HULL', value: HULL.weightKg, note: 'Boat weight, about 5 kg (estimate, to be weighed)', color: '#5b8fb8' },
    { label: 'LOAD', value: b.mass, note: `Boat + ${payload.toFixed(1)} kg payload = ${b.mass.toFixed(1)} kg`, color: b.used > 0.85 ? '#e8654f' : '#e8654f' },
    { label: 'FLOAT', value: HULL.capacityKg, note: `Two sealed pipes hold about ${HULL.pipeVolumeL} L each ≈ ${HULL.capacityKg} kg`, color: '#7fb3d5' },
  ]
  const W = 420
  const H = 136
  const padL = 48
  const max = 18
  const sx = (v: number) => padL + (Math.min(max, v) / max) * (W - padL - 14)
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Boat weight and payload versus floating capacity">
        {[0, 3, 6, 9, 12, 15, 18].map((g) => (
          <g key={g}>
            <line x1={sx(g)} y1={8} x2={sx(g)} y2={H - 22} stroke="rgba(255,255,255,0.08)" />
            <text x={sx(g)} y={H - 8} fill="rgba(255,255,255,0.68)" fontSize="13" fontFamily="JetBrains Mono" textAnchor="middle">
              {g}
            </text>
          </g>
        ))}
        <line x1={sx(HULL.capacityKg)} y1={6} x2={sx(HULL.capacityKg)} y2={H - 22} stroke="rgba(56,189,248,0.8)" strokeDasharray="3 3" />
        <text x={sx(HULL.capacityKg) - 4} y={14} fill="rgba(255,255,255,0.72)" fontSize="13" fontFamily="JetBrains Mono" textAnchor="end">
          CAPACITY {HULL.capacityKg} kg
        </text>
        {rows.map((r, i) => {
          const y = 30 + i * 32
          return (
            <g key={r.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={0} y={y - 12} width={W} height={28} fill="transparent" />
              <text x={padL - 8} y={y + 4} fill="rgba(255,255,255,0.75)" fontSize="13" fontFamily="JetBrains Mono" textAnchor="end">
                {r.label}
              </text>
              <rect x={padL} y={y - 6} width={Math.max(2, sx(r.value) - padL)} height={12} rx={4} fill={r.color} opacity={hover === null || hover === i ? 1 : 0.45} />
              <text x={sx(r.value) + 6} y={y + 4} fill="#fff" fontSize="13" fontFamily="JetBrains Mono">
                {r.label === 'FLOAT' ? `about ${r.value}` : r.value.toFixed(1)} kg
              </text>
            </g>
          )
        })}
      </svg>
      <AnimatePresence>
        {hover !== null && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-strong pointer-events-none absolute right-0 top-0 max-w-[260px] rounded-md px-3 py-2 font-mono text-xs text-white/85">
            {rows[hover].note}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HullLab() {
  const [payload, setPayload] = useState(2)
  const b = useMemo(() => buoyancy(payload), [payload])
  const vHull = hullSpeed(HULL.waterlineLengthM)
  return (
    <div className="glass-strong hud-corner rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-xs text-[#aab8c2] ">
          <FlaskConical size={11} /> Hull lab · buoyancy & hull speed
        </span>
        <span className={`font-mono text-xs ${b.used < 0.85 ? 'text-[#7fb3d5]' : 'text-[#ff6b57]'}`}>
          {b.used < 0.85 ? `${Math.round((1 - b.used) * 100)}% RESERVE` : 'OVERLOADED'}
        </span>
      </div>
      <label className="text-xs text-white/72">
        <span className="font-mono ">
          Payload · <span className="text-white">{payload.toFixed(1)} kg</span>
        </span>
        <input type="range" min={0} max={12} step={0.5} value={payload} onChange={(e) => setPayload(Number(e.target.value))} className="mt-3 w-full" aria-label="Payload" />
      </label>
      <div className="mt-3">
        <BuoyancyChart payload={payload} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs">
        <div>
          <div className="text-white/60">PIPES SUBMERGED</div>
          <div className="text-white">{Math.round(b.used * 100)}%</div>
        </div>
        <div>
          <div className="text-white/60">HULL SPEED</div>
          <div className="text-white">
            {vHull.toFixed(2)} m/s <span className="text-white/60">est.</span>
          </div>
        </div>
        <div>
          <div className="text-white/60">DRAG @ 1 m/s</div>
          <div className="text-white">
            {HULL.dragKgfAt1ms} kgf <span className="text-white/60">est.</span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#b9c4cc]">
        The boat floats about three times its own weight, but a 0.9 m displacement hull is capped near 1.25·√L ≈ {vHull.toFixed(1)} m/s, so it suits slow street floods, not
        fast rivers. Thrust (0.4–1.0 kgf per thruster) is an estimate until it is tied to a scale.
      </p>
    </div>
  )
}

export function Engineering() {
  const explodedOn = useSiteStore((s) => s.explodedOn)
  const toggleExploded = useSiteStore((s) => s.toggleExploded)
  const lights = useSiteStore((s) => s.lights)
  const toggleLights = useSiteStore((s) => s.toggleLights)
  const selected = useSiteStore((s) => s.selectedSubsystem)
  const select = useSiteStore((s) => s.selectSubsystem)
  const current = HOW_IT_WORKS.find((s) => s.id === selected)

  return (
    <SectionShell id="engineering" className="!items-start">
      <div className="pointer-events-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,340px)_1fr_minmax(0,380px)] [&>*]:min-w-0">
        <div>
          <Reveal>
            <Kicker index="03">Biomimicry & engineering</Kicker>
            <Title>
              Listen, <span className="text-gradient">don’t look.</span>
            </Title>
            <p className="mt-4 text-sm leading-relaxed text-[#d7dde3]">{BIOACOUSTICS.principle}</p>
            <p className="mt-3 text-sm leading-relaxed text-[#d7dde3]">{CONTROL_MODE}</p>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="toggle" data-active={explodedOn} onClick={() => toggleExploded()}>
                <Layers size={13} /> X-Ray / Exploded View
              </button>
              <button className="toggle" data-active={lights} onClick={() => toggleLights()}>
                <Lightbulb size={13} /> Searchlights
              </button>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <ul className="mt-6 space-y-2">
              {HOW_IT_WORKS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      select(selected === s.id ? null : s.id)
                      if (!explodedOn) toggleExploded(true)
                    }}
                    className="glass hud-corner flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all hover:translate-x-1"
                    style={{ borderColor: selected === s.id ? s.color : undefined, boxShadow: selected === s.id ? `0 0 24px ${s.color}44` : undefined }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                    <span className="flex-1">
                      <span className="block font-display text-sm font-700 text-white">{s.name}</span>
                      <span className="block font-mono text-xs text-white/65 ">{s.short}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-strong mt-4 rounded-md p-4" style={{ borderColor: `${current.color}88` }}>
                <div className="font-mono text-xs " style={{ color: current.color }}>
                  {current.short}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#f3ede1]/85">{current.body}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden lg:block" />

        <div className="space-y-4">
          <Reveal delay={1}>
            <HullLab />
          </Reveal>
          <Reveal delay={2}>
            <div className="glass hud-corner rounded-lg p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs text-[#aab8c2] ">
                <Anchor size={11} /> Specifications
              </div>
              <table className="w-full text-left text-xs">
                <tbody>
                  {SPECS.map((s) => (
                    <tr key={s.spec} className="border-t border-white/8">
                      <td className="py-1.5 pr-2 text-[#b9c4cc]">{s.spec}</td>
                      <td className="py-1.5 pr-2 font-mono text-white">{s.value}</td>
                      <td className="py-1.5 text-xs text-white/60">
                        {s.estimate && <span className="mr-1 text-[#ffb4a6]">est.</span>}
                        {s.how}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={3}>
            <div className="glass hud-corner rounded-lg p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-xs text-[#aab8c2] ">
                  <History size={11} /> From Floodscout to Delphylax
                </span>
                <span className="chip" style={{ color: '#ffb4a6', borderColor: 'rgba(255,107,87,0.4)', background: 'rgba(255,107,87,0.1)' }}>
                  First water test pending
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-[#b9c4cc]">{PIVOT_REASON}</p>
              <ol className="relative ml-2 max-h-56 space-y-2 overflow-y-auto border-l border-white/10 pl-4 pr-1 hide-scrollbar">
                {TIMELINE.map((t, i) => (
                  <li key={i} className="relative">
                    <span
                      className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full"
                      style={{
                        background: t.state === 'active' ? '#ff2d55' : t.state === 'dropped' ? '#475569' : '#5b8fb8',
                        boxShadow: t.state === 'active' ? '0 0 8px #ff2d55' : t.state === 'dropped' ? 'none' : '0 0 8px #5b8fb8',
                      }}
                    />
                    <div className="font-display text-sm font-700 text-white">
                      <span className="mr-2 font-mono text-xs text-[#aab8c2]">{t.date}</span>
                      {t.version}
                    </div>
                    <div className="text-xs text-[#b9c4cc]">{t.change}</div>
                  </li>
                ))}
              </ol>
              <div className="mt-3 border-t border-white/10 pt-2">
                <div className="mb-1 font-mono text-xs text-white/60 ">First water test · what we will measure</div>
                {WATER_TEST.map((w) => (
                  <div key={w.test} className="flex justify-between gap-3 py-0.5 text-xs">
                    <span className="text-white">{w.test}</span>
                    <span className="text-right text-[#b9c4cc]">{w.measure}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  )
}
