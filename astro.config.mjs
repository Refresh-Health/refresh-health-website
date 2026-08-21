// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// React is here for exactly one island — the beacon picker inside the booking
// sheet on /platform/. Nothing else on the site hydrates.
//
// Tailwind is the *product's* stylesheet, not the site's. The marketing pages
// are hand-written CSS in public/assets/css/ and stay that way; Tailwind exists
// only so the components extracted from PulseAI render as they do in the app.
// It is imported by src/components/product/ProductShot.astro, never by
// BaseLayout, so the utility bundle never reaches / or /contact/.
// See src/styles/ehr.css for how it is kept from leaking onto the page around it.

// Where this build is going to be served from.
//
// The defaults are the real site, so `npm run build` on a laptop produces
// exactly what production serves and nothing has to be configured to work.
// The overrides exist for GitHub Pages, which serves a repository from
// https://<owner>.github.io/<repo>/ until a custom domain is attached — a
// different origin *and* a directory deeper than the root the markup assumes.
//
// .github/workflows/deploy.yml fills both from actions/configure-pages rather
// than hard-coding them, so the same workflow is correct before and after the
// domain moves: attach refresh.health in the repository's Pages settings and
// the next build picks up SITE_URL=https://refresh.health and an empty
// BASE_PATH on its own.
const site = process.env.SITE_URL || 'https://refresh.health';
// configure-pages reports the root as an empty string; Astro wants '/'.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  // The canonical origin. Everything that has to print an absolute URL —
  // <link rel=canonical>, the og:/twitter: tags, sitemap.xml and the Sitemap:
  // line in robots.txt — derives it from here through Astro.site, so the
  // domain is stated once and a move is a one-line change.
  site,

  // The directory the site is served from, origin excluded. Astro applies it
  // to the URLs it generates itself — bundled CSS and JS, page routes — and
  // publishes it as import.meta.env.BASE_URL for the hand-written paths, which
  // reach it through withBase() in src/lib/paths.ts.
  base,

  // Every internal link is written with a trailing slash and the canonical tag
  // prints one, so the build must produce the directory-with-index.html shape
  // that serves them. It is Astro's default; it is stated here because GitHub
  // Pages, unlike Vercel, will not redirect /contact to /contact/ for a file
  // that isn't laid out this way, and a silent default change would be a site
  // of 404s rather than a visible build error.
  build: { format: 'directory' },

  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
