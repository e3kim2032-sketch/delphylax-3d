import { useEffect, useRef } from 'react'
import { Radio, Shuffle, Filter, Boxes, MapPin, RotateCcw } from 'lucide-react'
import { useSiteStore, useLive3d, MAX_MARKERS } from '../../store/useSiteStore'
import { SONAR } from '../../data/research'
import { SectionShell, Kicker, Title, Lead, Reveal, SimTag } from '../ui/primitives'
import { SensorMonitor } from '../hud/SensorMonitor'
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
      <div className="flex justify-between font-mono text-xs text-[#aab8c2]">
        <span>SONAR ECHO RETURN</span>
        <span ref={txt} className="text-white">
          0%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
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
  const markers = useSiteStore((s) => s.markers)
  const dropMarker = useSiteStore((s) => s.dropMarker)
  const reloadMarkers = useSiteStore((s) => s.reloadMarkers)
  const lights = useSiteStore((s) => s.lights)
  const left = MAX_MARKERS - markers.length
  const live3d = useLive3d()
  const webglOk = useSiteStore((s) => s.webglOk)
  const setReadMode = useSiteStore((s) => s.setReadMode)

  return (
    <SectionShell id="sandbox">
      <div className="pointer-events-none grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,400px)_1fr_minmax(0,320px)] lg:items-center">
        <div className="pointer-events-auto">
          <Reveal className="text-scrim">
            <Kicker index="05">Field test mode</Kicker>
            <Title className="!text-3xl sm:!text-4xl lg:!text-[2.75rem]">
              Try the <span className="text-gradient">search</span> yourself.
            </Title>
            <Lead>
              Click anywhere in the water to sweep the sonar. Raise the clutter or switch the echo filter off, and watch the noise swallow the target. Lock it, then
              drop a glowing marker.
            </Lead>
          </Reveal>
          {live3d ? (
            <Reveal delay={1}>
              <div className="card card-pad mt-5 space-y-4">
                <div>
                  <div className="label mb-2 flex items-center gap-2">
                    <Boxes size={13} aria-hidden /> Clutter
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary btn-sm flex-1" aria-pressed={clutter === 'low'} onClick={() => setClutter('low')}>
                      Low
                    </button>
                    <button type="button" className="btn-secondary btn-sm flex-1" aria-pressed={clutter === 'extreme'} onClick={() => setClutter('extreme')}>
                      Flood debris
                    </button>
                  </div>
                </div>
                <div>
                  <div className="label mb-2 flex items-center gap-2">
                    <Filter size={13} aria-hidden /> Echo filter
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary btn-sm flex-1" aria-pressed={sparsity} onClick={() => toggleSparsity(true)}>
                      On
                    </button>
                    <button type="button" className="btn-secondary btn-sm flex-1" aria-pressed={!sparsity} onClick={() => toggleSparsity(false)}>
                      Off
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-primary flex-1" onClick={() => emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)}>
                    <Radio size={16} aria-hidden /> Sonar sweep
                  </button>
                  <button type="button" className="btn-secondary !px-3.5" onClick={rehide} aria-label="Hide the target somewhere new">
                    <Shuffle size={16} aria-hidden />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary flex-1" disabled={!lock.active || left === 0} onClick={() => dropMarker(sceneRefs.stern.x, sceneRefs.stern.y, sceneRefs.stern.z)}>
                    <MapPin size={16} aria-hidden /> Drop marker · {left} left
                  </button>
                  <button type="button" className="btn-secondary !px-3.5" onClick={reloadMarkers} aria-label="Reload markers">
                    <RotateCcw size={16} aria-hidden />
                  </button>
                </div>
              </div>
            </Reveal>
          ) : (
            <div className="card card-pad mt-6">
              <p className="text-base leading-relaxed text-[#eef3f6]">
                The sandbox runs on the live 3D scene, which is off in Read mode.
                {webglOk ? ' Turn Read mode off to try it.' : ' This device cannot run the 3D scene.'}
              </p>
              {webglOk && (
                <button type="button" className="btn-primary btn-sm mt-4" onClick={() => setReadMode(false)}>
                  <Radio size={15} aria-hidden /> Turn on 3D
                </button>
              )}
              <p className="mt-4 text-sm leading-relaxed text-[#c3ced6]">
                {SONAR.roles} {SONAR.integration}
              </p>
            </div>
          )}
        </div>

        <div className="hidden lg:block" />

        {live3d && (
          <div className="pointer-events-auto space-y-4">
            <Reveal delay={1} className="hidden lg:block">
              <SensorMonitor />
            </Reveal>
            <Reveal delay={2}>
              <div className="card card-pad space-y-4" style={{ borderColor: lock.active ? 'rgba(255,107,87,0.7)' : undefined }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="label flex items-center gap-2">
                    Target status <SimTag />
                  </span>
                  <span className={`font-mono text-xs ${lock.active ? 'blink text-[#ff6b57]' : 'text-[#aab8c2]'}`}>{lock.active ? '● LOCKED' : '○ SEARCHING'}</span>
                </div>
                <RevealMeter />
                <div className="grid grid-cols-2 gap-4 font-mono text-xs text-[#aab8c2]">
                  <div>
                    RANGE
                    <div className="text-2xl text-white">
                      {lock.distanceM ? lock.distanceM.toFixed(1) : '--.-'}
                      <span className="text-sm text-[#aab8c2]"> m</span>
                    </div>
                  </div>
                  <div>
                    CONFIDENCE
                    <div className={`text-2xl ${lock.active ? 'text-[#ff6b57]' : 'text-white'}`}>
                      {(lock.confidence * 100).toFixed(0)}
                      <span className="text-sm text-[#aab8c2]"> %</span>
                    </div>
                  </div>
                  <div>
                    LOCK AT
                    <div className="text-sm text-white">{(SONAR.lockThreshold * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    MARKERS DROPPED
                    <div className="text-sm text-white">
                      {markers.length}/{MAX_MARKERS}
                    </div>
                  </div>
                </div>
                <p className="border-t border-white/10 pt-3 text-sm leading-relaxed text-[#c3ced6]">
                  {sparsity
                    ? `The filter keeps the ${SONAR.sparsityK} strongest returns per sweep and drops the scattered echoes from sediment.`
                    : 'Filter off: every echo is kept. Sediment speckle floods the return, and confidence falls below the lock threshold.'}
                </p>
                <p className="font-mono text-xs text-[#aab8c2]">
                  LIGHTS {lights ? 'ON' : 'OFF'} · CLUTTER {clutter === 'extreme' ? 'DEBRIS' : 'LOW'} · FILTER {sparsity ? 'ON' : 'OFF'}
                </p>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </SectionShell>
  )
}
