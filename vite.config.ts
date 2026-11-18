import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      // two pages: the main site and the funding pitch deck at /pitch/
      input: { main: 'index.html', pitch: 'pitch/index.html' },
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
