/* Fixture for the paired Maya Scribe / Enrich Note demo.
 *
 * One transcript drives both panels: the scribe animation dictates it, the
 * enricher then acts on it. Keeping it in one place is the point — the two
 * animations are meant to read as the same visit, thirty seconds apart.
 *
 * Synthetic. The utterance is a plausible GERD-flavoured complaint written for
 * this demo; it is not transcribed from anyone.
 */

export const TRANSCRIPT =
  'Patient reports discomfort in the back of the chest and a slight burning ' +
  'sensation, along with a bitter acidic taste in the mouth';

export const WORDS = TRANSCRIPT.split(' ');

/* ── Scribe timeline (5s) ──────────────────────────────────────────────────
 * Lead-in covers the mic engaging ("Listening…"); the tail holds the finished
 * transcript long enough to actually read it. Everything between is speech.
 */
export const SCRIBE_SECONDS = 5;
export const LEAD_IN_SECONDS = 0.6;
export const TAIL_SECONDS = 1.0;

/** How long a word sits in partial (grey) before settling to final (dark) —
 *  the two-tone the product uses to distinguish `live.partial` from
 *  `live.finals`. */
export const SETTLE_SECONDS = 0.35;

/** What the enricher reports having written to the chart.
 *
 * Labels come from `scribeUpdateGroups` in
 * frontend/src/components/visits/scribeApply.ts, which only ever emits from a
 * fixed set: Note, Intake, Vitals, Medications, Allergies, Procedures,
 * Prescriptions, Referrals.
 *
 * Only these two, deliberately. The transcript states symptoms and nothing
 * else — no numbers, no drugs, no allergies — so a demo claiming "Vitals +2"
 * would be advertising a fabrication. The product's own rule is that nothing
 * is invented; the fixture has to hold to it.
 */
export const APPLIED_GROUPS: { label: string; count: number }[] = [
  { label: 'Note', count: 1 },
  { label: 'Intake', count: 3 },
];

/* ── The note either side of the enrich, for EnrichWithNote.astro ──────────
 *
 * Before: what the scribe left in the editor — the transcript, unstructured.
 * After: the same words rebuilt under NOTE_SECTIONS (Chief Complaint, History,
 * Examination, Diagnosis, Plan — backend/app/ai/scribe/services.py), heading on
 * its own line with a blank line between.
 *
 * Three headings land EMPTY, and must stay that way. The patient stated
 * symptoms and nothing else, so the enricher has nothing to put under
 * Examination, Diagnosis or Plan — those are the clinician's, added before
 * signing, which is exactly how they appear in visits-tab/visits.ts. Filling
 * them here would depict the model inventing an exam and a diagnosis it was
 * never given.
 *
 * History is the transcript verbatim and Chief Complaint is the enricher's
 * restructuring of it; between them that is the "Note +1" of APPLIED_GROUPS.
 * The Chief Complaint line matches visits.ts word for word — same visit.
 */
export const NOTE_BEFORE = `${TRANSCRIPT}.`;

export const NOTE_AFTER = `Chief Complaint:
Retrosternal burning with acid regurgitation.

History:
${TRANSCRIPT}.

Examination:

Diagnosis:

Plan:
`;

/** The editor's save indicator. The note is a draft throughout — enriching
 *  writes to the draft, not to the chart; only signing does that. */
export const SAVE_BEFORE = 'Draft';
export const SAVE_AFTER = 'Last saved just now';
