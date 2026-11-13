import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowDown } from 'lucide-react'
import { IDENTITY } from '../../data/research'
import { SectionShell, Accent } from '../ui/primitives'
import { scrollToSection } from '../../hooks/useScrollSync'

export function Hero() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-line', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.25 })
      gsap.from('.hero-fade', { opacity: 0, y: 18, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.8 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <SectionShell id="hero">
      <div ref={root} className="hero-scrim pointer-events-auto w-full max-w-2xl">
        <p className="hero-fade mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#b7c3cc]">{IDENTITY.competitions.join(' · ')}</p>

        <h1 className="font-display text-[11vw] font-700 leading-[0.98] text-[#eef3f6] sm:text-6xl lg:text-[4.8rem]">
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block">Guardian of</span>
          </span>
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block">
              <Accent>zero-visibility</Accent>
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block">waters.</span>
          </span>
        </h1>

        <p className="hero-fade mt-7 max-w-xl text-lg leading-relaxed text-[#eef3f6]/90 sm:text-xl">{IDENTITY.oneLiner}</p>

        <div className="hero-fade mt-10">
          <button className="btn-primary" onClick={() => scrollToSection('how')}>
            See how it works <ArrowDown size={16} />
          </button>
        </div>
      </div>
    </SectionShell>
  )
}
