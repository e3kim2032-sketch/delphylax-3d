import { useEffect, useRef } from 'react'
import { Radio, Shuffle, Filter, Boxes, MapPin, RotateCcw } from 'lucide-react'
import { useSiteStore, MAX_MARKERS } from '../../store/useSiteStore'
import { SONAR } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'
import { sceneRefs } from '../canvas/sceneRefs'

function RevealMeter() {
  const bar = useRef<HTMLDivElement>(null)
  const txt = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let id = 0
    const loop = () => {
      id = requestAnimationFrame(loop)
      const r = Math.min(1, sceneRefs.reveal * 1.3)
      if (bar.current) bar.current.style.width = `${r * 100}%`
      if (txt.current) txt.current.textContent = `${(r * 100).toFixed(0)}%`
    }
    loop()
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-white/55 ">
        <span>Echo + heat return</span>
        <span ref={txt} className="text-white">
          0%
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div ref={bar} className="h-full rounded-full" style={{ width: '0%', background: 'linear-gradient(90deg,#3b9eff,#ff5fa2,#ff2d55)', transition: 'width 0.1s linear' }} />
      </div>
    </div>
  )
}

export function Sandbox() {
  const clutter = useSiteStore((s) => s.clutter)
  const setClutter = useSiteStore((s) => s.setClutter)
  const sparsity = useSiteStore((s) => s.sparsity)
  const toggleSparsity = useSiteStore((s) => s.toggleSparsity)
  const emitPing = useSiteStore((s) => s.emitPing)
  const rehide = useSiteStore((s) => s.rehideVictim)
  const lock = useSiteStore((s) => s.lock)
  const pingCount = useSiteStore((s) => s.pingCount)
  const markers = useSiteStore((s) => s.markers)
  const dropMarker = useSiteStore((s) => s.dropMarker)
  const reloadMarkers = useSiteStore((s) => s.reloadMarkers)
  const left = MAX_MARKERS - markers.length

  return (
    <SectionShell id="sandbox" className="!items-end">
      <div className="pointer-events-none grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,360px)_1fr_minmax(0,300px)] lg:items-end">
        <div className="pointer-events-auto">
          <Reveal>
            <Kicker index="04">Field test mode</Kicker>
            <Title className="!text-3xl sm:!text-4xl">
              Live playable <span className="text-gradient">search sandbox.</span>
            </Title>
            <p className="mt-3 text-sm leading-relaxed text-[#d7dde3]">
              Click anywhere in the water to sweep the sonar from the bow float. Raise the clutter, switch the echo filter off, and watch the noise swallow
              the target. Lock it, then drop a glowing marker so rescuers know where to look.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <div className="glass-strong hud-corner mt-5 space-y-4 rounded-lg p-4">
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[11px] text-[#93a3ae] ">
                  <Boxes size={11} /> Clutter density
                </div>
                <div className="flex gap-2">
                  <button className="toggle flex-1 justify-center" data-active={clutter === 'low'} onClick={() => setClutter('low')}>
                    Low
                  </button>
                  <button className="toggle flex-1 justify-center" data-active={clutter === 'extreme'} onClick={() => setClutter('extreme')}>
                    Extreme flood debris
                  </button>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[11px] text-[#93a3ae] ">
                  <Filter size={11} /> Echo filter · k = {SONAR.sparsityK}
                </div>
                <div className="flex gap-2">
                  <button className="toggle flex-1 justify-center" data-active={sparsity} onClick={() => toggleSparsity(true)}>
                    On
                  </button>
                  <button className="toggle flex-1 justify-center" data-active={!sparsity} onClick={() => toggleSparsity(false)}>
                    Off
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1 justify-center !px-3" onClick={() => emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)}>
                  <Radio size={14} /> Sonar Sweep
                </button>
                <button className="btn-secondary !px-3" onClick={rehide} aria-label="Re-hide target">
                  <Shuffle size={14} />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary flex-1 justify-center !px-3 disabled:opacity-40"
                  disabled={!lock.active || left === 0}
                  onClick={() => dropMarker(sceneRefs.stern.x, sceneRefs.stern.y, sceneRefs.stern.z)}
                  style={lock.active && left > 0 ? { borderColor: 'rgba(255,107,87,0.8)', boxShadow: '0 0 20px rgba(255,107,87,0.35)' } : undefined}
                >
                  <MapPin size={14} /> Drop glow marker · {left}/{MAX_MARKERS}
                </button>
                <button className="btn-secondary !px-3" onClick={reloadMarkers} aria-label="Reload markers">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="hidden lg:block" />

        <div className="pointer-events-auto">
          <Reveal delay={2}>
            <div className="glass-strong hud-corner space-y-3 rounded-lg p-4 font-mono" style={{ borderColor: lock.active ? 'rgba(255,107,87,0.7)' : undefined }}>
              <div className="flex items-center justify-between text-[11px] ">
                <span className="text-[#93a3ae]">Target status</span>
                <span className={lock.active ? 'text-[#ff6b57] blink' : 'text-white/50'}>{lock.active ? '● LOCKED' : '○ SEARCHING'}</span>
              </div>
              <RevealMeter />
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <div className="text-white/50">RANGE</div>
                  <div className="text-xl text-white">
                    {lock.distanceM ? lock.distanceM.toFixed(1) : '--.-'}
                    <span className="text-[11px] text-[#93a3ae]"> m</span>
                  </div>
                </div>
                <div>
                  <div className="text-white/50">CONFIDENCE</div>
                  <div className={`text-xl ${lock.active ? 'text-[#ff6b57]' : 'text-white'}`}>
                    {(lock.confidence * 100).toFixed(1)}
                    <span className="text-[11px] text-[#93a3ae]"> %</span>
                  </div>
                </div>
                <div>
                  <div className="text-white/50">LOCK THRESHOLD</div>
                  <div className="text-white">{(SONAR.lockThreshold * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-white/50">SWEEPS · MARKERS</div>
                  <div className="text-white">
                    {String(pingCount).padStart(4, '0')} · {markers.length}
                  </div>
                </div>
              </div>
              <p className="border-t border-white/10 pt-2 text-[11px] leading-relaxed text-white/45">
                {sparsity
                  ? `Filter keeps the ${SONAR.sparsityK} strongest returns per sweep; sediment echoes are energy-spread and dropped. Heat from the AMG8833 confirms a person.`
                  : 'Filter off: every echo is kept. Sediment speckle floods the return and confidence collapses below the lock threshold.'}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  )
}
