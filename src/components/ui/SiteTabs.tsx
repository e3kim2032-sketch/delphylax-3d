export type SitePage = 'robot' | 'team' | 'pitch'

/**
 * The three top-level pages. `root` is the relative path back to the site root
 * ("./" on the Robot page, "../" on Team and Pitch), so the links work wherever
 * the site is hosted, including under /delphylax-3d/ on GitHub Pages.
 */
export function SiteTabs({ current, root, className = '' }: { current: SitePage; root: string; className?: string }) {
  const pages: { id: SitePage; label: string; href: string }[] = [
    { id: 'robot', label: 'Robot', href: root },
    { id: 'team', label: 'Team', href: `${root}team/` },
    { id: 'pitch', label: 'Pitch', href: `${root}pitch/` },
  ]
  return (
    <nav aria-label="Pages" className={`site-tabs ${className}`}>
      {pages.map((p) => (
        <a key={p.id} href={p.href} className="site-tab" aria-current={p.id === current ? 'page' : undefined}>
          {p.label}
        </a>
      ))}
    </nav>
  )
}
