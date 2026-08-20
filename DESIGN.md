# Design

The visual system of the Refresh Health marketing site, recorded so it survives
a change of positioning. This file describes what is actually built and shipping
— it is derived from the code, not from intentions.

**Why it exists.** The product record under this site has now been rewritten
twice — care-management "HealthOS", then the PulseOS EHR, and now an AI-native
**PulseAI** platform for clinics, hospitals and home care. Each time, most of
the site's *copy, page structure and imagery* went with it. The *design system*
did not. This file draws the line: everything under **The system** is
product-agnostic and should be carried forward; everything under
**Product-coupled** belongs to whichever positioning is current and should be
expected to move again.

**Current positioning, as built** (2026-08-19): the product is **PulseAI**, an
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
source of truth. The colour system is three layers, in that order inside the
block, and each layer may only reference the one above it:

1. **Palette primitives** — the only literal colour values in the site. Every
   other colour, everywhere, resolves back here through `var()`.
2. **Semantic aliases** — what a colour is *for* (`--text`, `--surface`,
   `--border`, `--focus`). Components reference these wherever a role exists
   for the thing being painted.
3. **Material tokens** — the glass recipe, the two veils, the decorative-ink
   and photo-seating knobs.

**The site is dark, and only dark.** There is no light theme, no
`prefers-color-scheme` branch and no toggle: the `:root` block *is* the theme.

### The idea the palette is built on

True black, and colour that stays quiet on it. The ground is literal `#000000`
and the surfaces above it are neutral greys, so nothing in the substrate has a
temperature to fight the accents.

Pure black is a hard ground to put colour on: it drives contrast up so far that
an ordinary accent turns electric. So the three pillar accents are pulled
**down** rather than up — a steel blue, a muted sea green and an old gold, all
landing in a narrow band just above the 4.5:1 floor rather than glowing well
past it. That shared register is what keeps Secure / Simple / Intelligent
reading as one family instead of three unrelated lights.

| Role | Token | Value |
|---|---|---|
| Page ground | `--ground` | `#000000` |
| Band / raised surface | `--band` / `--panel` | `#0B0B0B` / `#161616` |
| Hairlines | `--line` | `#262626` |
| Body ink | `--ink` | `#EDEAE6` |
| Secondary / fine print | `--ink-muted` / `--ink-subtle` | `#A5A29D` / `#918E88` |
| Links, section labels, focus ring — the first pillar (Secure) | `--blue-accent` | `#4189BD` |
| Rules, strokes, artwork — **never text** | `--blue-primary` | `#35719E` |
| The second pillar (Simple) | `--green-ink` / `--green-primary` | `#6FBFA0` / `#59A98C` |
| The third pillar (Intelligent) | `--gold-ink` / `--gold` | `#D9AE43` / `#D2A62E` |

Two constraints in that table are load-bearing:

- `--blue-accent` is **the deepest blue the contrast floor allows**. It carries
  links, section labels and the focus ring, so it cannot go darker without
  failing 4.5:1 on `--panel` (it currently sits at 4.77). If a future change
  wants a deeper blue, something else has to give first.
- `--blue-primary` sits below the floor on purpose and is therefore reserved
  for rules, strokes and artwork. Never set text in it, and never use it as a
  fill behind text — that is why the `.point__tag` chips take `--blue-accent`.

**Alpha.** A colour is defined once, as hex. Translucency is applied at the
point of use with `color-mix(in srgb, var(--token) N%, transparent)`, never by
re-typing the colour as `rgba()`. That is what keeps a re-skin reaching the
translucent uses too, and it is why there are no `--token-rgb` channel triples:
a triple beside a hex is two definitions of one colour, and they drift.

