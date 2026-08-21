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
export default defineConfig({
  // The canonical origin. Everything that has to print an absolute URL —
  // <link rel=canonical>, the og:/twitter: tags, sitemap.xml and the Sitemap:
  // line in robots.txt — derives it from here through Astro.site, so the
  // domain is stated once and a move is a one-line change.
  site: 'https://refresh.health',

  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
