import type { APIRoute } from 'astro';

/*
 * sitemap.xml
 *
 * Hand-rolled rather than @astrojs/sitemap, for two reasons. The integration
 * emits a sitemap *index* pointing at sitemap-0.xml, which is the right shape
 * for a site with thousands of URLs and an odd thing to hand a search console
 * for three; and it is a dependency to carry for output this site can generate
 * in a few lines. If the page count ever reaches the point where splitting
 * matters — 50,000 URLs, or 50MB — swap this for the integration.
 *
 * Routes are discovered from the page files themselves, so a new page is in
 * the sitemap the moment it exists. Nobody has to remember this file.
 */

// Eager, so the module namespaces are available synchronously here and the
// `noindex` opt-out below can be read at build time.
const pages = import.meta.glob<Record<string, unknown>>('./**/*.astro', { eager: true });

/*
 * No <lastmod>, <changefreq> or <priority>.
 *
 * Google ignores the last two outright. It does read lastmod, but only while
 * it trusts it — and the only date available at build time is the build's own,
 * which would claim every page changed on every deploy. A sitemap that says
 * that about pages which did not change is a sitemap whose dates get ignored,
 * so the honest thing is a bare <loc> list. Add lastmod here when there is a
 * real per-page date to put in it.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = site!;

  const routes = Object.entries(pages)
    // A dynamic route cannot be enumerated from its filename; there are none
    // today, and this keeps a future one from printing a literal `[slug]`.
    .filter(([file]) => !file.includes('['))
    // A page opts out with `export const noindex = true` in its frontmatter,
    // which is also what it passes to BaseLayout's noindex prop.
    .filter(([, mod]) => mod.noindex !== true)
    .map(([file]) =>
      file
        .replace(/^\.\//, '')
        .replace(/\.astro$/, '')
        // `index` is the directory itself, not a segment of the URL:
        // ./index.astro is the root, ./contact/index.astro is /contact/.
        // The slash comes back below, once, for every route alike.
        .replace(/(^|\/)index$/, ''),
    )
    // Directory-format build: every URL ends in a slash, matching the
    // canonical tag BaseLayout prints.
    .map((route) => new URL(route ? `${route}/` : '', origin).href)
    .sort();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
