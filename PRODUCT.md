# Product

<!-- impeccable:product-schema 1 -->

> **Purpose of this file.** It is the product record for **Refresh Health** and
> its EHR, **PulseOS**. It was derived from the `refresh-ehr` software
> repository, confirmed by the team, and carried into this marketing-site repo
> as the source of truth here — replacing the previous PRODUCT.md, which
> described a care-management platform ("HealthOS") the company no longer
> builds. Every fact below is either verifiable in the product codebase (path
> cited) or was confirmed directly. Nothing here is aspirational. Read
> **Evidence on Hand** before writing a single line of website copy — it is the
> section that keeps the site truthful.
>
> **Path citations** in backticks — `frontend/…`, `backend/…`, `OVERVIEW.md` —
> refer to the **`refresh-ehr` product repository**, not to this one. They are
> deliberately not links; nothing in this repo resolves them.

## Platform

web

## Naming and identity

| | |
|---|---|
| **Company** | Refresh Health |
| **Product** | PulseOS — the EHR the company sells |
| **AI assistant** | **Maya**, public-facing. Named on the website; customers learn the name before they buy. |
| **Logo** | The Pulse mark — a pulse/ECG waveform in a ring. Confirmed as PulseOS's mark. Source of truth: `frontend/src/components/PulseAILogo.tsx` (filename is legacy; the mark is current). |

**Repo drift the site must ignore.** The product name "PulseOS" does not yet
appear anywhere in the product code. The app still ships `Refresh Health` as its
page title and login heading (`frontend/index.html`,
`frontend/src/components/LoginPage.tsx:161`), the repo and internal docs say
"Refresh EHR", and the logo component is named `PulseAILogo`. "Pulse AI" is
**not** a brand — do not use it. The website is the first surface to carry
PulseOS publicly; the app will follow.

## Users

The website and the product serve different people. Do not confuse them.

**Who the website must convince** (confirmed):

- **Independent practice owners and physicians** — the doctor is also the buyer.
  Weighs documentation time, staff burden, and the cost of switching systems.
- **Multi-site groups and MSOs** — buying across several clinics. Weighs
  multi-tenancy, rollout, standardization, and the central admin console.
- **Investors and recruits** — the site doubles as the company's credibility
  surface for fundraising and hiring, not only as a sales page.

**Who uses the product** (from `OVERVIEW.md` and `GLOSSARY.md`):

| Role | What they do in PulseOS |
|---|---|
| Doctors | Conduct and sign visits. Queue, calendar, charts, visit notes. |
| Nurses | Room patients — vitals, medications, allergies, reason for visit — into the same chart the doctor takes over. They never sign. |
| Front-desk staff | Booking and patient lookup. No practitioner record at all. |
| Clinic admins | Device and hardware setup. Need not be clinicians. |
| Refresh Health staff | A tenantless internal console: provision customers, manage users, set up device hardware. Sees no clinical data. |

**PulseOS is provider-side only. There are no patient-facing views** — no
patient portal, no patient app, no patient login. The site must not imply one.

## Product Purpose

PulseOS is a multi-tenant electronic health record for **US outpatient
clinics** — a React single-page app over a FastAPI backend, with each customer's
data in its own PostgreSQL schema. It covers patients and appointments, the
clinical chart, and the visit note.

Success is a clinician finishing the visit with the note already written, and
the clinic's day moving without anyone searching for where a patient is.

US market is confirmed by the data model: NPI on practitioners
(`frontend/src/components/superAdmin/PractitionersPanel.tsx`), HL7 FHIR R4 as
the interoperability format.

## Positioning

Three mechanisms a neighboring EHR could not truthfully copy today. They are the
spine of the site's argument, in this order:

**1. The AI never writes the chart — structurally, not as a policy.** All four
AI features return a *proposal* the clinician reviews and applies through the
normal chart save. None writes to the record; none stores a conversation. The
review step is the safety property the whole package is built around, and it is
enforced in the architecture, not in a setting anyone can turn off. Maya's
question-answering builds a fresh agent per run whose read-only tools close over
the tenant and patient, so the model cannot reach another patient's record even
if it asks for one. Source: `backend/app/ai/README.md`.

