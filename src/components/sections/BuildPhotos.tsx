import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react'
import files from 'virtual:photos'
import { PHOTO_CAPTIONS } from '../../data/photos'
import { lockScroll } from '../../hooks/useScrollSync'
import { Reveal, CardTitle } from '../ui/primitives'

const src = (file: string) => `${import.meta.env.BASE_URL}photos/${encodeURIComponent(file)}`
const info = (file: string) => PHOTO_CAPTIONS[file] ?? {}
/** a readable fallback when a photo has no caption yet: "hull-test_01.jpg" becomes "hull test 01" */
const fallback = (file: string) => file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')

/**
 * Build photos. The list comes from the files in public/photos/ (found at build time),
 * so adding a photo is just dropping the file in. With no photos the section is not rendered at all.
 */
export function BuildPhotos() {
  const [open, setOpen] = useState<number | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const count = files.length
  const isOpen = open !== null

  const close = useCallback(() => {
    setOpen(null)
    opener.current?.focus()
  }, [])
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count])

  useEffect(() => {
    if (!isOpen) return
    lockScroll(true)
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [isOpen, close, step])

  if (count === 0) return null
  const current = open === null ? null : files[open]

  return (
    <section id="photos" className="pointer-events-none relative w-full px-4 pb-16 pt-6 sm:px-8 sm:pb-20 lg:px-20" aria-labelledby="photos-title">
      <div className="pointer-events-auto mx-auto w-full max-w-7xl">
        <Reveal>
          <CardTitle icon={<Camera size={20} className="text-[#ff8a73]" aria-hidden />}>
            <span id="photos-title">Build photos</span>
          </CardTitle>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((file, i) => {
              const { caption, alt } = info(file)
              return (
                <li key={file}>
                  <button
                    type="button"
                    className="card card-action group block w-full overflow-hidden text-left"
                    onClick={(e) => {
                      opener.current = e.currentTarget
                      setOpen(i)
                    }}
                    aria-label={`Enlarge photo: ${caption ?? fallback(file)}`}
                  >
                    <img src={src(file)} alt={alt ?? caption ?? fallback(file)} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    {caption && <span className="block px-3.5 py-2.5 text-base leading-snug text-[#dbe2e8]">{caption}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>

      {/* the enlarged photo is drawn on top of everything, header included */}
      {current &&
        open !== null &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo"
          data-lenis-prevent
          className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b1014]/95 p-4 sm:p-8"
          onClick={close}
        >
          <figure className="flex max-h-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={src(current)} alt={info(current).alt ?? info(current).caption ?? fallback(current)} className="max-h-[78vh] w-auto max-w-full rounded-[10px] border border-white/10 object-contain" />
            <figcaption className="mt-3 text-center text-base leading-relaxed text-[#eef3f6]">
              {info(current).caption ?? fallback(current)}
              <span className="ml-3 font-mono text-xs text-[#aab8c2]">
                {open + 1} / {count}
              </span>
            </figcaption>
          </figure>
          <button ref={closeBtn} type="button" className="btn-secondary btn-sm absolute right-4 top-4 !px-2.5" onClick={close} aria-label="Close photo">
            <X size={18} aria-hidden />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                className="btn-secondary btn-sm absolute left-3 top-1/2 -translate-y-1/2 !px-2.5"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm absolute right-3 top-1/2 -translate-y-1/2 !px-2.5"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            </>
          )}
        </div>,
          document.body,
        )}
    </section>
  )
}
