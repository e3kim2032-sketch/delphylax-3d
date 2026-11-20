# DELPHYLAX — Guardian of Zero-Visibility Waters

Interactive 3D scrollytelling site for **Delphylax** (Greek: dolphin + guardian), a 94 cm PVC
catamaran rescue scout for street floods built for the **Conrad Challenge** and **KSEF 2027**.
It searches muddy water with a sonar sensor (DFRobot SEN0599, with a fish finder as backup), maps
obstacles above the water with an RPLIDAR C1, spots people at the surface with an AMG8833 thermal
camera, then drops a glowing marker where rescuers should look.

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

## Funding pitch deck (`/pitch/`)

A second page built from the same project: `pitch/index.html` → `src/pitch/`. It is a
14-slide presentation that reuses the site's palette, fonts and 3D boat.

- **Slides** are designed on a fixed 1920 × 1080 frame (`src/pitch/slides.tsx`,
  `pitch.css`) and scaled as one piece to fit any window. The 3D canvas covers the
  whole window; the camera frustum is widened around the 16:9 frame, so nothing
  designed is cropped on other aspect ratios.
- **3D stage** (`src/pitch/Stage3D.tsx`) renders `BoatParts` from the main model, plus
  what only the pitch talks about: the LiDAR puck, halo rings on the highlighted part,
  sonar pings, and the Delphylax Pod drop. Camera shots per slide/step are in `SHOTS`,
  `HOW` and `POD`.
- **Controls**: → / ↓ / Space / PageDown next, ← / ↑ / PageUp / Shift+Space back
  (steps inside a slide included), Home / End, F for fullscreen, and on-screen
  back/next buttons. The address keeps the position (`#5.2` = slide 5, step 2).
- **Offline**: the logo and every font file are fetched while slide 1 is showing
  (`src/pitch/offline.ts`), so once the page has loaded it needs no network.
- `prefers-reduced-motion` shows every slide in its final state with a still camera.
- The page is `noindex`. The Robot / Team / Pitch tabs link to it; they hide while the deck is full screen.

The build has two inputs (`vite.config.ts`). The `r3f` chunk group must catch every
3D-side package: a helper left in an app chunk makes `r3f` import it back, and that
circular load breaks the production build (it does not show up in `npm run dev`).

## Pages and tabs

Three pages share one header control (`src/components/ui/SiteTabs.tsx`): **Robot** (`/`),
**Team** (`/team/`) and **Pitch** (`/pitch/`). Each is its own Vite input in
`vite.config.ts`, and every link between them is relative, so the site works under
`/delphylax-3d/` on GitHub Pages. On the Robot page a second, smaller header row lists
the sections of that page.

- **Team page** (`team/index.html` → `src/team/`, content in `src/data/team.ts`): first
  names only. No last names, school, ages, emails or photos of people.
- **Tabbed cards** (`src/components/ui/Tabs.tsx`) keep the Robot page to about 8 screens
  at 1440 × 900: Parts / Specs / Water tests / Hull lab in Engineering, and the business
  details in Business. Only one panel is rendered at a time.
- **The Delphylax Pod** is one shared 3D component (`src/components/canvas/Pod.tsx`) used
  by the Robot page, the pitch and the still render. Its wording lives in `POD` in
  `src/data/research.ts`.

## Build photos

Drop image files (JPG, PNG, WebP, AVIF; export iPhone HEIC as JPG first) into
`public/photos/`. A small plugin in `vite.config.ts` lists that folder as the module
`virtual:photos`, so the "Build photos" gallery on the Robot page appears by itself and
stays hidden while the folder is empty. Captions and alt text go in `src/data/photos.ts`.
No faces, name tags or school logos in the photos.

## Still image of the boat

`public/boat.webp` (the hero in Read mode, and the Team page) is a render of the real
3D model. To refresh it after changing the model: run `npm run dev`, open
`/tools/render.html` (the boat on a transparent background, not part of the built site),
screenshot it with a transparent background, crop, and save it over `public/boat.webp`.
