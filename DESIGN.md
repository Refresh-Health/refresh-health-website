# Design

The visual system of the Refresh Health marketing site, recorded so it survives
a change of positioning. This file describes what is actually built and shipping
— it is derived from the code, not from intentions.

**Why it exists.** The product record under this site has now been rewritten
twice — care-management "HealthOS", then the PulseOS EHR, and now an AI-native
**HealthOS** platform for clinics, hospitals and home care. Each time, most of
the site's *copy, page structure and imagery* went with it. The *design system*
did not. This file draws the line: everything under **The system** is
product-agnostic and should be carried forward; everything under
**Product-coupled** belongs to whichever positioning is current and should be
expected to move again.

**Current positioning, as built** (2026-08-19): the product is **HealthOS**, an
AI-native platform for clinics, hospitals and home care. The **Secure, Simple,
Intelligent** pillars that replaced the older Platform / Process / People
triptych lasted one day on the product page: on 2026-08-19 the team scrapped
them there in favour of the product itself, and [/platform/](src/pages/platform/index.astro)
is now a five-step walkthrough of a single visit built from components
extracted from the running software — book and check in, presence, record,
enrich, sign. The pillars still name the homepage's
feature rows. [PRODUCT.md](PRODUCT.md) still holds the PulseOS EHR record and is
background rather than authority; see the reset note at the top of it.

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
| Accent — the second pillar (Simple) | `--green-primary` / `--green-dark` | `#82B0A1` / `#769B8F` |
| Accent — the third pillar (Intelligent) | `--gold` | `#E4AB0F` |

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

- **~~The Platform / Process / People triptych~~ — the structure survived, the
  words did not.** The blue/green/gold feature cards and
  [ApproachDiagram.astro](src/components/ApproachDiagram.astro) — a 300-line
  hand-built SVG orbit diagram, the most intricate thing on the site, with
  pulses carried along the orbit arcs by `offset-path` and staggered lattice
  cells firing as each packet arrives, and the site's own critique's *"clearest
  authored decision on the site"*. The triptych is now **Secure / Simple /
  Intelligent**, one feature row each, in the same three accent colours, so the
  green and gold tokens keep their user.

  The diagram was **relabelled rather than rebuilt**. Its three words are the
  only part of the drawing a positioning change touches, so they are no longer
  Figma's outlined glyphs: they are live `<text>` (`.ad-word`, styled in
  [home.css](public/assets/css/home.css)) set in the site's own heading font at
  the size and colour the outlines had, sitting on the coordinates Figma
  exported. Centre reads **HealthOS**, the two orbiting discs read **Care** and
  **Record** — the loop the existing motion already described. The heart mark
  carried over to Care; the gear beside the old *Process* was swapped for a
  lucide file glyph on the same centre. **Retype the words, do not redraw
  them** — every coordinate in the motion CSS is keyed to the exported
  geometry.
- **~~solutions.css~~ (532 lines) — removed**, with the Solutions page: the
  disease wheel with its CSS halo and rotated labels, the constellation
  backdrop, the CPT-code card grid. Every one was bound to a retired
  capability.
- **~~[platform.css](public/assets/css/platform.css)~~ — was trimmed to a
  scaffold, now rebuilt for the walkthrough.** The `.pillar` rules lasted a day
  and went the way of the ones before them; the file now carries `.pshot`, the
  two-column step layout and the frame around each product screen. The outline rings, the
  term/description `.spec-list`, the `.ai-card` grid, and the presence, workflow
  and posture blocks went with the copy they served — several had already
  outlived their markup. The treatments are reusable and `git log --
  public/assets/css/platform.css` still has them; they were removed rather than
  left to drift.
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
- **Jargon shipped untranslated.** Was FHIR/SDoH/CPT codes, then the PulseOS
  vocabulary (encounter, rooming, chart hold, co-location). The current copy
  answers this by staying at platform altitude and naming no mechanism at all,
  which trades the jargon risk for the interchangeability risk directly above
  — the two findings pull against each other, and the reset chose this side of
  it deliberately.
- **`.display--outline` reads as placeholder.** Muted grey section labels look
  unfinished rather than anchoring.
- **Dashed photo-placeholder boxes** undermined the finished-product
  impression. They are gone from the homepage; do not reintroduce the pattern —
  and note the pre-launch evidence rules make real screenshots the only
  honest fill.
- **Copy consistency.** "Refresh health" (lowercase h) appeared across all three
  pages. Watch the same for HealthOS — one word, capital H and capital OS, never
  "Health OS" or "HealthOs".

---

## Stack

Astro 7. Stylesheets are plain CSS in
[public/assets/css/](public/assets/css/), loaded in a fixed order — `base.css`,
`components.css`, then one page stylesheet passed to
[BaseLayout.astro](src/layouts/BaseLayout.astro) as the `pageStylesheet` prop.
The `@/` alias resolves to `src/`. Deployed on Vercel.

**Two integrations exist for /platform/ alone** (added 2026-08-19), and the
distinction is worth keeping:

- **Tailwind v4** (`@tailwindcss/vite`) is the *product's* stylesheet, not the
  site's. The marketing pages are hand-written CSS and stay that way. Tailwind
  exists only so the components extracted from HealthOS render as they do in
  the app. It is imported by
  [ProductShot.astro](src/components/ProductShot.astro), never by BaseLayout,
  so the utility bundle never reaches `/` or `/contact/` — verify with
  `grep -c _astro dist/index.html`, which must stay 0.
- **React** (`@astrojs/react`) hydrates exactly one island: the beacon dropdown
  inside the booking sheet.

[ehr.css](src/styles/ehr.css) is where the two vocabularies are kept apart, and
its header comment is required reading before touching either. Three things
there are load-bearing and none is obvious: Tailwind's Preflight is deliberately
**not** imported (it is a global reset and would fight `base.css` site-wide, so
the handful of rules the components actually need are re-stated scoped to
`.ehr-surface`); utilities are imported **unlayered** while that scoped reset
sits in `@layer base`, so a utility can never be shadowed by the reset; and
source scanning is pinned with `source(none)` + an explicit `@source`, because
Tailwind reads candidates out of raw file text — the word *container* sitting in
an ordinary code comment was enough to emit Tailwind's `.container` utility and
break the site's own layout column. That is also why site components live
outside `src/components/product/`: that directory is scanned, and it holds only
code lifted verbatim from the product repo so it stays diffable against it.
