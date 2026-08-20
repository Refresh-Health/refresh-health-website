# Refresh EHR — product components for the marketing site

Drop-in Astro components that show the real product: a live queue, the booking
sheet, Maya's scribe and note enricher, a patient's visit history. Five
components; three of them are looping CSS animations. **Total JavaScript across
all of them: one small React island, on one component.**

These were extracted from the Refresh EHR app (a separate repo) and are meant to
be **copied into a static Astro site and used as-is**. They do not import from
the product, and they never call an API.

> **If you are an agent working in the website repo:** every file header carries
> a provenance comment naming its source, like
> `frontend/src/components/QueuePage.tsx`. **Those files are not in this repo and
> you cannot open them.** They record where the markup came from so a human can
> diff against the product later. Do not try to resolve them, and do not treat a
> missing path as a broken import.

---

## Quick start

Assumes an Astro 5 project. From the site root:

```bash
npx astro add tailwind    # must install @tailwindcss/vite
npx astro add react       # only needed for appointment-modal/
```

**Verify the Tailwind install.** These components are written for Tailwind
**v4** and use CSS-first `@theme` tokens. Check `package.json`:

- `@tailwindcss/vite` present → correct.
- `@astrojs/tailwind` present → **wrong**, that is the v3 integration. It will
  silently ignore every `@theme` block and the entire brand palette will render
  as unstyled defaults. Remove it and install `@tailwindcss/vite`.

Then copy the files:

| From here | To the site |
|---|---|
| `tokens/tokens.css` | `src/styles/tokens.css` |
| `appointment-modal/` | `src/components/appointment-modal/` |
| `queue-page/` | `src/components/queue-page/` |
| `maya-scribe/` | `src/components/maya-scribe/` |
| `visits-tab/` | `src/components/visits-tab/` |

Copy whole directories. Each is self-contained — markup, fixture, and island if
it has one — and reaches outside itself only for `tokens.css`. Take only the
directories you need; there are no cross-directory imports.

Finally, import the tokens **once**, in the base layout:

```astro
---
import '../styles/tokens.css';
---
```

`tokens.css` begins with `@import "tailwindcss";`. If the site already has a
global stylesheet that does the same, **merge the two files** rather than
importing both — a duplicate `@import "tailwindcss"` emits the whole framework
twice.

---

## Using each component

Every component's root element already carries `.ehr-surface`, which supplies
the app's canvas colour, ink colour and typeface. Do not add another wrapper for
it, and do not put these inside a container that overrides `color` or
`font-family`.

### `queue-page/` — 9s presence-detection loop

```astro
---
import QueuePage from '../components/queue-page/QueuePage.astro';
---
<QueuePage />
```

No props. Sizes itself. The clinician's action queue; at 3.7s a patient is
detected in the room and lifts out of "Checked in" into a highlighted card at
the top — which is what the product genuinely does, not a demo flourish.

### `maya-scribe/` — 5s dictation loop + 4s enrich loop

```astro
---
import ScribePanel from '../components/maya-scribe/ScribePanel.astro';
import EnrichPanel from '../components/maya-scribe/EnrichPanel.astro';
---
<div class="flex" style="height: 620px">
  <ScribePanel />
  <EnrichPanel />
</div>
```

Two independent panels with independent loops — place them together or apart.
`MayaPanels.astro` is a convenience wrapper that does exactly the above and
takes a `height` prop; ignore it if you are positioning them separately.

**Both panels are `h-full`.** That is faithful to the product, where the app
shell supplies the height. Whatever container you put one in **must have a
height of its own**, or the panel collapses to nothing. This is the single most
likely thing to go wrong.

### `visits-tab/` — static visit history

```astro
---
import VisitsTab from '../components/visits-tab/VisitsTab.astro';
---
<VisitsTab height="720px" />
```

`height` defaults to `720px`. Both columns scroll independently inside it, so
the prop is doing real work — don't drop it.

### `appointment-modal/` — booking sheet, one interactive control

```astro
---
import AppointmentModal from '../components/appointment-modal/AppointmentModal.astro';
---
<AppointmentModal />
```

Requires `@astrojs/react`. The sheet is static; the beacon dropdown inside it is
a React island that already declares `client:visible`, so it hydrates when
scrolled into view and nothing else on the page ships JS.

This renders as a **plain positioned panel** — no overlay, no portal, no focus
trap, and it does not open or close. Place it inside a container you control; it
will not float over the page on its own.

---

## Rules — do not "fix" these

Each of these looks like a defect and is not. Changing any of them makes the
demo wrong, not better.

**The booking sheet is blue, not brand navy.** `appointment-modal/` uses
`slate-*` and `blue-*`; the CTA is `blue-600`, while the brand is `#0B3D59`.
That is genuinely how the product looks today. Recolouring it here would make
the marketing site prettier than the software it advertises. If it should be
on-brand, that is a change to make in the product first.

