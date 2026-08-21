/*
 * Root-relative URLs, written once against the deployed base path.
 *
 * The site is built to be served from the root of a domain — refresh.health —
 * and every href and src in the source is written that way. GitHub Pages will
 * serve it from the root too, but only once a custom domain is attached; until
 * then a repository is published under its own name, at
 * /<repo>/, and every `/assets/...` in the markup points at the domain root
 * instead, one directory above where the files actually are.
 *
 * Astro already knows the answer: `base` in astro.config.mjs is exposed to
 * every module as import.meta.env.BASE_URL, and is baked in at build time. So
 * the fix is not to rewrite the site for a subdirectory — it is to stop
 * writing the leading slash by hand and let the build state it.
 *
 * Deployed at a domain root this is the identity function and costs nothing.
 * That is the point: one call shape that is correct under either arrangement,
 * so moving between them is an environment variable rather than a diff.
 *
 * Only for paths this site serves. External URLs, fragment-only links and
 * anything Astro resolves itself (`import`ed assets, <Image />) must not go
 * through here — Astro already applies the base to those, and a second
 * application would double the prefix.
 */

/** `/assets/icons/logo.svg` → `/refresh-website/assets/icons/logo.svg` */
export function withBase(path: string): string {
  // BASE_URL is normalised by Astro to always carry a trailing slash — "/" at
  // a domain root, "/refresh-website/" under a repository. Dropping it here
  // and taking the one the caller's own leading slash provides is what keeps
  // the root case from producing "//assets/...", which is protocol-relative
  // and would send the browser to a host named "assets".
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
