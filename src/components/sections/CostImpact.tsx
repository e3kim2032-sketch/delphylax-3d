import { Users } from 'lucide-react'
import { COST, BUSINESS } from '../../data/research'
import { SectionShell, Kicker, Title, Accent, Lead, Reveal } from '../ui/primitives'

export function CostImpact() {
  return (
    <SectionShell id="cost">
      <div className="pointer-events-auto w-full max-w-6xl">
        <Reveal>
          <Kicker index="05">Cost & impact</Kicker>
          <Title>
            A scout on every <Accent>rescue truck.</Accent>
          </Title>
          <Lead>
            One Delphylax costs about ${COST.usdApprox} to build, about 1/{COST.ratio} of EMILY, a proven robotic lifeguard used by navies and lifeguards. That is cheap
            enough for towns that can’t afford professional rescue robots.
          </Lead>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-12 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="card px-7 py-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#b7c3cc]">Delphylax</div>
              <div className="mt-3 font-mono text-5xl font-semibold text-[#eef3f6]">${COST.usdApprox}</div>
              <div className="mt-3 text-sm leading-snug text-[#b7c3cc]">Build cost, est. {COST.total.toLocaleString('en-US')} won · parts and 3D printing, planning estimate</div>
            </div>
            <div className="flex items-center justify-center px-2 py-1 text-center">
              <div>
                <div className="font-mono text-2xl font-semibold text-[#eef3f6]">1/{COST.ratio}</div>
                <div className="text-xs text-[#b7c3cc]">of the price</div>
              </div>
            </div>
            <div className="card px-7 py-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#b7c3cc]">EMILY robotic lifeguard</div>
              <div className="mt-3 font-mono text-5xl font-semibold text-[#eef3f6]">${COST.emilyUsd.toLocaleString('en-US')}</div>
              <div className="mt-3 text-sm leading-snug text-[#b7c3cc]">
                About, {COST.emilySource} · reaches {COST.emilySpeedMph} mph, so this compares price, not ability
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={2}>
          <div className="card mt-8 p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#eef3f6]">
              <Users size={15} /> Who would use it
            </div>
            <ul className="grid gap-5 md:grid-cols-3">
              {BUSINESS.customers.map((c) => (
                <li key={c.who}>
                  <div className="text-base font-semibold text-[#eef3f6]">{c.who}</div>
                  <div className="mt-1 text-sm leading-relaxed text-[#b7c3cc]">{c.why}</div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