**2. The exam room knows who walked in.** BLE beacons and one ESP32 receiver per
room report who is in which room, so the queue surfaces the patient a clinician
just walked in on instead of making them search for the chart. Co-location — a
practitioner and a patient in the same room — promotes that patient to the top
of the queue. **Presence promotes; it never acts.** Nothing starts
automatically, because starting a visit is a deliberate clinical action and a
hint is sometimes wrong. Source: `frontend/docs/DECISIONS.md`, 2026-07-20.

**3. The clinician chooses whether audio leaves the machine.** Transcription
offers **Local** and **Cloud** — deliberately framed as a privacy-versus-accuracy
trade-off rather than as a list of model names, because model names meant nothing
to the people choosing. On the local path the audio never leaves the browser.
Source: `frontend/docs/DECISIONS.md`, 2026-08-11.

A supporting fourth, weaker as a headline but strong in a demo: **rooming is not
a separate wizard.** The nurse writes vitals, medications, allergies and the
reason for the visit into the same chart the provider then takes over, and
presses Finish to hand it off. One record, one editor, two roles.

## Operating Context

The scene the site should picture: a US outpatient clinic during a working day.
A front-desk person booking and checking in, including walk-in patients
registered on the spot with no prior record. A nurse rooming the next patient. A
doctor moving between exam rooms with a queue that reorders itself as they walk.

Facts about that day that shape the product:

- **The queue is the clinician's landing page** — what needs action now.
  Unsigned visits stay there until signed, deliberately outliving the day.
  Checked-in and upcoming patients are today-only, by the *clinic's* calendar
  day, not UTC.
- **Overlapping appointments are permitted by design.** Clinics really do
  double-book, and the product does not fight it.
- **Scheduled time means the wall clock at the clinic**, not at the viewer, so
  an appointment reads the same to staff anywhere. Stored in UTC; the location's
  timezone supplies the meaning.
- **A chart is held by one person at a time** — a save replaces whole sections.
  Another clinician can take over, and is told how long ago the holder last
  typed.
- **Signing is once and final.** It locks the note and every clinical row on the
  encounter, stamps who signed and when, and closes the encounter.
- **Ambient recordings finish after the clinician has left the room.** A
  30-minute consultation is processed in the background; the recording is
  buffered durably in the browser and uploaded straight to storage, so a refresh
  or a crash does not lose it.

## Capabilities and Constraints

**Core EHR:** patients and MRNs (unique within a practice, not globally),
appointments and calendar, check-in, the practitioner queue, the longitudinal
patient chart, the per-visit encounter chart, the visit note and signing,
vitals and observations, allergies, medication statements (what the patient
already takes) and medication requests surfaced as **Prescriptions**, procedures,
service requests surfaced as **Referrals**, document upload and storage, and a
**visit report** — a PDF of a signed note generated on demand for the patient and
never stored.

**The four AI features, by their product names.** None writes to the chart.

| Name | What it does |
|---|---|
| **Quick Transcribe** | Dictate and get text back, in the moment. On-device by default. |
| **Ambient Listening** | Record a whole consultation, get a proposed chart afterwards. Processed in the background. |
| **Enrich Note** | Turn a note the clinician already wrote into a structured chart proposal. |
| **Ask Maya** | Read-only question answering about the patient currently open, grounded in that patient's record. |

**Presence detection:** BLE beacons carried by practitioners and patients; one
ESP32 node per room running ESPresense firmware; a per-clinic MQTT broker on the
clinic's own network, reachable from the backend only over a private tailnet;
clinic-wide room radius the clinic can tune when presence feels too eager or too
reluctant. A node counts as online only if the backend's own broker connection
is live. **The clinic needs hardware for this** — it is not software-only, and
the site must not imply it works out of the box on day one without it.

**Interoperability:** `/api/fhir/` exposes patient and practitioner data as HL7
FHIR R4. It exists for external consumers; no part of the product's own frontend
calls it. It is not a full FHIR server and does not cover every resource.

**Deployment shape:** cloud-hosted SaaS on AWS. Multi-tenant with one PostgreSQL
schema per customer, plus a per-tenant prefix in document storage. There is **no
self-hosted or on-premise option** — do not offer one. The web app is a PWA with
an install banner and an offline indicator; there is **no native iOS or Android
app**.

