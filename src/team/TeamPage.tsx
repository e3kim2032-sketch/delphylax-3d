import { ArrowRight, Flame, FlaskConical, RotateCcw } from 'lucide-react'
import { IDENTITY, POD, TIMELINE, PIVOT_REASON } from '../data/research'
import { TEAM_INTRO, MEMBERS, DESIGN_CYCLE, INTERVIEWS } from '../data/team'
import { SiteTabs } from '../components/ui/SiteTabs'
import { Reveal, CardTitle } from '../components/ui/primitives'

/** paths are relative to /team/, so the page works under any host folder */
const ROOT = '../'

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#0f1519]/92 backdrop-blur-md">
      <div className="flex h-[56px] items-center gap-2.5 px-3 sm:gap-5 sm:px-6">
        <a href={ROOT} className="flex shrink-0 items-center gap-3 rounded-md" aria-label="Delphylax, the robot">
          <img src={`${ROOT}logo.png`} alt="" width={35} height={34} style={{ height: 34, width: 'auto' }} draggable={false} />
          <span className="hidden whitespace-nowrap font-display text-base font-700 tracking-[-0.02em] text-white md:inline">DELPHYLAX</span>
        </a>
        <SiteTabs current="team" root={ROOT} />
      </div>
    </header>
  )
}

function SectionTitle({ index, kicker, children }: { index: string; kicker: string; children: React.ReactNode }) {
  return (
    <>
      <div className="label mb-3 flex items-center gap-3">
        <span className="text-[#ff8a73]">{index}</span>
        <span className="h-px w-6 bg-[#e8654f]" aria-hidden />
        <span>{kicker}</span>
      </div>
      <h2 className="font-display text-3xl font-700 leading-tight text-[#f3ede1] sm:text-4xl">{children}</h2>
    </>
  )
}

