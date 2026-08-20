/* John Smith's visit history for the Visits tab demo.
 *
 * Shapes mirror EncounterListItem and EncounterChart
 * (frontend/src/services/encounterService.ts), reduced to the fields the
 * read-only chart actually renders.
 *
 * Continuity with the other demos is deliberate: the selected visit is the one
 * the Maya Scribe animation dictates and the Enrich Note animation rewrites.
 * Its History section carries that transcript verbatim, so the three demos read
 * as one visit rather than three unrelated screenshots.
 *
 * All synthetic. The clinical content is plausible filler for a fictional
 * patient, not guidance.
 */

export interface DemoVisit {
  id: number;
  /** Pre-rendered by formatDateTime() in VisitsTab.tsx: "Aug 14, 2026 · 10:15 AM". */
  when: string;
  /** The row label is the signer, per visitLabel(). */
  signedBy: string;
  status: 'Final' | 'Amended';
}

/* Newest first, as encounterService.getPatientVisits() returns them — the tab
 * auto-selects rows[0]. Spacing is 3–4 months, which is what a managed chronic
 * complaint on review actually looks like; all start times fall in clinic
 * hours. */
export const VISITS: DemoVisit[] = [
  { id: 5, when: 'Aug 14, 2026 · 10:15 AM', signedBy: 'Dr. Alice Reyes', status: 'Final' },
  { id: 4, when: 'Apr 2, 2026 · 2:30 PM', signedBy: 'Dr. Alice Reyes', status: 'Final' },
  { id: 3, when: 'Dec 11, 2025 · 9:45 AM', signedBy: 'Dr. Priya Raman', status: 'Amended' },
  { id: 2, when: 'Aug 21, 2025 · 3:15 PM', signedBy: 'Dr. Alice Reyes', status: 'Final' },
  { id: 1, when: 'Apr 17, 2025 · 11:00 AM', signedBy: 'Dr. Marcus Bell', status: 'Final' },
];

export const SELECTED_ID = 5;

export const SIGNED_LABEL = 'Signed Aug 14, 2026 11:02 AM · Dr. Alice Reyes';

/* The note, in the five fixed sections the enricher rebuilds every note under:
 * Chief Complaint, History, Examination, Diagnosis, Plan — NOTE_SECTIONS in
 * backend/app/ai/scribe/services.py, emitted heading-on-its-own-line with a
 * blank line between. The structure is guaranteed by code, not by the model.
 *
 * Provenance, so the demo does not overclaim: History is the dictated sentence
 * verbatim and Chief Complaint is the enricher's restructuring of it — between
 * them, that is the "Note +1" the Enrich animation reports. Examination,
 * Diagnosis and Plan are the clinician's own, added before signing. The
 * enricher invents nothing, and a demo implying it diagnosed this patient
 * would be advertising something the product does not do.
 */
export const NOTE = `Chief Complaint:
Retrosternal burning with acid regurgitation.

History:
Patient reports discomfort in the back of the chest and a slight burning sensation, along with a bitter acidic taste in the mouth. Symptoms worse after meals and when lying flat. No exertional component and no radiation to the arm or jaw.

Examination:
Alert and comfortable at rest. Chest clear to auscultation, heart sounds normal. Abdomen soft with mild epigastric tenderness, no guarding.

Diagnosis:
Gastro-oesophageal reflux disease.

Plan:
Start omeprazole 20 mg once daily for eight weeks. Advise smaller evening meals and raising the head of the bed. Review in eight weeks; return sooner if the pain becomes exertional or begins to radiate.`;

/* Exactly three fields, matching the "Intake +3" the Enrich animation reports.
 * Blank intake fields are dropped by IntakeRow rather than shown as em-dashes,
 * so the two that were never captured simply do not appear. */
export const INTAKE: { label: string; value: string }[] = [
  { label: 'Chief complaint', value: 'Burning chest discomfort and a sour taste' },
  { label: 'Duration / onset', value: 'About three weeks, gradual' },
  { label: 'Severity', value: 'Moderate — worse after evening meals' },
];

/* Captured at check-in by the nurse, not by Maya. The Enrich animation reports
 * no Vitals count precisely because the enricher did not write these. */
export const VITALS: { type: string; value: string }[] = [
  { type: 'Blood Pressure', value: '128/82 mmHg' },
  { type: 'Heart Rate', value: '74 bpm' },
  { type: 'Temperature', value: '36.8 °C' },
];

/* Ordered by the clinician during the visit — again, not by the enricher. */
export const PRESCRIPTIONS = [
  {
    name: 'Omeprazole',
    dosage: '20 mg',
    frequency: 'Once daily',
    quantity: '56 tablets',
    refills: 1,
  },
];
