---
target: src/pages/index.astro
total_score: 16
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-08-05T03-53-12Z
slug: src-pages-index-astro
---
Method: dual-agent (A: ad5ec18301e46ad45 · B: a7a71a528e6c916da)

---

## Design Health Score

Applicable heuristics for Persuade mode (static marketing site — no forms, no error states, no task flows): 1, 2, 3, 4, 6, 8. Heuristics 5, 7, 9, 10 scored n/a.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav state correct; static pages need little more. Minor: no on-page anchor indicator |
| 2 | Match System / Real World | 2 | "SDoH", "FHIR", "Smart on FHIR", "CCM/RPM/TCM/RTM/PCM/AWV" introduced without translation. "Principle Care Management" is a misspelling. Internal verb clusters ("Aggregate, Organize & Reduce") are process-speak, not buyer language |
| 3 | User Control and Freedom | 3 | Clean 3-item nav, no traps. "Contact" anchor exists but isn't surfaced in nav body |
| 4 | Consistency and Standards | 3 | "Refresh health" (lowercase h) in body copy across all three pages. Design system is otherwise coherent |
| 5 | Error Prevention | n/a | Static site, no forms |
| 6 | Recognition Rather Than Recall | 3 | Nav uses text + icon (good). Three Additional Services panels (Solutions page) have title and illustration only — no copy — forcing recall for "Ambient Listening Virtual Scribes" |
| 7 | Flexibility and Efficiency | n/a | Persuade mode |
| 8 | Aesthetic and Minimalist Design | 2 | Two prominent dashed photo-placeholder boxes on the homepage undermine finished product impression. The `display--outline` treatment renders section labels in muted grey, reading as placeholder rather than anchor |
| 9 | Error Recovery | n/a | Static site |
| 10 | Help and Documentation | n/a | Persuade mode |
| **Total** | | **16/24** | **Acceptable (67%)** |

---

## Design Specificity Verdict

**LLM assessment: Category-interchangeable. Significantly underspecified for this product.**

The site reads as a well-executed B2B healthcare SaaS template rather than a site designed to argue a specific position. The visual language — soft blue gradients, abstract tech decorations, scrolling feature rows — is indistinguishable from a CRM vendor, a telehealth startup, or a hospital software suite. The one structural element that is specific and executed with conviction is the Platform / Process / People color triptych (blue / green / gold). That choice stands out as the clearest authored decision on the site.

The product's two load-bearing differentiators are both invisible at first contact. "Physician-founded, physician-led" appears exactly once in body copy, in a supporting sentence inside the fourth-to-last section. "AI + FHIR data unification" appears as an acronym list without translation into why that depth matters to the buyer. The hero headline — "Connecting Care, Improving Outcomes" — could appear on any competitor's site unchanged.

**Deterministic scan: Clean.** The detector found zero genuine antipatterns across all pages and components. One finding (a `broken-image` flag in `public/assets/css/home.css`, line 172) is a confirmed false positive — the scanner matched an `<img>` snippet inside a CSS comment, not an actual rendered element. No structural or design antipatterns were flagged.

**Browser visualization**: Not attempted — no browser tool available in this assessment context.

---

## Overall Impression

The site has good bones: accessible markup, a coherent three-pillar structure, and a distinctive nav component. The execution is clean and professional. But it fails at the highest-stakes job of a Persuade surface: it doesn't give a sophisticated healthcare buyer a reason to call. The physician credential — the thing a competitor platform cannot truthfully claim — is buried. The hero could belong to anyone. Two placeholder boxes in the second section of the homepage actively signal "prototype" to a CMO doing due diligence.

**Biggest opportunity**: Move the physician-founded credential to the first headline. Everything else is refinement.

---

## What's Working

**1. The Platform / Process / People triptych is the site's best structural argument.** Each pillar has its own color (blue, green, gold), its own card, alternating layout rhythm, and consistent internal structure. It's the clearest authored visual argument on the page, and it maps directly to how Refresh Health actually thinks about its differentiation.

**2. The glass button-bar navigation is genuinely distinctive.** The backdrop-filter treatment, inset sheen highlights, and gradient border are more refined than standard B2B SaaS nav. The aria-current active state, non-supporting-browser fallback, and mobile wrapping behavior (full-width second row, centered) are all thoughtful decisions that hold up under scrutiny.

