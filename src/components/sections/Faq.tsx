import { ChevronDown, HelpCircle } from 'lucide-react'
import { FAQ } from '../../data/research'

/**
 * Judge FAQ. Native <details> elements: they open with the mouse, Enter or Space,
 * work without animation, and stay readable if scripts are slow.
 */
export function Faq() {
  return (
    <div id="faq" className="card mt-8 card-pad">
      <h3 className="flex items-center gap-2 font-display text-xl font-700 text-[#f3ede1]">
        <HelpCircle size={18} className="text-[#ff8a73]" aria-hidden /> Questions a judge might ask
      </h3>
      <p className="mt-1 text-base text-[#c3ced6]">Straight answers. Where something is untested or unknown, we say so.</p>
      <div className="mt-4 grid gap-2 lg:grid-cols-2 lg:items-start xl:grid-cols-3">
        {FAQ.map((item) => (
          <details key={item.q} className="faq-item group rounded-md border border-[#26323a] bg-[rgba(22,30,36,0.7)] open:border-[#3a4852]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-4 py-3 font-display text-base font-700 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8a73]">
              {item.q}
              <ChevronDown size={16} className="shrink-0 text-[#aab8c2] transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="px-4 pb-4 text-base leading-relaxed text-[#eef3f6]/90">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