**The scribe and enrich loops are not synchronised.** They are 5s and 4s and
re-align only every 20s. That is correct: the enricher is a button a clinician
presses whenever they want, not something the dictation finishing triggers.
Locking them to one timeline would imply a handoff the product does not have.

**Keyframe percentages are computed, not arbitrary.** Every stop is a time over
the loop duration — in `queue-page/`, `41.11%` is 3.7s over 9s. Stops are shared
across all animations in a component so everything turns on the same frame.
Changing a duration alone preserves the proportions; moving a *beat* means
recomputing every stop in that file.

**`ScribePanel.astro`'s two `is:inline` `<style>` blocks are deliberate.** The
first holds per-word keyframes generated at build time — one animation per word,
because a shared keyframe with per-element `animation-delay` cannot loop without
each word blinking out on its own offset cycle. The second is their
reduced-motion override. `is:inline` is what stops Astro scoping and rewriting
the generated selectors; the classes are `mys-` prefixed to stay collision-free.
Removing either flag breaks the transcript reveal.

**The fixtures are synthetic and must stay that way.** Patients are John Smith
and John Doe. This is an EHR marketing site; do not swap in anything that reads
like a real person, a real MRN, or real device inventory.

**`visits-tab/visits.ts` tracks note provenance in its comments.** It records
which parts of the visit note Maya's enricher wrote and which the clinician
added before signing. The product's contract is that the model invents nothing,
so a demo implying Maya diagnosed the patient would advertise something it does
not do. Keep that distinction if you edit the note.

---

## The three that chain

`maya-scribe/` and `visits-tab/` are one visit seen at three moments:

1. **ScribePanel** — Maya hears the patient and transcribes a sentence.
2. **EnrichPanel** — the enricher restructures that sentence into the note.
3. **VisitsTab** — that note, signed, as the History section of the most recent
   visit.

The sentence is identical across all three, by construction. Placed in that
order down a page they tell one story; each still stands alone.

---

## Verifying it worked

In rough order of what breaks first:

1. **Brand navy appears.** The queue's avatars and buttons should be deep teal
   `#0B3D59`. If everything is grey and unstyled, Tailwind v3 is installed —
   see Quick start.
2. **The panels have height.** If `maya-scribe/` or `visits-tab/` render as a
   thin line, their container has no height.
3. **The loops run.** Queue: a patient jumps to the top at ~3.7s of every 9s.
   Scribe: the countdown ticks and words accumulate. Enrich: idle → spinner →
   a "+n" list.
4. **The transcript reveals word by word**, not all at once. If it appears in
   one block, the generated `<style is:inline>` block was dropped or rewritten.
5. **The beacon dropdown opens** when clicked, and the offline beacon is not
   selectable. If nothing happens, `@astrojs/react` is missing.
6. **Nothing scrolls sideways** at narrow widths.

**Reduced motion:** every animation honours `prefers-reduced-motion: reduce` by
holding its end state rather than moving. Test it — a page of frozen panels is
the correct result, not a bug.

**Browser support:** the queue animation collapses rows with
`grid-template-rows: 0fr → 1fr`, which needs Chrome 107+, Firefox 127+ or
Safari 16+. Below that the row does not animate; nothing else is affected.

---

## Background

### Why the components look like this

They are one of three tiers, assigned per component when it was extracted:

| Tier | Format | Ships JS |
|---|---|---|
| Tokens | `tokens.css` | none |
| Static | `.astro` | 0 KB |
| Island | `.tsx` + `client:*` | React runtime |

Astro templates are close enough to JSX that the product's React markup
transfers with near-zero edits — `class` for `className`, `{}` expressions and
props work the same. So almost everything is static, frozen at one visual state
and fed by a fixture in its own directory. React is the escape hatch, used only
where a click has to do something: the Radix-backed primitives, and the beacon
dropdown here.

### What was cut on the way out

The absence of these is what turns a feature component into a demo component:

- **`services/`, `context/`, `hooks/`** — every real fetch and app-wide store.
  Replaced by the fixture beside each component.
- **`react-router-dom`** — nav became an `<a>` or nothing.
- **`lucide-react`** — icons are pasted as raw SVG so a static page pulls in no
  icon library. The one island inlines its three icons for the same reason.
- **Radix primitives** where the behaviour was not the point — the booking
  sheet's overlay and focus trap, the enricher's error state.
- **Real data**, entirely.

### Fonts

The token file names `'Google Sans'` first, then falls back to the system stack.
**The product never actually loads that font either** — there is no `@font-face`
and no stylesheet link anywhere in the app, so every platform renders the
fallback. The marketing site needs a real webfont decision; whatever it picks
should be applied in `tokens.css` too, or deliberately in neither.
