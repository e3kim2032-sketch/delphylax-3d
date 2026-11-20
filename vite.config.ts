import { readdirSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Build photos: lists the image files in public/photos/ as the module `virtual:photos`,
 * so the gallery fills itself in when a photo is dropped into the folder, and the
 * section is left out while the folder is empty.
 */
function photos(): Plugin {
  const id = 'virtual:photos'
  const dir = 'public/photos'
  const list = () => {
    try {
      return readdirSync(dir)
        .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    } catch {
      return []
    }
  }
  return {
    name: 'delphylax-photos',
    resolveId: (source) => (source === id ? `\0${id}` : null),
    load: (resolved) => (resolved === `\0${id}` ? `export default ${JSON.stringify(list())}` : null),
    configureServer(server) {
      // in dev, adding or removing a photo refreshes the page
      const refresh = (file: string) => {
        if (!file.replace(/\\/g, '/').includes(`/${dir}/`)) return
        const mod = server.moduleGraph.getModuleById(`\0${id}`)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh).on('unlink', refresh)
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), photos()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      // three pages: the robot (main site), the team at /team/ and the funding pitch deck at /pitch/
      input: { main: 'index.html', team: 'team/index.html', pitch: 'pitch/index.html' },
      output: {
        /**
         * Keep the 3D engine out of the first load. Anything the text pages need
         * (React, the store) goes in `vendor`, animation libraries in `motion`, and
         * every other package (three.js, its React bindings, post-processing and all
         * of their helpers) goes in `r3f`, which is only fetched with the lazy 3D
         * chunks. The 3D group has to take all of those helpers: a helper left in an
         * app chunk makes `r3f` import that chunk back, and the circular load breaks
         * the production build.
         */
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'vendor', test: /node_modules[\\/](react|react-dom|scheduler|zustand|use-sync-external-store)[\\/]/, priority: 30 },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils|gsap|lenis)[\\/]/, priority: 20 },
            { name: 'r3f', test: /node_modules[\\/](?!(?:react|react-dom|scheduler|zustand|use-sync-external-store|framer-motion|motion-dom|motion-utils|gsap|lenis|lucide-react)[\\/])/, priority: 10 },
          ],
        },
      },
    },
  },
})
