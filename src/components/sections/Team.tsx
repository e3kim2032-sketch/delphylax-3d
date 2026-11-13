import { ExternalLink } from 'lucide-react'
import { BUSINESS, IDENTITY, LIMITS } from '../../data/research'
import { SectionShell, Kicker, Title, Accent, Reveal } from '../ui/primitives'
import { DelphylaxLockup } from '../ui/DelphylaxLogo'

export function Team() {
  return (
    <SectionShell id="team" className="!items-start pb-12 sm:pb-16">
      <div className="pointer-events-auto w-full max-w-6xl">
        <Reveal>
          <Kicker index="06">Team & sources</Kicker>
          <Title>
            Built by <Accent>three of us.</Accent>
          </Title>
        </Reveal>

        <Reveal delay={1}>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {BUSINESS.team.map((m) => (
              <li key={m.name} className="card flex items-center gap-4 p-5">
                <div className="font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#28343c] bg-[#1b252c] text-xl font-700 text-[#eef3f6]">{m.name[0]}</div>
                <div>
                  <div className="font-display text-lg font-700 text-[#eef3f6]">{m.name}</div>
                  <div className="text-sm text-[#b7c3cc]">{m.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={2}>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="card p-6">
              <div className="mb-3 text-sm font-semibold text-[#eef3f6]">Sources</div>
              <ul className="space-y-3">
                {BUSINESS.sources.map((n) => (
                  <li key={n.label} className="text-base leading-snug">
                    <a href={n.href} target="_blank" rel="noopener noreferrer" className="link inline-flex items-start gap-1.5">
                      <span>{n.label}</span>
                      <ExternalLink size={14} className="mt-1 shrink-0 opacity-70" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <div className="mb-3 text-sm font-semibold text-[#eef3f6]">What is still an estimate</div>
              <p className="text-base leading-relaxed text-[#b7c3cc]">{LIMITS.headline}</p>
            </div>
          </div>
        </Reveal>

        <footer className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-[#28343c] pt-8 sm:flex-row sm:items-center">
          <DelphylaxLockup height={40} />
          <div className="text-sm text-[#b7c3cc]">
            {BUSINESS.team.map((m) => m.name).join(', ')} · {IDENTITY.competitions.join(' · ')}
          </div>
        </footer>
      </div>
    </SectionShell>
  )
}
