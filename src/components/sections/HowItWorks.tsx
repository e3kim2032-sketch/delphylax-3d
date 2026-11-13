import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Radio, ChevronDown, Anchor, FlaskConical, History } from 'lucide-react'
import { useSiteStore } from '../../store/useSiteStore'
import { HOW_IT_WORKS, HOW_SUMMARY, HULL, SPECS, TIMELINE, PIVOT_REASON, WATER_TEST, buoyancy, hullSpeed } from '../../data/research'
import { SectionShell, Kicker, Title, Accent, Lead, Reveal } from '../ui/primitives'

/* ---------- More details: hull calculator ---------- */
function BuoyancyChart({ payload }: { payload: number }) {
  const b = buoyancy(payload)
  const rows = [
    { label: 'Hull', value: HULL.weightKg, color: '#5b8fb8' },
    { label: 'Load', value: b.mass, color: '#e8654f' },
    { label: 'Float', value: HULL.capacityKg, color: '#7fb3d5' },
  ]
  const W = 420
  const H = 136
  const padL = 56
  const max = 18
  const sx = (v: number) => padL + (Math.min(max, v) / max) * (W - padL - 14)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Boat weight and payload versus floating capacity">
      {[0, 3, 6, 9, 12, 15, 18].map((g) => (
        <g key={g}>
          <line x1={sx(g)} y1={8} x2={sx(g)} y2={H - 22} stroke="rgba(255,255,255,0.08)" />
          <text x={sx(g)} y={H - 6} fill="#b7c3cc" fontSize="13" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            {g}
          </text>
        </g>
      ))}
      <line x1={sx(HULL.capacityKg)} y1={6} x2={sx(HULL.capacityKg)} y2={H - 22} stroke="#eef3f6" strokeOpacity="0.6" strokeDasharray="3 3" />
      {rows.map((r, i) => {
        const y = 30 + i * 32
        return (
          <g key={r.label}>
            <text x={padL - 8} y={y + 5} fill="#b7c3cc" fontSize="13" fontFamily="Inter, sans-serif" textAnchor="end">
              {r.label}
            </text>
            <rect x={padL} y={y - 6} width={Math.max(2, sx(r.value) - padL)} height={12} rx={4} fill={r.color} />
            <text x={sx(r.value) + 6} y={y + 5} fill="#eef3f6" fontSize="13" fontFamily="JetBrains Mono, monospace">
              {r.label === 'Float' ? `about ${r.value}` : r.value.toFixed(1)} kg
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function HullLab() {
  const [payload, setPayload] = useState(2)
  const b = useMemo(() => buoyancy(payload), [payload])
  const vHull = hullSpeed(HULL.waterlineLengthM)
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#eef3f6]">
          <FlaskConical size={15} /> Hull calculator
        </span>
        <span className="font-mono text-sm text-[#b7c3cc]">{b.used < 0.85 ? `${Math.round((1 - b.used) * 100)}% reserve` : 'Overloaded'}</span>
      </div>
      <label className="block text-sm text-[#b7c3cc]">
        Payload <span className="font-mono text-[#eef3f6]">{payload.toFixed(1)} kg</span>
        <input type="range" min={0} max={12} step={0.5} value={payload} onChange={(e) => setPayload(Number(e.target.value))} className="mt-3 w-full" aria-label="Payload" />
      </label>
      <div className="mt-4">
        <BuoyancyChart payload={payload} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-[#b7c3cc]">Pipes submerged</div>
          <div className="font-mono text-[#eef3f6]">{Math.round(b.used * 100)}%</div>
        </div>
        <div>
          <div className="text-[#b7c3cc]">Hull speed</div>
          <div className="font-mono text-[#eef3f6]">{vHull.toFixed(2)} m/s</div>
        </div>
        <div>
          <div className="text-[#b7c3cc]">Drag at 1 m/s</div>
          <div className="font-mono text-[#eef3f6]">{HULL.dragKgfAt1ms} kgf</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#b7c3cc]">
        The boat floats about three times its own weight, but a 0.9 m hull is capped near {vHull.toFixed(1)} m/s, so it suits slow street floods, not fast rivers. Speed, drag and
        thrust are estimates until the first water test.
      </p>
    </div>
  )
}

function Specs() {
  return (
    <div className="card p-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#eef3f6]">
        <Anchor size={15} /> Specifications
      </div>
      <table className="w-full text-left text-sm">
        <tbody>
          {SPECS.map((s) => (
            <tr key={s.spec} className="border-t border-[#28343c]">
              <td className="py-2 pr-3 text-[#b7c3cc]">{s.spec}</td>
              <td className="py-2 font-mono text-[#eef3f6]">
                {s.value}
                {s.estimate && <span className="ml-2 text-xs text-[#b7c3cc]">est.</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Versions() {
  return (
    <div className="card p-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#eef3f6]">
        <History size={15} /> From Floodscout to Delphylax
      </div>
      <p className="mb-4 text-sm leading-relaxed text-[#b7c3cc]">{PIVOT_REASON}</p>
      <ol className="hide-scrollbar max-h-64 space-y-3 overflow-y-auto border-l border-[#28343c] pl-4">
        {TIMELINE.map((t, i) => (
          <li key={i}>
            <div className="text-sm font-semibold text-[#eef3f6]">
              <span className="mr-2 font-mono text-xs font-normal text-[#b7c3cc]">{t.date}</span>
              {t.version}
            </div>
            <div className="text-sm text-[#b7c3cc]">{t.change}</div>
          </li>
        ))}
      </ol>
      <div className="mt-4 border-t border-[#28343c] pt-3">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#b7c3cc]">First water test · what we will measure</div>
        {WATER_TEST.map((w) => (
          <div key={w.test} className="flex justify-between gap-3 py-0.5 text-sm">
            <span className="text-[#eef3f6]">{w.test}</span>
            <span className="text-right text-[#b7c3cc]">{w.measure}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Section ---------- */
export function HowItWorks() {
  const selected = useSiteStore((s) => s.selectedSubsystem)
  const select = useSiteStore((s) => s.selectSubsystem)
  const openSandbox = useSiteStore((s) => s.openSandbox)
  const [more, setMore] = useState(false)

  return (
    <SectionShell id="how" className="!items-start">
      <div className="pointer-events-auto w-full max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,440px)_1fr]">
          <div>
            <Reveal>
              <Kicker index="03">How it works</Kicker>
              <Title>
                Listen, <Accent>don’t look.</Accent>
              </Title>
              <Lead>{HOW_SUMMARY}</Lead>
            </Reveal>

            {/* phones: leave room so the labelled boat shows between the text and the parts list */}
            <div className="h-[44vh] lg:hidden" aria-hidden />

            <Reveal delay={1}>
              <ol className="mt-8 space-y-2">
                {HOW_IT_WORKS.map((p, i) => {
                  const open = selected === p.id
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => select(open ? null : p.id)}
                        className="glass hud-corner w-full px-4 py-3 text-left transition-all hover:translate-x-1"
                        style={{ borderColor: open ? p.color : undefined, boxShadow: open ? `0 0 24px ${p.color}44` : undefined }}
                        aria-expanded={open}
                      >
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[#b7c3cc]">{String(i + 1).padStart(2, '0')}</span>
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                          <span className="flex-1">
                            <span className="block text-base font-semibold text-[#eef3f6]">{p.name}</span>
                            <span className="block text-sm text-[#b7c3cc]">{p.short}</span>
                          </span>
                          <ChevronDown size={16} className={`text-[#b7c3cc] transition-transform ${open ? 'rotate-180' : ''}`} />
                        </span>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="block overflow-hidden">
                              <span className="mt-3 block border-t border-[#28343c] pt-3 text-base leading-relaxed text-[#eef3f6]/90">{p.body}</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </Reveal>

            <Reveal delay={2}>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn-primary" onClick={openSandbox}>
                  <Radio size={16} /> Try the sonar
                </button>
                <button className="btn-secondary" onClick={() => setMore((v) => !v)} aria-expanded={more}>
                  More details <ChevronDown size={16} className={`transition-transform ${more ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </Reveal>
          </div>

          {/* the labelled 3D diagram lives in the canvas behind this column */}
          <div className="hidden lg:block" />
        </div>

        <AnimatePresence initial={false}>
          {more && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden">
              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                <HullLab />
                <Specs />
                <Versions />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionShell>
  )
}
