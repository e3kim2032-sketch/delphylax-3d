import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        /**
         * Keep the 3D engine out of the first load. Anything the text page needs
         * (React, the store) goes in `vendor`; three.js and its React bindings go
         * in `r3f`, which is only fetched together with the lazy Scene chunk.
         * Dependencies are not pulled in recursively, so a shared library such as
         * zustand can never end up inside the 3D bundle.
         */
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'vendor', test: /node_modules[\\/](react|react-dom|scheduler|zustand|use-sync-external-store)[\\/]/, priority: 30 },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils|gsap|lenis)[\\/]/, priority: 20 },
            { name: 'r3f', test: /node_modules[\\/](three|@react-three|postprocessing)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
})
