/* Placeholder beacons for the AppointmentModal demo.
 *
 * Shape mirrors DeviceWithAssignmentOut from
 * frontend/src/services/deviceService.ts, minus the fields the picker never
 * reads (beacon_uuid, subject, practitioner_id, last_seen_distance).
 *
 * `is_offline` is computed server-side in the product — the backend also
 * rejects /assign for an offline beacon, so the disabled row here is real
 * behavior, not decoration. One offline beacon is included on purpose: it is
 * the detail that shows the presence system is actually live.
 *
 * All values are synthetic. Do not replace with anything resembling real
 * device inventory or a real patient.
 */

export interface DemoBeacon {
  device_id: number;
  device_name: string;
  patient_id: number | null;
  last_seen_room: string | null;
  /** Human-ready relative label. The product computes this from `last_seen_at`
   *  with date-fns `formatDistanceToNow`; the demo hardcodes it so the page
   *  ships no date library and reads identically forever. */
  last_seen: string;
  is_offline: boolean;
}

export const DEMO_BEACONS: DemoBeacon[] = [
  {
    device_id: 1,
    device_name: 'Beacon A1',
    patient_id: null,
    last_seen_room: 'Waiting Room',
    last_seen: '2 minutes ago in Waiting Room',
    is_offline: false,
  },
  {
    device_id: 2,
    device_name: 'Beacon A2',
    patient_id: null,
    last_seen_room: 'Front Desk',
    last_seen: '5 minutes ago in Front Desk',
    is_offline: false,
  },
  {
    device_id: 3,
    device_name: 'Beacon B1',
    patient_id: null,
    last_seen_room: 'Exam 2',
    last_seen: '1 minute ago in Exam 2',
    is_offline: false,
  },
  {
    device_id: 4,
    device_name: 'Beacon B2',
    patient_id: null,
    last_seen_room: null,
    last_seen: 'not sighted yet',
    is_offline: true,
  },
];

/** Which beacon the picker opens on. `null` renders the "— None —" trigger,
 *  which is what a walk-in being checked in would actually start from. */
export const DEMO_INITIAL_BEACON_ID: number | null = null;