function Members() {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {MEMBERS.map((m, i) => (
        <li key={m.name}>
          <Reveal delay={i} className="card h-full p-6 sm:p-7">
            <div
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full font-display text-4xl font-700 text-[#0f1519]"
              style={{ background: 'linear-gradient(135deg, #e8654f, #ff8a73)', boxShadow: '0 0 28px rgba(232,101,79,0.35)' }}
              aria-hidden
            >
              {m.name[0]}
            </div>
            <h3 className="mt-5 font-display text-3xl font-700 text-white">{m.name}</h3>
            <p className="mt-1 text-base font-semibold leading-snug text-[#ff8a73]">{m.role}</p>
            {m.focus && <p className="mt-1 text-base leading-relaxed text-[#dbe2e8]">{m.focus}</p>}
            <div className="label mt-6">What I work on</div>
            <ul className="mt-3 space-y-2.5">
              {m.work.map((w) => (
                <li key={w} className="flex items-start gap-3 text-base leading-relaxed text-[#eef3f6]">
                  <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8654f]" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}

/** The design cycle: five steps that light up one after another, then start again. */
function DesignCycle() {
  return (
    <div className="card card-pad">
      <ol className="grid gap-3 md:grid-cols-5 md:gap-0">
        {DESIGN_CYCLE.map((stepName, i) => (
          <li key={stepName} className="relative flex items-center gap-4 md:flex-col md:gap-3 md:px-2 md:text-center">
            {/* the line to the next step */}
            {i < DESIGN_CYCLE.length - 1 && <span className="absolute left-[calc(50%+34px)] right-[calc(-50%+34px)] top-[27px] hidden h-0.5 bg-[#2f3d47] md:block" aria-hidden />}
            <span className="cycle-step flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#3a4852] bg-[#141c22] font-mono text-lg font-semibold text-white" style={{ animationDelay: `${i * 1.4}s` }}>
              {i + 1}
            </span>
            <span className="font-display text-xl font-700 text-white">{stepName}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-base text-[#c3ced6]">
        <RotateCcw size={16} className="shrink-0 text-[#ff8a73]" aria-hidden /> After “Improve” the cycle starts again at “Research”.
      </p>
    </div>
  )
}

function Journey() {
  // the data is newest first; a journey reads better from the start
  const steps = [...TIMELINE].reverse()
  return (
    <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <p className="text-[1.0625rem] leading-relaxed text-[#dbe2e8] sm:text-lg">{PIVOT_REASON}</p>
      <ol className="relative space-y-5 border-l border-white/15 pl-6">
        {steps.map((t, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full"
              style={{
                background: t.state === 'active' ? '#e8654f' : t.state === 'dropped' ? '#475569' : '#5b8fb8',
                boxShadow: t.state === 'active' ? '0 0 10px #e8654f' : 'none',
              }}
              aria-hidden
            />
            <div className="font-mono text-xs text-[#aab8c2]">{t.date}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 font-display text-lg font-700 text-white">
              {t.version}
              {t.state === 'dropped' && <span className="chip !py-0">dropped</span>}
              {t.state === 'active' && (
                <span className="chip !py-0" style={{ color: '#ffb4a6', borderColor: 'rgba(232,101,79,0.5)' }}>
                  now
                </span>
              )}
            </div>
            <p className="mt-0.5 text-base leading-relaxed text-[#c3ced6]">{t.change}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function TeamPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[#e8654f] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0f1519]"
      >
        Skip to content
      </a>
      <div
        className="fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 25% 12%, rgba(22,58,82,0.9) 0%, transparent 55%), radial-gradient(ellipse at 88% 92%, rgba(232,101,79,0.12) 0%, transparent 50%), #0f1519',
        }}
      />
      <Header />

      <main id="main" className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-8">
        {/* hero */}
        <section className="grid items-center gap-8 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <div className="mb-5 flex flex-wrap gap-2">
              {IDENTITY.competitions.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
            <h1 className="font-display text-5xl font-700 leading-[1.02] text-[#f3ede1] sm:text-6xl lg:text-[4.4rem]">
              The team behind <span className="text-gradient">Delphylax</span>
            </h1>
            <p className="mt-6 max-w-[34ch] text-xl leading-relaxed text-[#dbe2e8]">{TEAM_INTRO}</p>
          </Reveal>
          <Reveal delay={1}>
            <img
              src={`${ROOT}boat.webp`}
              alt="The Delphylax robot boat: two white pipe hulls with coral nose cones, joined by a deck that carries a coral cabin with a dolphin fin."
              width={1600}
              height={1000}
              className="mx-auto h-auto w-full max-w-[560px]"
              style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45))' }}
              draggable={false}
            />
          </Reveal>
        </section>

        <section className="mt-14" aria-label="Team members">
          <Members />
        </section>

        <section className="mt-20">
          <Reveal>
            <SectionTitle index="01" kicker="How we work">
              Our design cycle
            </SectionTitle>
          </Reveal>
          <Reveal delay={1} className="mt-6">
            <DesignCycle />
          </Reveal>
        </section>

        <section className="mt-20">
          <Reveal>
            <SectionTitle index="02" kicker="Who we talked to">
              Interviews that shaped the robot
            </SectionTitle>
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
            <Reveal delay={1} className="space-y-4">
              {INTERVIEWS.map((t, i) => (
                <div key={t.who} className="card card-pad">
                  <CardTitle icon={i === 0 ? <Flame size={20} className="text-[#ff8a73]" aria-hidden /> : <FlaskConical size={20} className="text-[#ff8a73]" aria-hidden />}>{t.who}</CardTitle>
                  <p className="mt-2 text-base leading-relaxed text-[#dbe2e8]">{t.detail}</p>
                </div>
              ))}
            </Reveal>
            <Reveal delay={2}>
              <figure className="card h-full border-l-4 !border-l-[#e8654f] p-6 sm:p-7">
                <figcaption className="label">{POD.quoteBy}</figcaption>
                <blockquote className="mt-3 font-display text-2xl font-600 leading-snug text-[#f3ede1]">“{POD.quote}”</blockquote>
                <p className="mt-5 text-base leading-relaxed text-[#dbe2e8]">
                  {POD.intro}: {POD.lines[0].charAt(0).toLowerCase() + POD.lines[0].slice(1)}
                </p>
                <a href={`${ROOT}#pod`} className="btn-secondary btn-sm mt-5">
                  See the Pod <ArrowRight size={15} aria-hidden />
                </a>
              </figure>
            </Reveal>
          </div>
        </section>

        <section className="mt-20">
          <Reveal>
            <SectionTitle index="03" kicker="Our journey">
              From Floodscout to Delphylax
            </SectionTitle>
          </Reveal>
          <Reveal delay={1} className="mt-6">
            <Journey />
          </Reveal>
        </section>

        <footer className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <a href={ROOT} className="flex items-center gap-3 rounded-md">
            <img src={`${ROOT}logo.png`} alt="" width={41} height={40} style={{ height: 40, width: 'auto' }} draggable={false} />
            <span className="font-display text-xl font-700 tracking-[-0.02em] text-white">DELPHYLAX</span>
          </a>
          <div className="text-base text-[#aab8c2]">
            {MEMBERS.map((m) => m.name).join(', ')} · {IDENTITY.competitions.join(' · ')}
          </div>
        </footer>
      </main>
    </>
  )
}
