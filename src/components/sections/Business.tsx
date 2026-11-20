import { Users, AlertTriangle, BookOpen, Coins, Globe2, Landmark, ArrowRight } from 'lucide-react'
import { BUSINESS, COST, LIMITS, IDENTITY, MISSION, VISION, REVENUE, SDGS, POLICY } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal, Stat, SourceLink } from '../ui/primitives'
import { Tabs } from '../ui/Tabs'
import { DelphylaxLockup } from '../ui/DelphylaxLogo'
import { Faq } from './Faq'

function Money() {
  return (
    <div>
      <p className="text-base leading-relaxed text-[#c3ced6]">Three ways, each priced from the build cost. Every price here is an estimate, not a quote.</p>
      <ul className="mt-5 grid gap-x-8 gap-y-6 md:grid-cols-3">
        {REVENUE.map((r) => (
          <li key={r.title}>
            <div className="font-display text-lg font-700 text-white">{r.title}</div>
            <div className="mt-1 font-mono text-lg font-semibold text-[#ff8a73]">{r.price}</div>
            <p className="mt-2 text-base leading-relaxed text-[#eef3f6]/90">{r.body}</p>
            <p className="mt-1 text-base leading-relaxed text-[#aab8c2]">{r.basis}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Goals() {
  return (
    <ul className="grid gap-x-8 gap-y-6 lg:grid-cols-3">
      {SDGS.map((g) => (
        <li key={g.target}>
          <div className="font-display text-lg font-700 text-white">
            {g.goal} · {g.target}
          </div>
          <div className="text-base text-[#aab8c2]">{g.name}</div>
          <p className="mt-2 text-base leading-relaxed text-[#c3ced6]">
            <span className="font-semibold text-[#eef3f6]">The target: </span>
            {g.text}{' '}
            <SourceLink href={g.href} className="text-[#aab8c2]">
              Full wording at un.org
            </SourceLink>
          </p>
          <p className="mt-2 text-base leading-relaxed text-[#eef3f6]/90">
            <span className="font-semibold text-[#ff8a73]">How Delphylax helps: </span>
            {g.help}
          </p>
        </li>
      ))}
    </ul>
  )
}

function Policy() {
  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
      <div>
        <div className="font-display text-lg font-700 text-white">Who buys rescue equipment</div>
        <p className="mt-2 text-base leading-relaxed text-[#eef3f6]/90">{POLICY.buyers}</p>
        <SourceLink href={POLICY.source.href} className="mt-2 text-base text-[#aab8c2]">
          {POLICY.source.label}
        </SourceLink>
      </div>
      <div>
        <div className="font-display text-lg font-700 text-white">{POLICY.pilotTitle}</div>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-base leading-relaxed text-[#eef3f6]/90 marker:text-[#ff8a73]">
          {POLICY.pilot.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-3 text-base text-[#aab8c2]">This is a proposal. No station has run it yet.</p>
      </div>
    </div>
  )
}

function Customers() {
  return (
    <ul className="grid gap-x-8 gap-y-5 md:grid-cols-3">
      {BUSINESS.customers.map((c) => (
        <li key={c.who}>
          <div className="font-display text-lg font-700 text-white">{c.who}</div>
          <p className="mt-1 text-base leading-relaxed text-[#c3ced6]">{c.why}</p>
        </li>
      ))}
    </ul>
  )
}

function Limits() {
  return (
    <div>
      <p className="text-base leading-relaxed text-[#eef3f6]">{LIMITS.headline}</p>
      <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {LIMITS.items.map((l) => (
          <li key={l.title}>
            <div className="font-display text-base font-700 text-white">{l.title}</div>
            <p className="mt-1 text-base leading-relaxed text-[#c3ced6]">{l.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Sources() {
  return (
    <div>
      <ul className="space-y-2.5">
        {BUSINESS.sources.map((n) => (
          <li key={n.label} className="flex items-start gap-2.5 text-base text-[#f3ede1]/90">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8654f]" aria-hidden />
            <SourceLink href={n.href}>{n.label}</SourceLink>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-base leading-relaxed text-[#aab8c2]">
        EMILY price and speed: {COST.emilySource}. The Delphylax cost is a planning estimate, not receipts. The comparison is of price, not ability.
      </p>
    </div>
  )
}

export function Business() {
  return (
    <SectionShell id="business" className="!items-start !pb-10">
      <div className="pointer-events-auto w-full max-w-7xl">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal className="text-scrim">
            <Kicker index="07">Commercial viability</Kicker>
            <Title>
              A scout on every <span className="text-gradient">rescue truck.</span>
            </Title>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-[#dbe2e8] sm:text-lg">
              One Delphylax costs {COST.line} to build, about 1/{COST.ratio} of EMILY, a proven robotic lifeguard used by navies and lifeguards. That is cheap
              enough for a basic flood scout to ride on every rescue vehicle in towns that can’t afford professional rescue robots.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="card border-l-2 !border-l-[#e8654f] px-4 py-3">
                <dt className="font-mono text-xs text-[#ff8a73]">Mission</dt>
                <dd className="mt-1 text-base leading-snug text-[#eef3f6]">{MISSION}</dd>
              </div>
              <div className="card border-l-2 !border-l-[#5b8fb8] px-4 py-3">
                <dt className="font-mono text-xs text-[#7fb3d5]">Vision</dt>
                <dd className="mt-1 text-base leading-snug text-[#eef3f6]">{VISION}</dd>
              </div>
            </dl>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={`$${COST.usdApprox}`} label={`Build cost, est. (${COST.total.toLocaleString('en-US')} won)`} accent="pink" />
              <Stat value={`$${(COST.emilyUsd / 1000).toFixed(0)}k`} label="EMILY robotic lifeguard" accent="blue" />
              <Stat value={`1/${COST.ratio}`} label="of EMILY’s price" accent="red" />
              <Stat value={`${COST.emilySpeedMph}`} unit="mph" label="EMILY top speed" accent="blue" />
            </div>
          </Reveal>
        </div>

        <Reveal>
          <Tabs
            className="mt-8"
            label="Business details"
            tabs={[
              { id: 'money', label: 'How we make money', icon: <Coins size={15} aria-hidden />, content: <Money /> },
              { id: 'sdgs', label: 'SDGs', icon: <Globe2 size={15} aria-hidden />, content: <Goals /> },
              { id: 'policy', label: 'Policy', icon: <Landmark size={15} aria-hidden />, content: <Policy /> },
              { id: 'customers', label: 'Customers', icon: <Users size={15} aria-hidden />, content: <Customers /> },
              { id: 'limits', label: 'Limits', icon: <AlertTriangle size={15} aria-hidden />, content: <Limits /> },
              { id: 'sources', label: 'Sources', icon: <BookOpen size={15} aria-hidden />, content: <Sources /> },
            ]}
          />
        </Reveal>

        <Reveal>
          <Faq />
        </Reveal>

        {/* the team has its own page now: the footer links to it */}
        <footer className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <DelphylaxLockup height={40} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="text-base text-[#aab8c2]">
              {BUSINESS.team.map((m) => m.name).join(', ')} · {IDENTITY.competitions.join(' · ')}
            </div>
            <a href="./team/" className="btn-primary btn-sm">
              Meet the team <ArrowRight size={15} aria-hidden />
            </a>
          </div>
        </footer>
      </div>
    </SectionShell>
  )
}
