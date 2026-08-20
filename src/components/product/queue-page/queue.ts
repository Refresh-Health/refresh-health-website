/* Roster for the QueuePage demo animation.
 *
 * Mirrors the fields QueuePage actually renders from QueueItem
 * (frontend/src/services/queueService.ts) — the rest of the wire shape never
 * reaches the row. `timing` and `handoff` are pre-rendered strings: the product
 * computes them at render time via queueTimingLabel/queueHandoffLabel, but a
 * static page has no "now" to compute against, and a marketing page that says
 * "Checked in 9:31 AM" forever is more honest than one that drifts.
 *
 * All names, MRNs and times are synthetic. Nothing here is derived from real
 * patient data, and nothing here should be replaced with anything that is.
 *
 * Date changed for the marketing site, 2026-08-19: was "Friday, Mar 14". On
 * /platform/ this queue is step 02 of a walkthrough of one visit, and
 * visits-tab/visits.ts already dated John Smith's most recent visit
 * 14 August 2026 — which is also a Friday. Aligned rather than left to
 * contradict the chart two sections further down the page.
 */

export interface DemoQueueItem {
  id: number;
  name: string;
  initials: string;
  dob: string;
  /** Second line: check-in time, or when an in-progress visit started. */
  timing: string;
  /** Third line: who prepped or holds this visit. Omitted on most rows. */
  handoff?: string;
  /** The row CTA. `null` renders the muted "Not checked in yet" text. */
  action: 'Begin Visit' | 'Resume Visit' | null;
  /** Left accent bar. Amber marks an open note, brand marks everything else. */
  accent: 'unsigned' | 'brand';
}

export const IN_PROGRESS: DemoQueueItem[] = [
  {
    id: 1,
    name: 'Elena Marsh',
    initials: 'EM',
    dob: '07/22/1979',
    timing: 'Visit started Aug 14, 9:05 AM',
    action: 'Resume Visit',
    accent: 'unsigned',
  },
];

export const READY_FOR_YOU: DemoQueueItem[] = [
  {
    id: 2,
    name: 'Toby Grant',
    initials: 'TG',
    dob: '11/03/1962',
    timing: 'Checked in 9:12 AM',
    handoff: 'Prepped by J. Alvarez 9:20 AM',
    action: 'Begin Visit',
    accent: 'brand',
  },
];

/** The patient presence fires on at the 3.7s mark. Rendered twice — once in
 *  this section (animated out) and once as the promoted card (animated in) —
 *  because that is exactly what the product does: `bucket` drops the present
 *  patient from their section so they are not shown in both places. */
export const PRESENT_PATIENT: DemoQueueItem = {
  id: 3,
  name: 'John Smith',
  initials: 'JS',
  dob: '02/09/1991',
  timing: 'Checked in 9:31 AM',
  action: 'Begin Visit',
  accent: 'brand',
};

export const CHECKED_IN: DemoQueueItem[] = [
  PRESENT_PATIENT,
  {
    id: 4,
    name: 'Rafael Duarte',
    initials: 'RD',
    dob: '05/17/1958',
    timing: 'Checked in 9:38 AM',
    action: 'Begin Visit',
    accent: 'brand',
  },
];

export const UPCOMING_COUNT = 3;

export const HEADER_DATE = 'Friday, Aug 14';
export const REMAINING = 4;