**Third parties in the stack** (name only if the site has a reason to): AWS
Cognito for identity, Google Gemini for dictation extraction and Maya's
answers, AWS Transcribe and Deepgram for live cloud transcription, and an
on-device model for local transcription. Everything goes through the backend —
the browser holds no cloud credentials and never talks to a vendor directly,
with the single deliberate exception of on-device transcription, where the audio
never leaves the machine.

**Vocabulary the site should use, and what it means.** Full definitions in
`GLOSSARY.md`; these are the ones that appear in customer-facing copy:
practitioner (not "provider" — that word is legacy), encounter/visit, rooming,
handoff, chart hold, sign, Quick Transcribe, Ambient Listening, Enrich Note,
Ask Maya, beacon, node, co-location.

**Undecided, and to be left undecided:** pricing and packaging, implementation
and onboarding process, support model and SLAs, contract terms, integrations
with billing/claims/labs/e-prescribing, and whether beacon hardware is sold,
bundled, or sourced by the clinic. None of these are settled. The site must not
answer them.

## Brand Commitments

- **Refresh Health** is the company; **PulseOS** the product; **Maya** the
  assistant. Never "Pulse AI".
- The **Pulse mark** is the identity anchor. Its current implementation uses a
  gradient from `#00D9FF` through the brand color to `#00FFB9`; the app's brand
  color is `#0B3D59` (deep navy). Treat these as the incumbent palette
  evidence, not as a mandate — the site's visual world is not decided here.
- **Voice: plain language, no invented specificity.** The product repo's own
  convention forbids sprint numbers, task IDs and design-file names in any
  writing, and its documentation policy is blunt about never writing something
  to show work. Copy that describes a capability in the words a clinician would
  use beats copy that reaches for a category cliché.
- **The honesty constraint is a brand commitment, not just a legal one.** A
  product whose central claim is "the AI never writes your chart without you"
  cannot afford a marketing site that overstates anything else.

### Company contact, as the site currently states it

Carried over from the previous site and still live in
[Footer.astro](src/components/Footer.astro) and
[contact/index.astro](src/pages/contact/index.astro). These predate the pivot
and were **not** re-confirmed with the team — verify before the rebuild ships:

- Atlanta, GA 30022
- +1 (404) 600-1575
- support@refresh.health

## Evidence on Hand

**Read this before writing copy.**

**The company is pre-launch. There are no customers.** No live deployments, no
pilots, no named clinics, no logos, no testimonials, no case studies, no press,
no usage numbers, no time-saved statistics, no accuracy benchmarks, no awards,
no funding announcements. **None of this may be invented, implied, illustrated,
or placeholdered in a way that reads as real.** No "trusted by" strip, no
anonymized quotes, no "clinics like yours", no fabricated dashboard metrics in a
product screenshot.

**What is real and usable:**

- **The working product itself.** Screenshots and recorded demos of the real UI
  are the site's strongest and essentially only proof asset. Use them.
- **The security and infrastructure posture**, documented at
  `infrastructure/docs/SECURITY_POSTURE.md` — with the boundary below.

**The security posture, stated precisely.** The document is a snapshot of the
**staging** environment and says of itself that it is a description of technical
posture, **not a compliance attestation**. Truthful, checkable architectural
statements: no path from the public internet reaches the database; the database
is not publicly accessible and has no public IP; data is encrypted at rest
(RDS under a customer-managed KMS key with annual rotation) and in transit;
every API route but the health check requires a validated JWT; each customer's
clinical data lives in its own database schema and its own storage prefix;
credentials live in AWS Secrets Manager and are never written to
infrastructure-as-code state; CI holds no static cloud keys.

**What may not be claimed, because it is not true today.** PulseOS is **not**
HIPAA-certified, SOC 2-certified, or HITRUST-certified, and holds no
attestation of any kind. No penetration test has been performed. MFA is not yet
enabled. There is no application-level audit log of who read which patient
record. The environment has not yet held real PHI, and several production
hardening items — multi-AZ database, longer log retention, flow logs, WAF,
secret rotation, least-privilege CI — are written but not applied. Do not write
"HIPAA compliant", do not display a compliance badge, and do not say "enterprise-
grade security" as a substitute for the specific claims above. If the site needs
a security section, describe the architecture and say plainly that formal
certification is ahead, not behind.

