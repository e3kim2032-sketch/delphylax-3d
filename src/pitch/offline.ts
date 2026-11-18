import { useSyncExternalStore } from 'react'

/**
 * "Works offline once loaded": everything the later slides need is fetched while
 * the first slide is showing, so a venue with no Wi-Fi cannot break slide 9.
 */

// ---- the logo, held in memory as a blob so it never has to be fetched again
let logoUrl = '../logo.png'
const listeners = new Set<() => void>()
fetch(logoUrl)
  .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('logo'))))
  .then((b) => {
    logoUrl = URL.createObjectURL(b)
    listeners.forEach((l) => l())
  })
  .catch(() => {
    /* keep the plain address */
  })

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useLogo = () => useSyncExternalStore(subscribe, () => logoUrl)

// ---- every font weight and character set the deck uses (the Greek on slide 4 is its own file)
const SAMPLE = 'Delphylax 0123456789 δελφίς φύλαξ “”‘’ × – & + ? , . : ( ) $ /'
export function warmFonts() {
  if (!('fonts' in document)) return
  const faces: [string, number[]][] = [
    ['Space Grotesk', [500, 600, 700]],
    ['Inter', [400, 500, 600]],
    ['JetBrains Mono', [400, 500, 600]],
  ]
  for (const [family, weights] of faces) for (const w of weights) void document.fonts.load(`${w} 32px "${family}"`, SAMPLE).catch(() => {})
}
