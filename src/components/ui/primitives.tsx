import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { resolveHref } from '../../data/research'

/**
 * Shared building blocks. The type scale used across the site:
 *   Title      section headline (Space Grotesk, 36 to 58 px)
 *   CardTitle  card headline (Space Grotesk, 20 px)
 *   Lead       intro paragraph (Inter, 17 to 18 px)
 *   text-base  paragraphs (Inter, 16 px)
 *   text-sm    supporting lines inside cards (Inter, 14 px)
 *   .label     small monospace tags only (12 px)
 */

// quick and quiet: 350 ms, a short rise, no blur
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: Math.min(i, 3) * 0.05, ease: [0.2, 0.8, 0.2, 1] },
  }),
}

export function Reveal({ children, className = '', delay = 0, once = true }: { children: ReactNode; className?: string; delay?: number; once?: boolean }) {
  // with reduced motion the content is simply there: nothing waits on an animation
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} variants={fadeUp} custom={delay} initial="hidden" whileInView="show" viewport={{ once, amount: 0.12, margin: '0px 0px -6% 0px' }}>
      {children}
    </motion.div>
  )
}

/** One section of the page. Top padding clears the two-row fixed header; spacing is the same for every section. */
export function SectionShell({ id, children, className = '', align = 'left' }: { id: string; children: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  const justify = align === 'left' ? 'lg:justify-start' : align === 'right' ? 'lg:justify-end' : 'justify-center'
  return (
    <section id={id} className={`pointer-events-none relative flex min-h-screen w-full items-center overflow-x-clip ${justify} px-4 pb-10 pt-[7.25rem] sm:px-8 sm:pb-12 sm:pt-[7.5rem] lg:px-20 ${className}`}>
      {children}
    </section>
  )
}

export function Kicker({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="label mb-4 flex items-center gap-3">
      <span className="text-[#ff8a73]">{index}</span>
      <span className="h-px w-6 bg-[#e8654f]" aria-hidden />
      <span>{children}</span>
    </div>
  )
}

export function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-4xl font-700 leading-[1.04] text-[#f3ede1] sm:text-5xl lg:text-[3.6rem] ${className}`}>{children}</h2>
}

export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-5 max-w-[60ch] text-[1.0625rem] leading-relaxed text-[#dbe2e8] sm:text-lg ${className}`}>{children}</p>
}

export function CardTitle({ children, icon, className = '' }: { children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <h3 className={`flex items-center gap-2.5 font-display text-xl font-700 leading-snug text-[#f3ede1] ${className}`}>
      {icon}
      <span>{children}</span>
    </h3>
  )
}

export function SimTag() {
  return <span className="sim-tag">Simulated</span>
}

/** A small external (or site-relative) link that always opens in a new tab. */
export function SourceLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={resolveHref(href)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-start gap-1 rounded-sm underline decoration-white/30 underline-offset-[3px] hover:text-[#ffb4a6] hover:decoration-[#ff8a73] ${className}`}
    >
      <span>{children}</span>
      <ExternalLink size={13} className="mt-[3px] shrink-0 opacity-60" aria-hidden />
    </a>
  )
}

export function Stat({ value, unit, label, accent = 'blue' }: { value: string; unit?: string; label: string; accent?: 'blue' | 'pink' | 'red' }) {
  const color = accent === 'blue' ? '#7fb3d5' : accent === 'pink' ? '#ff8a73' : '#ff6b57'
  return (
    <div className="card px-5 py-4">
      <div className="font-mono text-3xl font-semibold text-white">
        {value}
        {unit && (
          <span className="ml-1 text-sm" style={{ color }}>
            {' '}
            {unit}
          </span>
        )}
      </div>
      <div className="mt-1.5 text-[0.9375rem] leading-snug text-[#c3ced6]">{label}</div>
    </div>
  )
}

/**
 * Impact counter. The final value is in the markup from the first render, so it
 * shows with animations off; the count-up only runs when motion is allowed.
 */
export function Counter({
  value,
  prefix = '',
  suffix = '',
  label,
  source,
}: {
  value: number
  prefix?: string
  suffix?: string
  label: string
  source: { label: string; href: string }
}) {
  const num = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = num.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let started = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true
        io.disconnect()
        const t0 = performance.now()
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / 900)
          el.textContent = String(Math.round(value * (1 - Math.pow(1 - k, 3))))
          if (k < 1) raf = requestAnimationFrame(tick)
          else el.textContent = String(value)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      el.textContent = String(value)
    }
  }, [value])
  return (
    <div className="card px-4 py-3">
      <div className="font-mono text-2xl font-semibold text-white" aria-label={`${prefix}${value}${suffix}`}>
        <span aria-hidden>
          {prefix}
          <span ref={num}>{value}</span>
          {suffix}
        </span>
      </div>
      <div className="mt-1 text-sm leading-snug text-[#c3ced6]">{label}</div>
      <SourceLink href={source.href} className="mt-1.5 text-sm text-[#aab8c2]">
        {source.label}
      </SourceLink>
    </div>
  )
}
