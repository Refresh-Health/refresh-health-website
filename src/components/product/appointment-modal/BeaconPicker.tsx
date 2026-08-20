/* Beacon assignment picker — the one interactive part of the AppointmentModal
 * demo. Extracted from the `showBeaconPicker` block of
 * frontend/src/components/appointment/AppointmentModal.tsx.
 *
 * Mount with `client:visible` so React stays off the critical path:
 *
 *   <BeaconPicker client:visible />
 *
 * Dropped on the way out, deliberately:
 *   - deviceService.assign/deassign — selection is local state only, nothing
 *     persists and no network call is made.
 *   - The reassign-confirm AlertDialog. In the product, picking a beacon held
 *     by another patient opens a confirm first; every fixture beacon here is
 *     unassigned, so that branch is unreachable and its Radix dependency is
 *     not worth shipping.
 *   - The `beaconBusy` / `beaconsLoading` disabled states, which only exist
 *     around those network calls.
 *
 * Kept, because they are what makes it read as a real system: the outside-click
 * dismiss, the presence ping on live beacons, and the offline beacon being
 * unselectable (the backend rejects assigning one).
 *
 * No dependencies beyond React — icons are inlined rather than pulled from
 * lucide-react, so this drops into any Astro site as-is.
 */

import { useEffect, useRef, useState } from 'react';
import { DEMO_BEACONS, DEMO_INITIAL_BEACON_ID, type DemoBeacon } from './beacons';

function BluetoothIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7 7 10 10-5 5V2l5 5L7 17" />
    </svg>
  );
}

function BluetoothOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m17 17-5 5V12l-5 5" />
      <path d="M14.5 9.5 17 7l-5-5v4.5" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** The 40px presence dot: a live beacon pings, an offline one goes red. */
function BeaconDot({ beacon, selected }: { beacon: DemoBeacon; selected: boolean }) {
  const dead = beacon.is_offline;
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      {!dead && (
        <span className="animate-beacon-ping absolute inline-flex h-full w-full rounded-full bg-blue-400/30" />
      )}
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
          dead
            ? 'border-red-200 bg-red-50 text-red-500'
            : selected
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-slate-200 bg-white text-slate-500'
        }`}
      >
        {dead ? <BluetoothOffIcon className="h-5 w-5" /> : <BluetoothIcon className="h-5 w-5" />}
      </span>
    </span>
  );
}

export default function BeaconPicker() {
  const [selectedId, setSelectedId] = useState<number | null>(DEMO_INITIAL_BEACON_ID);
  const [open, setOpen] = useState(false);
  // Marketing-site addition, 2026-08-19 — not part of the extracted product.
  // The trigger glows (`.beacon-glow`, in platform.css) until it is opened for
  // the first time, then never again. It exists because this is the only
  // control on the whole /platform/ page that does anything, and a visitor
  // has no other reason to expect a click here to work.
  const [hasOpened, setHasOpened] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = DEMO_BEACONS.find(b => b.device_id === selectedId) ?? null;

  // The trigger is a button, not a text input that blurs naturally, so it
  // needs its own outside-click dismiss.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const select = (id: number | null) => {
    setSelectedId(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">Beacon</label>

      <button
        type="button"
        onClick={() => { setOpen(o => !o); setHasOpened(true); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-left ${
          hasOpened ? '' : 'beacon-glow'
        }`}
      >
        {current ? (
          <>
            <BeaconDot beacon={current} selected />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-900">{current.device_name}</span>
              <span className="block text-xs text-slate-500">{current.last_seen}</span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-sm text-slate-500">— None —</span>
        )}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          <button
            type="button"
            role="option"
            aria-selected={current === null}
            onClick={() => select(null)}
            className="w-full text-left px-3 py-2.5 text-sm text-slate-500 hover:bg-blue-50 transition-colors border-b border-slate-100"
          >
            — None —
          </button>

          {DEMO_BEACONS.map(b => {
            const dead = b.is_offline;
            const selected = current?.device_id === b.device_id;
            return (
              <button
                key={b.device_id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { if (!dead) select(b.device_id); }}
                disabled={dead}
                title={dead ? "Offline — can't be assigned" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-100 last:border-0 ${
                  dead ? 'cursor-not-allowed opacity-60' : selected ? 'bg-blue-50' : 'hover:bg-blue-50'
                }`}
              >
                <BeaconDot beacon={b} selected={selected} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">{b.device_name}</span>
                  <span className={`block text-xs ${dead ? 'text-red-500' : 'text-slate-500'}`}>
                    {dead ? 'Offline' : b.last_seen}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-1.5 text-xs text-slate-500">
        Assigns a proximity beacon to this patient for presence detection.
      </p>
    </div>
  );
}