**3. Accessibility foundations are above average for a marketing site.** Every section has `aria-labelledby`, decorative images consistently use `alt=""`, focus-visible outlines are implemented with a visible blue ring, `prefers-reduced-motion` is handled at the token level. The approach diagram on the homepage has genuinely good descriptive alt text. These are not accidents — they were built in.

---

## Priority Issues

**[P1] Hero headline doesn't differentiate — it categorizes**
- **What**: "Connecting Care, Improving Outcomes" and the lead copy describe what the product category is, not why Refresh Health is the right choice over Epic, Salesforce Health Cloud, or any other connected care vendor. "Decrease provider burnout" — the single phrase most likely to arrest a burned-out physician-owner — appears only in the HTML meta description, never on the page.
- **Why it matters**: For a Persuade surface targeting two sophisticated buyer types in B2B enterprise healthcare, the hero is the primary filter. Buyers who don't feel specifically addressed in the first 5 seconds bounce or skim past.
- **Fix**: Rewrite the hero headline to lead with the physician credential or the unification mechanism. The provider-burnout pain point must appear in visible hero body copy, not only the meta description.
- **Suggested command**: `/impeccable clarify`

**[P1] Two prominent photo placeholders in the homepage's second section**
- **What**: The "Empowered by Technology" section renders two dashed-border boxes (`height: 240px`, `height: 260px`) labeled "Photo needed: doctors team" and "Photo needed: clinician writing" as live UI.
- **Why it matters**: These appear immediately after the hero — the second thing a visitor sees. For an enterprise B2B buyer evaluating whether to trust a healthcare AI company, visible placeholder boxes register as prototype, not product. They break the credibility arc the rest of the page tries to build. On mobile they stack as two large grey rectangles that read as loading failures.
- **Fix**: Either use existing real photos from other pages (`population-care.png`, `hospital-at-home.png`) as temporary stand-ins, or redesign the "Empowered by Technology" section to not depend on photography it doesn't have yet.
- **Suggested command**: `/impeccable layout`

**[P1] No social proof anywhere on the site**
- **What**: No case studies, outcome data, client logos, partner health systems, press mentions, or testimonials appear on any page. The "physician-founded" credential is the only trust signal — and it appears once, at the bottom of the homepage.
- **Why it matters**: Both target buyer types (health system C-suite, physician practice owners) make high-stakes, multi-stakeholder purchase decisions in regulated industries. Without any third-party evidence, the site can generate awareness but cannot close at the decision stage. Competitors in this space lead with proof.
- **Fix**: Add a minimum-viable proof layer: one or two outcome claims with numbers, partner or health system logos if available, or a single physician testimonial quote. Even a count ("working with X providers across Y states") grounds the credential.
- **Suggested command**: `/impeccable clarify` then `/impeccable layout`

**[P2] "Partner With Us" CTA is passive and bottlenecks to one contact path**
- **What**: Every page closes with "Curious about our products? Reach out anytime." and offers only a `support@refresh.health` email link. The phone number exists in the footer but not in the CTA. There is no demo booking, no form, no calendar link.
- **Why it matters**: Enterprise B2B buyers at the evaluation stage expect a "Request a Demo" or "Schedule a Call" moment. A support@ address signals that the channel is for existing customers, not new business. High-intent visitors leave without converting.
- **Fix**: Add a "Request a Demo" or "Schedule a Call" CTA alongside the email. Surface the phone number (+1 404 600-1575) in the CTA panel. Consider replacing support@refresh.health with a business@ or contact@ address for the inbound channel.
- **Suggested command**: `/impeccable clarify`

**[P2] Typography is visually flat — display face not implemented**
- **What**: `base.css` explicitly notes that all font distinctions are temporarily collapsed to Roboto, with a comment that the display typeface (League Spartan in Figma) was not yet decided for the web implementation. The result: headlines and body copy share identical font-family, and only weight and size separate them.
- **Why it matters**: Typography carries a marketing site's personality and authority signal. A physician-founded, compliance-forward healthcare AI company should feel precise and authoritative at the headline level — Roboto at 48px feels like a SaaS product in draft mode, not a polished marketing presence. This is flagged as known debt in the code.
- **Fix**: Implement the intended typographic split. Load a stronger display face (League Spartan or equivalent) for `h1`/`h2` headlines, keep Roboto for body and UI elements.
- **Suggested command**: `/impeccable typeset`

---

## Persona Red Flags

