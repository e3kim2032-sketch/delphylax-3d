import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] },
  }),
}

export function Reveal({ children, className = '', delay = 0, once = true }: { children: ReactNode; className?: string; delay?: number; once?: boolean }) {
  return (
    <motion.div className={className} variants={fadeUp} custom={delay} initial="hidden" whileInView="show" viewport={{ once, amount: 0.2, margin: '0px 0px -10% 0px' }}>
      {children}
    </motion.div>
  )
}

/** One screen of the story: generous padding, text column left by default. */
export function SectionShell({ id, children, className = '', align = 'left' }: { id: string; children: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  const justify = align === 'left' ? 'lg:justify-start' : align === 'right' ? 'lg:justify-end' : 'justify-center'
  return (
    <section id={id} className={`pointer-events-none relative flex min-h-screen w-full items-center ${justify} px-5 py-32 sm:px-10 sm:py-40 lg:px-24 ${className}`}>
      {children}
    </section>
  )
}

export function Kicker({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#b7c3cc]">
      <span className="font-mono text-[#ff8a73]">{index}</span>
      <span className="h-px w-8 bg-[#e8654f]" />
      <span>{children}</span>
    </div>
  )
}

export function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-4xl font-700 leading-[1.05] text-[#eef3f6] sm:text-5xl lg:text-6xl ${className}`}>{children}</h2>
}

/** The one highlighted word per headline. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-[#ff8a73]">{children}</span>
}

export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-6 max-w-2xl text-lg leading-relaxed text-[#eef3f6]/90 ${className}`}>{children}</p>
}

export function SimTag() {
  return <span className="sim-tag">Simulated</span>
}

/** A number with its label. `tone="data"` is for sonar / thermal readings only. */
export function Stat({ value, unit, label, tone = 'plain', className = '' }: { value: string; unit?: string; label: string; tone?: 'plain' | 'data'; className?: string }) {
  const color = tone === 'data' ? '#7fb3d5' : '#eef3f6'
  return (
    <div className={`card px-6 py-5 ${className}`}>
      <div className="font-mono text-3xl font-semibold" style={{ color }}>
        {value}
        {unit && <span className="ml-1.5 text-base text-[#b7c3cc]">{unit}</span>}
      </div>
      <div className="mt-2 text-sm leading-snug text-[#b7c3cc]">{label}</div>
    </div>
  )
}
