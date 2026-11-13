import { Users, CircleDot, Circle, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react'
import { BUSINESS, ROADMAP, COST, LIMITS, IDENTITY } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal, Stat } from '../ui/primitives'
import { DelphylaxLockup } from '../ui/DelphylaxLogo'

export function Business() {
  return (
    <SectionShell id="business" className="!items-start pb-10">
      <div className="pointer-events-auto w-full max-w-7xl">
        <Reveal>
          <Kicker index="06">Commercial viability, roadmap & team</Kicker>
          <Title>
            A scout on every <span className="text-gradient">rescue truck.</span>
          </Title>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#d7dde3]">
            One Delphylax costs {COST.line} to build, about 1/{COST.ratio} of EMILY, a proven robotic lifeguard used by navies and
            lifeguards. That is cheap enough for a basic flood scout to ride on every rescue vehicle in towns that can’t afford professional rescue robots.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={`$${COST.usdApprox}`} label="Delphylax, about (535,510 won, estimate)" accent="pink" />
            <Stat value={`$${(COST.emilyUsd / 1000).toFixed(0)}k`} label="EMILY robotic lifeguard" accent="blue" />
            <Stat value={`1/${COST.ratio}`} label="About, of EMILY’s price" accent="red" />
            <Stat value={`${COST.emilySpeedMph}`} unit="mph" label="EMILY top speed" accent="blue" />
          </div>
          <p className="mt-2 max-w-3xl font-mono text-[11px] text-white/40 ">
            EMILY price and speed: {COST.emilySource} · Delphylax cost is a planning estimate, not receipts · compares price, not ability
          </p>
        </Reveal>

        <Reveal delay={2}>
          <div className="glass-strong hud-corner mt-8 rounded-lg p-5">
            <div className="mb-4 font-mono text-[11px] text-[#93a3ae] ">Roadmap</div>
            <ol className="grid gap-4 md:grid-cols-4">
              {ROADMAP.map((r) => {
                const Icon = r.state === 'active' ? CircleDot : r.state === 'planned' ? Circle : CheckCircle2
                const color = r.state === 'active' ? '#ff6b57' : r.state === 'planned' ? 'rgba(255,255,255,0.4)' : '#7fb3d5'
                return (
                  <li key={r.title}>
                    <div className="flex items-center gap-2 font-mono text-[11px] " style={{ color }}>
                      <Icon size={12} className={r.state === 'active' ? 'blink' : ''} /> {r.phase} · {r.date}
                    </div>
                    <div className="mt-2 font-display text-sm font-700 text-white">{r.title}</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#a9b4bd]">{r.body}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal delay={1}>
            <div className="glass hud-corner h-full rounded-lg p-5">
              <div className="mb-3 flex items-center gap-2 font-mono text-[11px] text-[#93a3ae] ">
                <Users size={11} /> Customers
              </div>
              <ul className="space-y-3">
                {BUSINESS.customers.map((c) => (
                  <li key={c.who}>
                    <div className="font-display text-sm font-700 text-white">{c.who}</div>
                    <div className="text-xs text-[#a9b4bd]">{c.why}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="glass hud-corner h-full rounded-lg p-5">
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] text-[#93a3ae] ">
                <AlertTriangle size={11} /> Limits & next steps
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-[#f3ede1]/85">{LIMITS.headline}</p>
              <ul className="space-y-2">
                {LIMITS.items.map((l) => (
                  <li key={l.title}>
                    <div className="font-display text-sm font-700 text-white">{l.title}</div>
                    <div className="text-[11px] text-[#a9b4bd]">{l.body}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="space-y-6">
            <Reveal delay={3}>
              <div className="glass hud-corner rounded-lg p-5">
                <div className="mb-3 font-mono text-[11px] text-[#93a3ae] ">Team</div>
                <div className="space-y-3">
                {BUSINESS.team.map((m) => (
                  <div key={m.name} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-800 text-white" style={{ background: 'linear-gradient(135deg,#2f5f85,#e8654f)' }}>
                      {m.name[0]}
                    </div>
                    <div className="font-display text-base font-800 text-white">{m.name}</div>
                  </div>
                ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={4}>
              <div className="glass hud-corner rounded-lg p-5">
                <div className="mb-3 flex items-center gap-2 font-mono text-[11px] text-[#93a3ae] ">
                  <BookOpen size={11} /> Sources
                </div>
                <ul className="space-y-2">
                  {BUSINESS.sources.map((n) => (
                    <li key={n} className="flex items-start gap-2 text-xs text-[#f3ede1]/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8654f]" /> {n}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        <footer className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <DelphylaxLockup height={40} />
          <div className="font-mono text-[11px] text-white/45 ">
            {BUSINESS.team.map((m) => m.name).join(', ')} · {IDENTITY.competitions.join(' · ')}
          </div>
        </footer>
      </div>
    </SectionShell>
  )
}
