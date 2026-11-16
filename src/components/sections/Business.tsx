import { Users, AlertTriangle, BookOpen, Coins, Globe2, Landmark } from 'lucide-react'
import { BUSINESS, COST, LIMITS, IDENTITY, MISSION, VISION, REVENUE, SDGS, POLICY } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal, Stat, SourceLink } from '../ui/primitives'
import { DelphylaxLockup } from '../ui/DelphylaxLogo'
import { Faq } from './Faq'

export function Business() {
  return (
    <SectionShell id="business" className="!items-start !pb-12">
      <div className="pointer-events-auto w-full max-w-7xl">
        <Reveal className="text-scrim">
          <Kicker index="06">Commercial viability & team</Kicker>
          <Title>
            A scout on every <span className="text-gradient">rescue truck.</span>
          </Title>
          <dl className="mt-5 grid max-w-3xl gap-3 sm:grid-cols-2">
            <div className="card border-l-2 !border-l-[#e8654f] px-4 py-3">
              <dt className="font-mono text-xs text-[#ff8a73]">Mission</dt>
              <dd className="mt-0.5 text-base leading-snug text-[#eef3f6]">{MISSION}</dd>
            </div>
            <div className="card border-l-2 !border-l-[#5b8fb8] px-4 py-3">
              <dt className="font-mono text-xs text-[#7fb3d5]">Vision</dt>
              <dd className="mt-0.5 text-base leading-snug text-[#eef3f6]">{VISION}</dd>
            </div>
          </dl>
          <p className="mt-6 max-w-3xl text-[1.0625rem] leading-relaxed text-[#dbe2e8] sm:text-lg">
            One Delphylax costs {COST.line} to build, about 1/{COST.ratio} of EMILY, a proven robotic lifeguard used by navies and
            lifeguards. That is cheap enough for a basic flood scout to ride on every rescue vehicle in towns that can’t afford professional rescue robots.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={`$${COST.usdApprox}`} label={`Build cost, est. ${COST.total.toLocaleString('en-US')} won (about $${COST.usdApprox})`} accent="pink" />
            <Stat value={`$${(COST.emilyUsd / 1000).toFixed(0)}k`} label="EMILY robotic lifeguard" accent="blue" />
            <Stat value={`1/${COST.ratio}`} label="of EMILY’s price" accent="red" />
            <Stat value={`${COST.emilySpeedMph}`} unit="mph" label="EMILY top speed" accent="blue" />
          </div>
          <p className="mt-3 max-w-3xl text-sm text-[#aab8c2]">
            EMILY price and speed: {COST.emilySource} · Delphylax cost is a planning estimate, not receipts · compares price, not ability
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div className="card mt-8 card-pad">
            <div className="mb-1 flex items-center gap-2 label">
              <Coins size={12} aria-hidden /> How we make money
            </div>
            <p className="mb-4 text-sm text-[#c3ced6]">Three ways, each priced from the build cost. Every price here is an estimate, not a quote.</p>
            <ul className="grid gap-5 md:grid-cols-3">
              {REVENUE.map((r) => (
                <li key={r.title}>
                  <div className="font-display text-base font-700 text-white">{r.title}</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-[#ff8a73]">{r.price}</div>
                  <p className="mt-1 text-sm leading-relaxed text-[#eef3f6]/90">{r.body}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#aab8c2]">{r.basis}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal delay={1}>
            <div className="card h-full card-pad">
              <div className="mb-3 flex items-center gap-2 label">
                <Globe2 size={12} aria-hidden /> UN Sustainable Development Goals
              </div>
              <ul className="space-y-4">
                {SDGS.map((g) => (
                  <li key={g.target}>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-base font-700 text-white">
                        {g.goal} · {g.target}
                      </span>
                      <span className="text-sm text-[#aab8c2]">{g.name}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[#c3ced6]">
                      <span className="font-semibold text-[#eef3f6]">The target: </span>
                      {g.text}{' '}
                      <SourceLink href={g.href} className="text-[#aab8c2]">
                        Full wording at un.org
                      </SourceLink>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#eef3f6]/90">
                      <span className="font-semibold text-[#ff8a73]">How Delphylax helps: </span>
                      {g.help}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="card h-full card-pad">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 label">
                  <Landmark size={12} aria-hidden /> Policy & adoption
                </span>
                <span className="chip">Minnie · policy researcher</span>
              </div>
              <div className="font-display text-base font-700 text-white">Who buys rescue equipment</div>
              <p className="mt-1 text-sm leading-relaxed text-[#eef3f6]/90">{POLICY.buyers}</p>
              <SourceLink href={POLICY.source.href} className="mt-1.5 text-sm text-[#aab8c2]">
                {POLICY.source.label}
              </SourceLink>
              <div className="mt-4 font-display text-base font-700 text-white">{POLICY.pilotTitle}</div>
              <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm leading-relaxed text-[#eef3f6]/90 marker:text-[#ff8a73]">
                {POLICY.pilot.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-2 text-sm text-[#aab8c2]">This is a proposal. No station has run it yet.</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal delay={1}>
            <div className="card h-full card-pad">
              <div className="mb-3 flex items-center gap-2 label">
                <Users size={11} /> Customers
              </div>
              <ul className="space-y-3">
                {BUSINESS.customers.map((c) => (
                  <li key={c.who}>
                    <div className="font-display text-base font-700 text-white">{c.who}</div>
                    <div className="text-sm text-[#c3ced6]">{c.why}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div className="card h-full card-pad">
              <div className="mb-2 flex items-center gap-2 label">
                <AlertTriangle size={11} /> Limits
              </div>
              <p className="mb-3 text-sm leading-relaxed text-[#f3ede1]/85">{LIMITS.headline}</p>
              <ul className="space-y-2">
                {LIMITS.items.map((l) => (
                  <li key={l.title}>
                    <div className="font-display text-base font-700 text-white">{l.title}</div>
                    <div className="text-sm text-[#c3ced6]">{l.body}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="space-y-6">
            <Reveal delay={3}>
              <div className="card card-pad">
                <div className="mb-3 label">Team</div>
                <div className="space-y-3">
                {BUSINESS.team.map((m) => (
                  <div key={m.name} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-800 text-white" style={{ background: 'linear-gradient(135deg,#2f5f85,#e8654f)' }}>
                      {m.name[0]}
                    </div>
                    <div>
                      <div className="font-display text-base font-800 text-white">{m.name}</div>
                      <div className="text-sm leading-snug text-[#c3ced6]">{m.role}</div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={4}>
              <div className="card card-pad">
                <div className="mb-3 flex items-center gap-2 label">
                  <BookOpen size={11} /> Sources
                </div>
                <ul className="space-y-2">
                  {BUSINESS.sources.map((n) => (
                    <li key={n.label} className="flex items-start gap-2 text-sm text-[#f3ede1]/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8654f]" />
                      <SourceLink href={n.href}>{n.label}</SourceLink>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal>
          <Faq />
        </Reveal>

        <footer className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <DelphylaxLockup height={40} />
          <div className="text-sm text-[#aab8c2]">
            {BUSINESS.team.map((m) => m.name).join(', ')} · {IDENTITY.competitions.join(' · ')}
          </div>
        </footer>
      </div>
    </SectionShell>
  )
}
