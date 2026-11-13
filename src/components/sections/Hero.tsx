import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Radio, Cpu, ArrowDown } from 'lucide-react'
import { IDENTITY, HULL, COST } from '../../data/research'
import { SectionShell, Stat } from '../ui/primitives'
import { scrollToSection } from '../../hooks/useScrollSync'
import { useSiteStore } from '../../store/useSiteStore'
import { sceneRefs } from '../canvas/sceneRefs'

export function Hero() {
  const root = useRef<HTMLDivElement>(null)
  const emitPing = useSiteStore((s) => s.emitPing)
  const toggleExploded = useSiteStore((s) => s.toggleExploded)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-line', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.25 })
      gsap.from('.hero-fade', { opacity: 0, y: 18, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.8 })
    }, root)
    return () => ctx.revert()
  }, [])

  const launch = () => {
    scrollToSection('sandbox')
    setTimeout(() => emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z), 1400)
  }
  const inspect = () => {
    scrollToSection('engineering')
    setTimeout(() => toggleExploded(true), 900)
  }

  return (
    <SectionShell id="hero">
      <div ref={root} className="hero-scrim pointer-events-auto w-full max-w-2xl">
        <div className="hero-fade mb-6 flex flex-wrap items-center gap-2">
          {IDENTITY.competitions.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
          <span className="chip" style={{ color: '#ffb4a6', borderColor: 'rgba(232,101,79,0.45)', background: 'rgba(232,101,79,0.1)' }}>
            {IDENTITY.model} · {IDENTITY.unit}
          </span>
        </div>

        <h1 className="font-display text-[11vw] font-700 leading-[0.98] text-[#f3ede1] sm:text-6xl lg:text-[4.8rem]">
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block">Guardian of</span>
          </span>
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block text-[#ff8a73]">zero-visibility</span>
          </span>
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block">waters.</span>
          </span>
        </h1>

        <p className="hero-fade mt-6 max-w-xl text-base leading-relaxed text-[#d7dde3] sm:text-lg">{IDENTITY.oneLiner}</p>
        <p className="hero-fade mt-3 max-w-xl text-xs text-[#93a3ae]">
          {IDENTITY.greek}. {IDENTITY.inspiration}
        </p>

        <div className="hero-fade mt-8 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={launch}>
            <Radio size={16} /> Launch Sonar Simulation
          </button>
          <button className="btn-secondary" onClick={inspect}>
            <Cpu size={16} /> Inspect Hardware
          </button>
        </div>

        <div className="hero-fade mt-10 grid max-w-lg grid-cols-3 gap-3">
          <Stat value={`${HULL.lengthMm / 10}`} unit="cm" label="Catamaran length" />
          <Stat value={`${HULL.capacityKg}`} unit="kg" label="Floating capacity, about" accent="pink" />
          <Stat value={`$${COST.usdApprox}`} label="Build cost, about (535,510 won, estimate)" accent="red" />
        </div>

        <button onClick={() => scrollToSection('crisis')} className="hero-fade mt-12 flex items-center gap-2 text-xs text-[#93a3ae]">
          <ArrowDown size={12} className="animate-bounce" /> Scroll down. Click anywhere in the water to ping.
        </button>
      </div>
    </SectionShell>
  )
}