### Asset evidence in this repo

The image library here was shot and sourced for the previous product — a
care-management service with a physician-led care team. Most of it argues for a
product that no longer exists.

**Cannot carry over as product evidence** (they depict care delivery, not an
outpatient EHR): `population-care.png` (nurse + patient),
`hospital-at-home.png`, `anatomy-360.png`, `iv-stand.png`. The disease-wheel and
constellation decor in [public/assets/decor/](public/assets/decor/) and the
six CPT-code card icons in [public/assets/icons/](public/assets/icons/) are
tied one-to-one to retired capabilities.

**Possibly reusable as clinic-setting atmosphere, never as proof:**
`clinician-writing.jpg`, `doctors-team.jpg`, `partner-stethoscope.jpg`. They
show clinicians, not PulseOS; they may not be captioned or framed in a way that
implies a customer, a deployment, or the product in use.

**Missing and needed before the rebuild:** real PulseOS UI screenshots and demo
recordings — per the section above, the only genuine proof asset the company
has — and the Pulse mark as a web asset. This repo's
[logo.svg](public/assets/icons/logo.svg) is the Refresh Health wordmark, not the
Pulse mark, and no Pulse mark file exists here yet.

### Claims the current site makes that are now false

Inventory for the trim, not a to-do list — the rebuild decides the replacements:

- **"HealthOS"** as the product name, in the header nav, the homepage, the
  platform page and the CTA. The product is PulseOS.
- **"Connecting Care, Improving Outcomes."** — the hero tagline. Legacy
  positioning for the retired product; no tagline has replaced it.
- **The physician-led care team.** Refresh Health sells software, not care
  delivery. The homepage People section, the Approach diagram's
  Platform/Process/People triptych, and "Caring Beyond the Four Walls" all
  assert a service the company does not offer.
- **The entire [Solutions](src/pages/solutions/index.astro) page** — disease
  management programs, RPM/CCM/TCM/RTM/PCM/AWV billing codes, Hospital @ Home,
  revenue cycle management, device lifecycle management. None of it is the
  product.
- **"HIPAA-compliant"** and the FHIR/Smart on FHIR platform claims on the
  [Platform](src/pages/platform/index.astro) page. See the compliance boundary
  above; the FHIR surface is real but far narrower than the page implies.
- **"Founded by physicians" / "physician-designed"** as a load-bearing trust
  signal. Not contradicted by the new record, but not confirmed by it either —
  re-confirm with the team before carrying it forward.

## Product Principles

1. **The clinician reviews everything the machine proposes.** No AI output
   reaches the record without a human applying it. This is the product's central
   promise and its architecture; nothing in the product or its marketing may
   soften it.
2. **A hint is a hint.** Presence, suggestions, and inference change what is
   *shown* — never what is *done*. The system reorders the queue; the clinician
   starts the visit.
3. **Meet the clinic where it already works.** Double-booking, walk-ins, ad-hoc
   documentation, a nurse and a doctor sharing one chart — the product bends to
   the real day rather than demanding a tidier one.
4. **Give the user the trade-off, not the implementation.** Local versus cloud,
   not a list of model names. The choice a person can actually reason about is
   the choice worth surfacing.
5. **Claim only what is checkable.** Pre-launch, with a safety-critical product
   sold to clinicians, credibility is the entire asset. Specificity that can be
   verified beats scale that cannot.

## Accessibility & Inclusion

No accessibility standard has been formally committed for either the product or
the website — recorded as an open decision, not as an absence of intent. Two
context facts that should inform whatever the site commits to: buyers are
clinical professionals evaluating a system they will use for hours a day, and
the product is used on shared clinic machines under time pressure. A healthcare
buyer may ask about conformance; there is currently no answer to give, and
inventing a WCAG conformance claim would fall under the same honesty constraint
as the compliance claims above.

The site as it stands already ships keyboard focus rings, a reduced-motion
block, `visually-hidden` labels and per-section `aria-labelledby` — see
[DESIGN.md](DESIGN.md). That behaviour is worth keeping through the rebuild
regardless of what is formally committed.
