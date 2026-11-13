import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] },
  }),
}

export function Reveal({ children, className = '', delay = 0, once = true }: { children: ReactNode; className?: string; delay?: number; once?: boolean }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.25, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </motion.div>
  )
}

export function SectionShell({ id, children, className = '', align = 'left' }: { id: string; children: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  const justify = align === 'left' ? 'lg:justify-start' : align === 'right' ? 'lg:justify-end' : 'justify-center'
  return (
    <section id={id} className={`pointer-events-none relative flex min-h-screen w-full items-center ${justify} px-4 py-28 sm:px-8 lg:px-20 ${className}`}>
      {children}
    </section>
  )
}

export function Kicker({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 font-mono text-xs text-[#aab8c2]">
      <span className="text-[#ff8a73]">{index}</span>
      <span className="h-px w-6 bg-[#e8654f]" />
      <span>{children}</span>
    </div>
  )
}

export function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-4xl font-700 leading-[1.02] text-[#f3ede1] sm:text-5xl lg:text-[3.6rem] ${className}`}>{children}</h2>
}

export function SimTag() {
  return <span className="sim-tag">Simulated</span>
}

export function Stat({ value, unit, label, accent = 'blue' }: { value: string; unit?: string; label: string; accent?: 'blue' | 'pink' | 'red' }) {
  const color = accent === 'blue' ? '#7fb3d5' : accent === 'pink' ? '#ff8a73' : '#ff6b57'
  return (
    <div className="glass hud-corner rounded-md px-4 py-3">
      <div className="font-mono text-2xl font-semibold text-white">
        {value}
        {unit && (
          <span className="ml-1 text-xs" style={{ color }}>
            {unit}
          </span>
        )}
      </div>
      <div className="mt-1 text-xs text-white/70">{label}</div>
    </div>
  )
}
