import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layers, Lightbulb, Anchor, FlaskConical, History } from 'lucide-react'
import { useSiteStore, useLive3d } from '../../store/useSiteStore'
import { PARTS_LEGEND, HULL, SPECS, TIMELINE, PIVOT_REASON, WATER_TEST, BIOACOUSTICS, CONTROL_MODE, buoyancy, hullSpeed } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'
import { RescueConcept } from './RescueConcept'

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
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card pointer-events-none absolute right-0 top-0 max-w-[260px] px-3 py-2 font-mono text-xs text-white/85">
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
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 label">
          <FlaskConical size={11} /> Hull lab · buoyancy & hull speed
        </span>
        <span className={`font-mono text-xs ${b.used < 0.85 ? 'text-[#7fb3d5]' : 'text-[#ff6b57]'}`}>
          {b.used < 0.85 ? `${Math.round((1 - b.used) * 100)}% RESERVE` : 'OVERLOADED'}
        </span>
      </div>
      <label className="text-sm text-white/72">
        <span className="font-mono">
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
      <p className="mt-2 text-sm leading-relaxed text-[#c3ced6]">
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
  const selected = useSiteStore((s) => s.selectedPart)
  const live3d = useLive3d()
  const select = useSiteStore((s) => s.selectPart)

  return (
    <SectionShell id="engineering" className="!items-start">
      <div className="pointer-events-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,410px)_1fr_minmax(0,400px)] [&>*]:min-w-0">
        <div>
          <Reveal className="text-scrim">
            <Kicker index="03">Biomimicry & engineering</Kicker>
            <Title>
              Listen, <span className="text-gradient">don’t look.</span>
            </Title>
            <p className="mt-4 text-base leading-relaxed text-[#d7dde3]">{BIOACOUSTICS.principle}</p>
            <p className="mt-3 text-base leading-relaxed text-[#d7dde3]">{CONTROL_MODE}</p>
          </Reveal>
          {live3d && (
            <Reveal delay={1}>
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" className="btn-secondary btn-sm" aria-pressed={explodedOn} onClick={() => toggleExploded()}>
                  <Layers size={15} aria-hidden /> Exploded view
                </button>
                <button type="button" className="btn-secondary btn-sm" aria-pressed={lights} onClick={() => toggleLights()}>
                  <Lightbulb size={15} aria-hidden /> Searchlights
                </button>
              </div>
            </Reveal>
          )}
          <Reveal delay={2}>
            <h3 className="mt-7 font-display text-lg font-700 text-[#f3ede1]">Parts, by number</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#c3ced6]">
              {live3d
                ? 'The numbers match the pins on the exploded model. Pick a part to highlight it.'
                : 'Pick a part to read more. With Read mode off, the same numbers appear as pins on the exploded 3D model.'}
            </p>
            <ol className="mt-3 space-y-2">
              {PARTS_LEGEND.map((part, i) => {
                const on = selected === part.id
                return (
                  <li key={part.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        select(on ? null : part.id)
                        if (live3d && !on && !explodedOn) toggleExploded(true)
                      }}
                      className="card card-action flex w-full items-start gap-3 px-3.5 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8a73]"
                      style={{ borderColor: on ? part.color : undefined, boxShadow: on ? `0 0 24px ${part.color}44` : undefined }}
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold"
                        style={on ? { background: part.color, color: '#0f1519' } : { border: `1.5px solid ${part.color}`, color: '#fff' }}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-base font-700 text-white">
                          <span className="sr-only">{i + 1}. </span>
                          {part.name}
                        </span>
                        <span className="mt-0.5 block text-sm leading-snug text-[#c3ced6]">{part.does}</span>
                        {on && (
                          <span className="mt-2 block border-t border-white/10 pt-2 text-sm leading-relaxed text-[#c3ced6]">
                            <span className="font-semibold text-[#ff8a73]">Made of: </span>
                            {part.material}
                            {part.more && <span className="mt-1.5 block text-[#eef3f6]">{part.more}</span>}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </Reveal>
        </div>

        <div className="hidden lg:block" />

        <div className="space-y-4">
          <Reveal delay={1}>
            <HullLab />
          </Reveal>
          <Reveal delay={2}>
            <div className="card card-pad">
              <div className="mb-2 flex items-center gap-2 label">
                <Anchor size={11} /> Specifications
              </div>
              <dl className="divide-y divide-white/10">
                {SPECS.map((spec) => (
                  <div key={spec.spec} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 py-2.5">
                    <dt className="text-sm text-[#c3ced6]">{spec.spec}</dt>
                    <dd>
                      <div className="font-mono text-sm text-white">
                        {spec.value}
                        {spec.estimate && <span className="chip ml-2 !px-1.5 !py-0 !text-[#ffb4a6]">est.</span>}
                      </div>
                      <div className="mt-0.5 text-sm leading-snug text-[#aab8c2]">{spec.how}</div>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Reveal delay={3}>
            <div className="card card-pad">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 label">
                  <History size={11} /> From Floodscout to Delphylax
                </span>
                <span className="chip" style={{ color: '#ffb4a6', borderColor: 'rgba(255,107,87,0.4)', background: 'rgba(255,107,87,0.1)' }}>
                  First water test pending
                </span>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-[#c3ced6]">{PIVOT_REASON}</p>
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
                    <div className="font-display text-base font-700 text-white">
                      <span className="mr-2 font-mono text-xs text-[#aab8c2]">{t.date} </span>
                      {t.version}
                    </div>
                    <div className="text-sm text-[#c3ced6]">{t.change}</div>
                  </li>
                ))}
              </ol>
              <div className="mt-3 border-t border-white/10 pt-2">
                <div className="mb-1 font-mono text-xs text-white/60">First water test · what we will measure</div>
                {WATER_TEST.map((w) => (
                  <div key={w.test} className="flex justify-between gap-3 py-0.5 text-sm">
                    <span className="text-white">{w.test}</span>
                    <span className="text-right text-[#c3ced6]">{w.measure}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-3">
          <RescueConcept />
        </Reveal>
      </div>
    </SectionShell>
  )
}
