import type { APIRoute } from 'astro';
import { withBase } from '@/lib/paths';

/*
 * robots.txt
 *
 * An endpoint rather than a static file in public/, so the Sitemap: line —
 * which must be an absolute URL — is built from Astro.site along with every
 * other absolute URL on the site. A file in public/ would mean writing the
 * domain down a second time, in the one place nothing would fail if it went
 * stale: a wrong Sitemap: line is not a broken build or a broken page, just a
 * sitemap that quietly stops being read.
 *
 * The whole site is public marketing. There is nothing to disallow, and an
 * empty Disallow is how the standard says "all of it".
 */
export const GET: APIRoute = ({ site }) => {
  const body = `User-agent: *
Disallow:

Sitemap: ${new URL(withBase('/sitemap.xml'), site!).href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