**Glass** is the site's one authored material — the header logo, the button
bar, the hero panel of all three pages, the homepage feature cards, the partner
CTA overlay and the contact form card. The recipe is `--glass-*` in `:root`,
spent by the single rule marked **THE GLASS MATERIAL** in
[components.css](public/assets/css/components.css), with four states: resting,
`hover`, `raised` (the button bar's travelling spotlight) and `current`.

Glass was **inverted for the dark theme, not dimmed**. On white it was a heavy
white veil (35% fill) that knocked the background back; on black a veil that
strong reads as grey haze and kills the accents, so the fill drops to a 10%
lift and depth is carried by lightness rather than shadow. Blur went up to 20px
and the saturation boost came down to 115%, which on a dark ground would
otherwise oversaturate whatever passes under the panel. Glass needs something
behind it to transmit — that is what the section glows and band gradients are
for; a glass panel over flat black is just a lighter box.

**Two things that cannot be recoloured**, each with a knob instead:

- The decorative SVGs (hex clusters, gears, circuit traces) load through image
  elements, so CSS reaches the element but not its strokes. On white they were
  a whisper; at full ink on black they became the loudest thing in the hero.
  `--decor-ink` (0.2) holds all of them back from one place.
- Photographs stay at full fidelity and are *seated* instead — `--photo-trim`
  plus a hairline, so a bright frame does not punch a hole in the black.

**Changing the theme.** Edit the primitives, nothing else, then re-audit — this
must name no file but `base.css`, `home.css` and `ApproachDiagram.astro` (the
last two by design, see below):

```
grep -rlniE '#[0-9a-f]{3,8}\b|rgba?\(' \
  public/assets/css src/components src/pages src/layouts \
  --include='*.css' --include='*.astro'
```

### Two palettes that stay separate

- **The product's tokens.** [src/styles/ehr.css](src/styles/ehr.css) mirrors the
  running software's own tokens and is re-copied from there. The HealthOS
  panels on `/platform/` are screenshots of software that is itself light, so
  they are **deliberately not darkened**: the dark page frames them, and the
  shot reads as a lit screen in an unlit room. `.pshot__frame` keeps the app's
  own canvas colour (`--product-canvas`) for the same reason. Never re-author a
  value in `ehr.css`. Its `--color-annotation` (`#9AA0A6` on white, 2.64:1) is
  below the contrast floor, but it is the product's decision to fix, not this
  repo's.
- **The standalone SVGs** in `public/assets/{icons,decor,img}/` keep their baked
  fills, since CSS custom properties cannot reach an image element's internals.
  A re-skin has to edit them by hand; the inventory below is the checklist.

  | File | Colours |
  |---|---|
  | `icons/logo.svg` | `#FFFFFF` `#3BB990` `#2067A7` `#1AD2E6` `#00A5C2` |
  | `icons/section-marker.svg` | `#B4C6D1` `#7AA3BD` `#6CBCEE` |
  | `icons/arrow-link.svg` | `#8BAABE` `#7AA3BD` |
  | `icons/{mail,phone,location,globe}.svg` | `#FFFFFF` |
  | `icons/practitioners.svg` | `#FFFFFF` |
  | `decor/plat-workflow.svg` | `#fff` `#F2F2F2` `#CFDFE9` `#B4C6D1` |
  | `decor/hex-cluster.svg` | `#E5E5E5` |

**Inline SVG is themed, though.**
[ClinicArrival.astro](src/components/ClinicArrival.astro) carries a class on
each painted shape, painted from `:root` in its generated stylesheet.
[ApproachDiagram.astro](src/components/ApproachDiagram.astro) is a Figma export
whose sixty-odd paths would be re-flattened by the next export, so
[home.css](public/assets/css/home.css) matches each exported literal by
attribute and repaints it from the token that literal stood for — presentation
attributes are the weakest thing in the cascade, so any rule beats them. The
diagram's three discs are re-cut there too: Figma exported them as white at
60–69%, which on black is a headlight, so `fill-opacity` is overridden to 0.07
and they read as lenses over the ground.

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

**Motion.** `--transition` 200ms ease, `--transition-fast` 120ms, plus the
arrival set — `--reveal-ease` (`cubic-bezier(0.16, 1, 0.3, 1)`, the same
deceleration the approach diagram assembles on) and three durations sized to
what is arriving rather than to where it sits: `--reveal-quick` 420ms for a
rule or a tag, `--reveal-base` 560ms for type and media, `--reveal-long` 700ms
for a pane of glass. All of them are zeroed under `prefers-reduced-motion`,
alongside a global animation kill in
[base.css](public/assets/css/base.css) — keep that block. Three habits in the
existing animation work are worth keeping as house style regardless of what gets
animated next: looping animations are gated behind an `.is-settled` class rather
than running on load, and paused via `animation-play-state` behind `.is-paused`
when offscreen or in a hidden tab; progressive enhancements sit inside
`@supports`, degrading to a resting state rather than a broken one; and every
entrance ends on the value the artwork was drawn at, so the still frame is
always the design.

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
- **`.reveal`** — the scroll-arrival primitive, at the foot of
  `components.css`, with the observer and the arming script in
  [BaseLayout.astro](src/layouts/BaseLayout.astro). All three pages open on
  the same hero sequence — the pane lands and frosts, its lines rise inside
  it, the artwork drifts in at the edges — and then they diverge on purpose.
  `/` and `/platform/` are pages to be *read*, and land section by section as
  a reader reaches them. `/contact/` is a page to be *used*: below its hero
  it has two reveals in total, because **a task surface may not assemble
  itself in front of someone who came to type.** Nothing inside the form card
  animates — no field stagger, no label arriving after its input — and the
  card lands as one object, ready. Keep that line where it is; it is the
  distinction, not an omission.
  Four things about the primitive are load-bearing:
  - **The page's default state is finished.** The hidden state applies only
    under `html.reveals-armed`, which the head script sets before first paint
    and only when there is JS, an `IntersectionObserver`, and no stated
    preference for stillness. Arming it later would flash the content it
    introduces; not arming it at all leaves the page as drawn, which is the
    honest fallback and the same contract
    [ApproachDiagram.astro](src/components/ApproachDiagram.astro) keeps.
  - **Everything a page varies is a custom property**, never a declaration to
    override: `--reveal-from` (the entrance transform), `--reveal-rest` and
    `--reveal-opacity` (the authored values it lands on — the rotated, part-
    strength hero decor on `/platform/` needs both), `--reveal-delay`,
    `--reveal-duration`, `--reveal-shift`. A page stylesheet that overrode
    `transform` directly would match `.is-revealed`'s specificity and, loading
    later, win it.
  - **Four materials, not one entrance.** Type rises; `--glass` settles and
    scales; `--frost` additionally resolves its `backdrop-filter` from 0 to
    `--glass-blur`, inside the same `@supports` the material itself uses;
    `--rule` clips a line in from its own start rather than fading it. Which
    one an element gets is decided by what it is — the contact form is opaque
    paper on a tinted band, so it does not scale like glass, it opens its
    shadow from `--shadow-sm` to the `--shadow-md` it is drawn with and comes
    to rest above the band. The site's 2.5px rules and 1px hairlines are
    pseudo-elements rather than borders **specifically so they can be drawn**
    — see `.setting` in `home.css` and `.visit-index` in `platform.css`.
  - **Reveals are one-way and keyboard-aware.** An arrived element is
    unobserved and never replays, and `focusin` reveals a focused element and
    its ancestors immediately, delay stripped — tab focus scrolls faster than
    the observer reports, and a keyboard user should never land on something
    invisible.

  Two things it must not be given: `content-visibility` on `.pshot`, which
  would restart the product animations inside and permanently desync
  ClinicArrival from QueuePage; and an entrance around
  `ApproachDiagram` on `/`, which already assembles itself when reached and
  would start doing so behind an opacity of zero.

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
  exported. Centre reads **PulseAI**, the two orbiting discs read **Care** and
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
  pages. Watch the same for PulseAI — one word, capital P, capital AI, never
  "Pulse AI" or "Pulseai".

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
  exists only so the components extracted from PulseAI render as they do in
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
