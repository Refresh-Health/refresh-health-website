# Design

The visual system of the Refresh Health marketing site, recorded so it survives
the PulseOS rebuild. This file describes what is actually built and shipping —
it is derived from the code, not from intentions.

**Why it exists.** [PRODUCT.md](PRODUCT.md) replaced a care-management product
record with an EHR one, and most of the site's *copy, page structure and
imagery* goes with it. The *design system* does not. This file draws the line:
everything under **The system** is product-agnostic and should be carried
forward; everything under **Product-coupled** dies with the old positioning.

---

## The system — carry this forward

### Tokens

All tokens live in [`:root`](public/assets/css/base.css) and are the single
source of truth. Nothing in the site hardcodes a hex value outside that block
except SVG fills.

**Palette.** A cool desaturated blue family carries the site; green and gold
appear only as accents.

| Role | Token | Value |
|---|---|---|
| Deep accent, focus ring, outline headings | `--blue-accent` | `#26669F` |
| Band background | `--blue-bg` | `#B4C6D1` |
| Primary blue, rules | `--blue-primary` | `#7AA3BD` |
| Muted text, offset shadow | `--blue-dark` | `#6993AE` |
| Pale surface | `--blue-pale` | `#E2EDF4` |
| Body text | `--text-dark` | `#323232` |
| Accent — process | `--green-primary` / `--green-dark` | `#82B0A1` / `#769B8F` |
| Accent — people | `--gold` | `#E4AB0F` |

Semantic aliases (`--text`, `--surface`, `--surface-band`, `--border`,
`--focus`) sit on top of the raw palette; components reference the aliases.
There is no dark mode.

**Type.** Two families, loaded from Google Fonts in
[BaseLayout.astro](src/layouts/BaseLayout.astro).

- **Jost** (400–800) — `--font-heading`. All headings and page titles.
- **Work Sans** (400/500/700) — `--font-body`. Body, eyebrow, UI labels, buttons.

Four fluid type classes do nearly all the work: `.display`
(clamp 36→96px, line-height 0.95, the big statement heading), `.heading`
(clamp 28→40px), `.eyebrow` (clamp 19→24px, bold, blue, letterspaced — the small
label that titles a section), `.body` (18px/24px, with `--sm`, `--lead`,
`--invert` and `--measure` modifiers). Prefer a modifier over a new class.

**Scale.** Spacing runs `--space-3xs` 4px → `--space-4xl` 128px on a familiar
4/8 rhythm. Radii: 8 / 15 / 30 / pill. Content column is `--container` 1240px
(from a 1440px Figma canvas) with `--container-narrow` 900px and a fluid
`--gutter`.

**Motion.** `--transition` 200ms ease, `--transition-fast` 120ms. Both are
zeroed under `prefers-reduced-motion`, alongside a global animation kill in
[base.css](public/assets/css/base.css) — keep that block. Two habits in the
existing animation work are worth keeping as house style regardless of what gets
animated next: looping animations are gated behind an `.is-settled` class rather
than running on load, and paused via `animation-play-state` behind `.is-paused`
when offscreen or in a hidden tab; and progressive enhancements sit inside
`@supports`, degrading to a resting state rather than a broken one.

### The one authored material: frosted glass

The site's most distinctive and most repeated decision. A translucent white
pane with `backdrop-filter` blur, a soft inner highlight and a flat offset
shadow (`--shadow-offset: 5px 5px 0 var(--blue-dark)`), used for the header
logo, the nav bar, every hero panel and the CTA panel. The recipe is duplicated
across five stylesheets, each carrying the comment *"Same frosted-glass recipe
as `.button-bar` / `.site-header .logo` / …"*.

**Every one of those copies has a `@supports not (backdrop-filter: blur())`
fallback** that keeps the bars, gradients and shadows so the material still
reads as glass without the blur. Do not drop the fallbacks.

**Rebuild note:** this is the clearest candidate for consolidation — promote the
recipe to one class in `components.css` rather than re-pasting it a sixth time.

### Fluid-by-default layout

Every size that matters is a `clamp()`, so breakpoints only handle *reflow* —
multi-column grids collapsing to one — never resizing. **900px** is the standard
one and covers ten of the twelve layout queries; `components.css` and `home.css`
wrap the header at **720px**, with one-off 820px and 560px queries in
`solutions.css` and `contact.css`. Sections size themselves through `.section`,
`.section--tight`, `.section--loose` and the `--flush-top`/`--flush-bottom`
modifiers. Keep the discipline — reach for a clamp first, and add a breakpoint
only when a grid genuinely has to reflow.

`body` carries `overflow-x: clip` (not `hidden`) so decorative artwork can bleed
past the canvas edge without creating a scroll container that breaks
`position: sticky`.

