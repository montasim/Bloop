import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // prerender: the game is all client-side, so ship static HTML (deployed to Netlify as a static site)
  plugins: [devtools(), tailwindcss(), tanstackStart({ prerender: { enabled: true } }), viteReact()],
})

export default config
