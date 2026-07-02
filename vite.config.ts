import { defineConfig } from 'vite'

// Relative base so the built asset URLs resolve whether the site is served
// from a domain root or a GitHub Pages project subpath
// (https://<user>.github.io/third-war-chronicle/).
export default defineConfig({
  base: './',
})