**Jordan (Confused First-Timer — physician practice owner, visiting after a conference referral):**
- Hero reads "AI enabled connected care platform" — first thought: "What does that actually mean for my practice?" No answer above the fold.
- Second section has two large placeholder boxes — "Is this website done? Is this company established?"
- Body copy uses "Aggregate, Organize & Reduce" and "Transform, Interpret & Synthesize" — clinical data process jargon, not physician-owner pain language.
- Reaches "Partner With Us" — sees a support@ email link. Has never emailed a support address to start a sales conversation. **Abandonment point: every page's CTA.**
- "Physician Led Clinical Care Team" section has one paragraph with no description of what the care team actually does for a practice day-to-day.

**Sam (Accessibility-Dependent — screen reader user, part of a hospital procurement evaluation team):**
- The `<section aria-labelledby="hero-title">` + `<h1 id="hero-title">` pattern means the heading is announced twice for the region — once as the section landmark name, once as the heading. This creates a redundant navigation experience for screen reader users tabbing through landmarks.
- Disease wheel labels on Solutions page are `<span>` elements over a background SVG with no `<ul>` wrapper — they read as a flat run of text: "Type 1 and Type 2 Diabetes Pre-Diabetes Hypertension COPD Heart Failure." Acceptable, but not optimal list semantics.
- The `wf-diagram__art` on Platform page has `alt=""` — if the workflow diagram conveys structural information about how the platform works, it needs descriptive alt text.
- White text over the partner-cta photo relies on a 39% white scrim CSS overlay for contrast — unverifiable from source, but worth contrast-checking.

**Casey (Distracted Mobile — thumb-only on phone, reviewing between patient appointments):**
- The two placeholder boxes stack on mobile as two large grey blocks (`height: 240px` + `height: 260px`, full-width) — on a slow connection with no real images loading, this reads as two broken image failures.
- The `link-cta` arrow-link ("solutions →") is a mid-page navigation option; at mobile sizes this is a small tap target within a text block.
- No state persistence — if Casey switches apps mid-read and returns, she's back at top.

**Project-specific persona — The Health System CMO (C-suite executive running due diligence on a potential enterprise platform deal):**
- Lands on homepage. No proof layer: no logos, no outcomes data, no named customers or partners.
- Hero headline is category-generic; nothing immediately signals why this isn't another EHR middleware vendor.
- "Physician-founded" appears in paragraph 7 of the homepage — this is the credential most likely to earn a CMO's trust signal, and it's invisible at first glance.
- Clicks through to Platform page. Sees "FHIR, Smart on FHIR, medical NLP, hyperautomation" — credible but presented as a feature list, not an outcome argument. No mention of integration timeline, vendor compatibility, or deployment model.
- No security/compliance badge or HIPAA documentation link anywhere visible — the meta description claims HIPAA-compliant but the page itself doesn't surface it.

---

## Minor Observations

- **Typo — credibility-eroding in context**: "Principle Care Management" (Solutions page, line 120) should be "Principal Care Management." In a healthcare billing context where CPT code accuracy is a product claim, a misspelled program name undermines trust.
- **Duplicate CPT code**: RPM card lists 99454 twice (`<li>99453</li><li>99454</li><li>99454</li>`). Should likely be 99453 / 99454 / 99457.
- **Brand name inconsistency**: "Refresh health" (lowercase h) in body copy across all three pages. Brand is "Refresh Health."
- **Nav label case**: The `link-cta` on the homepage reads "solutions" (lowercase); nav label reads "Solutions." Small but inconsistent.
- **HIPAA claim lives only in the meta description**: The Platform page meta description says "HIPAA-compliant" — the page body does not surface this claim anywhere visible. For an audience that cares about compliance posture, this is a missed opportunity.

---

## Questions to Consider

1. **"If a health system CMO had 8 seconds on this homepage, what single sentence should convince them this isn't another care management software vendor — and is that sentence currently visible in the primary heading, before any scroll?"**

2. **"The physician-founded credential is Refresh Health's clearest trust signal and the thing competitors can't copy. It currently appears once, in paragraph 7, in the fourth-to-last section. What would this site look like if 'built and run by physicians' were the headline, not the footnote?"**

3. **"Every page ends with 'Curious about our products? Reach out anytime.' For an enterprise B2B deal with a 3–6 month cycle, is passive email contact the right conversion goal — or should the site be engineered around a specific next step like a demo, a clinical ROI conversation, or a pilot proposal?"**
