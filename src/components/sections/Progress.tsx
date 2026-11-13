import { Check, Circle } from 'lucide-react'
import { BUILD_CHECKLIST } from '../../data/research'
import { SectionShell, Kicker, Title, Accent, Lead, Reveal } from '../ui/primitives'

export function Progress() {
  return (
    <SectionShell id="progress">
      <div className="pointer-events-auto w-full max-w-5xl">
        <Reveal>
          <Kicker index="04">Build progress</Kicker>
          <Title>
            Built one <Accent>step</Accent> at a time.
          </Title>
          <Lead>{BUILD_CHECKLIST.summary}</Lead>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="card p-6 sm:p-7">
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#b7c3cc]">Done</div>
              <ul className="space-y-3">
                {BUILD_CHECKLIST.done.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-base text-[#eef3f6]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1b252c] text-[#eef3f6]">
                      <Check size={13} />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6 sm:p-7">
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#b7c3cc]">Next</div>
              <ul className="space-y-3">
                {BUILD_CHECKLIST.next.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-base text-[#b7c3cc]">
                    <Circle size={20} className="mt-0.5 shrink-0 text-[#3a4852]" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
