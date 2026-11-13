import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Menu, X } from 'lucide-react'
import { DelphylaxMark } from '../ui/DelphylaxLogo'
import { useSiteStore, type Section } from '../../store/useSiteStore'
import { SECTIONS } from '../../data/research'
import { scrollToSection } from '../../hooks/useScrollSync'

/**
 * The site's single fixed overlay: a header with the logo, section nav and the
 * "Try the sonar" button. Solid on phones so text never shows behind it.
 */
export function HudOverlay() {
  const section = useSiteStore((s) => s.section)
  const sandboxOpen = useSiteStore((s) => s.sandboxOpen)
  const openSandbox = useSiteStore((s) => s.openSandbox)
  const [menu, setMenu] = useState(false)

  const jump = (id: Section) => {
    setMenu(false)
    scrollToSection(id)
  }

  if (sandboxOpen) return null

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-[#28343c] bg-[#0f1519] md:border-transparent md:bg-[linear-gradient(180deg,#0f1519_0%,rgba(15,21,25,0.75)_60%,transparent_100%)]">
      <div className="flex items-center justify-between px-5 py-3 sm:px-10">
        <button onClick={() => jump('hero')} className="flex items-center gap-3" aria-label="Delphylax home">
          <DelphylaxMark size={38} />
          <span className="font-display hidden text-base font-700 tracking-[-0.02em] text-[#eef3f6] sm:inline lg:hidden xl:inline">DELPHYLAX</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Sections">
          {SECTIONS.map((s) => {
            const active = s.id === section
            return (
              <button
                key={s.id}
                onClick={() => jump(s.id as Section)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-[#1b252c] text-[#eef3f6]' : 'text-[#b7c3cc] hover:text-[#eef3f6]'}`}
              >
                {s.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={openSandbox} className="btn-primary !px-4 !py-2 !text-sm" aria-label="Try the sonar">
            <Radio size={15} />
            <span className="hidden sm:inline">Try the sonar</span>
            <span className="sm:hidden">Sonar</span>
          </button>
          <button onClick={() => setMenu((m) => !m)} className="card rounded-full p-2 text-[#eef3f6] lg:hidden" aria-label="Toggle navigation">
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="card absolute right-4 top-16 flex min-w-48 flex-col p-2 lg:hidden">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => jump(s.id as Section)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base text-[#eef3f6] hover:bg-white/5">
                <span className="font-mono text-xs text-[#b7c3cc]">{s.index}</span>
                {s.label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
