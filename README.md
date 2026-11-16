# DELPHYLAX — Guardian of Zero-Visibility Waters

Interactive 3D scrollytelling site for **Delphylax** (Greek: dolphin + guardian), a 94 cm PVC
catamaran rescue scout for street floods built for the **Conrad Challenge** and **KSEF 2027**.
It searches muddy water with a fish-finder sonar and an AMG8833 thermal camera, then drops a
glowing marker where rescuers should look.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview
```

## Stack

- Vite + React 19 + TypeScript (strict)
- three / @react-three/fiber / drei / postprocessing (Bloom, Vignette, ping-synced ChromaticAberration)
- GSAP ScrollTrigger + Lenis (synced through the GSAP ticker)
- Tailwind CSS 4, framer-motion, lucide-react, zustand

Everything in the 3D scene is procedural — there are no `.glb`, HDR or texture downloads that can fail.

## Structure

```
src/
  data/research.ts            every number on the site, sourced from delphylax-overview.md (+ ksef-research.md for the problem stats)
  store/useSiteStore.ts       scroll / mode / pings / target-lock state
  hooks/useScrollSync.ts      Lenis + ScrollTrigger + section progress
  components/
    canvas/
      Scene.tsx               Canvas, procedural reflection environment
      DelphylaxModel.tsx      procedural catamaran (mm-accurate port of the design), exploded view, thrusters, marker rack, callouts
      SonarWaveShader.ts      GLSL sonar wavefront / interference / victim-reveal shader
      SonarField.tsx          riverbed terrain, instanced debris, victim, target lock
      AbyssalEnvironment.tsx  water surface, sky/abyss dome, sediment particles, fog
      CameraRig.tsx           scroll waypoints + mouse parallax
      Effects.tsx             post-processing
    hud/HudOverlay.tsx        header (nav, Read mode toggle) + HUD instruments, shown only in the hero and Field Test
    ui/DelphylaxLogo.tsx      vector mark + lockup (vectorised from the hand-drawn sketch)
    sections/                 Hero · Crisis (incident timeline, FVI) · Engineering (parts legend, RescueConcept) · Sandbox · Matrix · Business (revenue, SDGs, policy, Faq)
```

## Data provenance

`delphylax-overview.md` is the project overview (13 Nov 2026) and the source of every spec,
part price, timeline entry and build-status item. `ksef-research.md` (from the KSEF deck) supplies
the Seoul 2022 problem statistics. The overview marks several figures as estimates (weight,
thrust, drag, top speed, all prices); the site flags them as `est.` and labels the first water
test as pending rather than inventing results. The river-dolphin bioacoustics are presented as
the inspiration, not as Delphylax measurements.

## Interactions

- Click anywhere on the water/debris field, press **Emit Sonar Ping**, or wait — Delphylax pings autonomously.
- Section 03: **X-Ray / Exploded View**, **Searchlights**, six subsystem callouts, buoyancy / hull-speed lab.
- Section 04: **Clutter density**, **Echo filter on/off**, re-hide target, and **Drop glow marker** once locked (4 per rack).

## Read mode and loading

- **Read mode** (nav toggle, remembered in `localStorage`) turns the 3D canvas and post-processing off and
  shows the same content on a static backdrop. It starts on by itself when WebGL is missing, the visitor
  prefers reduced motion, or the device reports 4 or fewer CPU cores or 4 GB or less memory.
- three.js loads lazily: the entry page needs only the `vendor`, `motion` and `index` chunks; `Scene` and
  `r3f` are fetched after the text has painted (see `codeSplitting` in `vite.config.ts`).
  Keep `sceneRefs.ts` and anything the text sections import free of `three` imports, or the 3D bundle
  becomes part of the first load again.
- `index.html` has a `<noscript>` summary; `public/cost-notes.html` is the linked source page for the cost estimate.