### Durable components

In [components.css](public/assets/css/components.css), which repeats on every
page:

- **`.site-header`** — transparent; whatever band it sits on supplies the
  background. On hero pages it is the hero's first child.
- **`.button-bar`** — the nav links grouped into one glass pill, with a
  **traveling spotlight**: a second glass pane that JS glides to the hovered or
  focused item, in [ButtonBar.astro](src/components/ButtonBar.astro). It is pure
  enhancement — the per-item `:hover` and `[aria-current]` styling works with
  zero JS, and the spotlight hides on resize rather than re-measuring.
- **`.pill-button`** — the shared CTA button, gradient border into `--blue-sky`.
- **`.site-footer`** / **`.contact-list`** / **`.contact-item`** — logo plus
  icon-led contact lines.
- **`.section-marker`** — the gradient arrow set before an `.eyebrow` title.

`components.css` opens with a long **canonical markup** block: paste-ready
skeletons for the header, CTA and footer. It predates the Astro components and
still uses `{A}`-style relative-path placeholders and `index.html` URLs. The
Astro components in [src/components/](src/components/) are now the real source
of truth — **update or delete that comment block during the rebuild** rather
than letting the two drift further apart.

### Accessibility already in the build

Worth preserving verbatim, and cheaper to keep than to re-add: a visible
`:focus-visible` ring in `--blue-accent` with 3px offset; `.visually-hidden`;
`aria-labelledby` on every page section; `aria-current="page"` on the active nav
item; `alt=""` on all decorative art with real descriptions on content imagery;
`aria-hidden` on decor wrappers; the reduced-motion block. No formal conformance
level is committed — see Accessibility & Inclusion in [PRODUCT.md](PRODUCT.md).

---

## Product-coupled — expect to lose this

Structure and artwork that exist to argue the old positioning:

- **The Platform / Process / People triptych** — blue/green/gold feature cards
  on the homepage, and [ApproachDiagram.astro](src/components/ApproachDiagram.astro),
  a 300-line hand-built SVG orbit diagram — the most intricate thing on the
  site, with pulses carried along the orbit arcs by `offset-path` and staggered
  lattice cells firing as each packet arrives. Noted in the site's own critique as
  *"the clearest authored decision on the site"*, and also the most explicit
  statement of a physician-led-care-team product that no longer exists. If the
  triptych goes, the green and gold accent tokens have no remaining user.
- **[solutions.css](public/assets/css/solutions.css)** (532 lines) — the disease
  wheel with its CSS halo and rotated labels, the constellation backdrop, the
  CPT-code card grid. Every one of these is bound to a retired capability.
- **[platform.css](public/assets/css/platform.css)** — the haze band, the
  outline rings, the `.photo-frame` white-wash treatment. The *treatments* are
  reusable; the page they compose is not.
- **The hero decor set** — hex cluster, gears, circuit lines in
  [public/assets/decor/](public/assets/decor/). Generic healthcare-tech line art;
  the critique flagged the visual language as *"indistinguishable from a CRM
  vendor, a telehealth startup, or a hospital software suite."* The rebuild has
  reason to replace rather than re-place it.

**Asset inventory and what may be reused** is in Evidence on Hand in
[PRODUCT.md](PRODUCT.md).

---

## Standing critique

[.impeccable/critique/](.impeccable/critique/) holds a dual-agent review of the
homepage scoring **16/24**. Findings that outlive the pivot:

- **Category-interchangeable.** The strongest verdict, and the one the rebuild
  should answer: the site reads as a competent B2B healthcare template rather
  than as an argument for a specific product.
- **Jargon shipped untranslated.** Was FHIR/SDoH/CPT codes; the PulseOS
  vocabulary (encounter, rooming, chart hold, co-location) carries the same
  risk. [PRODUCT.md](PRODUCT.md) names the terms customer-facing copy may use.
- **`.display--outline` reads as placeholder.** Muted grey section labels look
  unfinished rather than anchoring.
- **Dashed photo-placeholder boxes** undermined the finished-product
  impression. They are gone from the homepage; do not reintroduce the pattern —
  and note the pre-launch evidence rules make real screenshots the only
  honest fill.
- **Copy consistency.** "Refresh health" (lowercase h) appeared across all three
  pages. Watch the same for PulseOS and Maya.

---

## Stack

Astro 7 with no framework integrations, no CSS pipeline and no build step
beyond `astro build`. Stylesheets are plain CSS in
[public/assets/css/](public/assets/css/), loaded in a fixed order — `base.css`,
`components.css`, then one page stylesheet passed to
[BaseLayout.astro](src/layouts/BaseLayout.astro) as the `pageStylesheet` prop.
The `@/` alias resolves to `src/`. Deployed on Vercel.
