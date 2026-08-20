/* Floorplan clinic — continuous composition. All choreography keyed to T. */
const { useComposition, animate, Easing, clamp } = window;

const C = {
  bg: '#FFFFFF',
  floor: '#FFFFFF',
  tile: '#EDE9E1',
  wall: '#9B9B9B',
  wallSoft: '#B5B5B5',
  furn: '#9B9B9B',
  ink: '#8C877C',
  user: 'rgb(27, 60, 87)',
  userBg: 'rgb(232, 236, 238)',
  scopeBg: 'rgb(252, 242, 217)',
  scope: 'rgb(133, 97, 40)',
};

const MOTION = {
  glide: Easing.easeInOutCubic,
  ease: Easing.easeOutQuad,
  pop: Easing.easeOutBack,
};

const A = (from, to, start, end, ease) => animate({ from, to, start, end, ease: ease || MOTION.glide });

/* --- static set: floorplan seen from above --- */
function Floorplan() {
  return (
    <g>
      <rect x="0" y="0" width="1600" height="640" fill={C.bg} />
      {/* room floor */}
      <rect x="520" y="80" width="620" height="480" fill={C.floor} />
      {/* room walls, with a wide doorway gap on the left wall */}
      <g stroke={C.wall} strokeWidth="12" fill="none" strokeLinecap="round">
        <line x1="520" y1="80" x2="1140" y2="80" />
        <line x1="520" y1="560" x2="1140" y2="560" />
        <line x1="1140" y1="80" x2="1140" y2="560" />
        <line x1="520" y1="80" x2="520" y2="200" />
        <line x1="520" y1="460" x2="520" y2="560" />
      </g>
      {/* exam table, narrower, left of the stethoscope */}
      <rect x="820" y="200" width="90" height="260" rx="20" fill="none" stroke={C.furn} strokeWidth="5" />
    </g>
  );
}

/* lucide "user" */
function UserIcon({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(-12,-12)">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </g>
  );
}

/* lucide "stethoscope" */
function StethoscopeIcon({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(-12,-12)">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </g>
  );
}

function Piece(props) {
  const { T, CUES, authoredTotal } = useComposition();
  const pulseRate = props.pulseRate || 0.55;
  const userColor = props.userColor || C.user;

  const dDoor = CUES.Doorway, dArr = CUES.Arrival, dRest = CUES.Rest;

  /* enters from the bottom-left, off-screen, along an implied perpendicular hallway */
  let x = A(-80, 460, 0, dDoor, MOTION.ease)(T);
  x = T > dDoor ? A(460, 700, dDoor, dArr + 0.7, MOTION.glide)(T) : x;
  let y = A(700, 330, 0, dDoor, MOTION.ease)(T);
  y = T > dDoor ? A(330, 312, dDoor, dArr + 0.7, MOTION.glide)(T) : y;

  const moving = clamp((dArr + 0.9 - T) / 0.6, 0, 1);
  const bob = Math.sin(T * 5.6) * 3.2 * moving;

  const scale = A(3.4, 3.8, dArr - 0.3, dArr + 0.6, MOTION.pop)(T);
  const userOpacity = clamp(A(0, 1, 0.15, 0.8, MOTION.ease)(T), 0, 1) * clamp(A(1, 0, dRest + 0.25, dRest + 1.1, MOTION.ease)(T), 0, 1);

  /* steady pulse rings */
  const rings = [0, 1, 2].map((i) => {
    const p = ((T * pulseRate + i / 3) % 1 + 1) % 1;
    return { key: i, r: 34 + p * 78, o: (1 - p) * 0.3 * (1 - p * 0.2) };
  });
  const beat = 1 + Math.sin(T * pulseRate * Math.PI * 2) * 0.035;

  /* stethoscope acknowledges the arrival */
  let scopeGlow = clamp(A(0, 1, dArr - 0.5, dArr + 0.8, MOTION.ease)(T), 0, 1);
  scopeGlow = T > dRest + 0.2 ? clamp(A(1, 0, dRest + 0.2, authoredTotal - 0.1, MOTION.ease)(T), 0, 1) : scopeGlow;
  const scopeScale = 4.4 + scopeGlow * 0.4 + Math.sin(T * 1.6) * 0.06;

  /* camera: slow push in, out again on the loop seam */
  let cam = A(1, 1.13, 0, dArr + 1.0)(T);
  cam = T > dRest + 0.1 ? A(1.13, 1, dRest + 0.1, authoredTotal)(T) : cam;
  let camX = A(0, -120, 0, dArr + 1.0)(T);
  camX = T > dRest + 0.1 ? A(-120, 0, dRest + 0.1, authoredTotal)(T) : camX;

  return (
    <svg viewBox="0 0 1600 640" width="100%" height="100%" style={{ display: 'block', background: C.bg, filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.18))' }}>
      <clipPath id="frameClip"><rect x="6" y="6" width="1588" height="628" rx="28" /></clipPath>
      <g clipPath="url(#frameClip)">
      <g transform={`translate(800 320) scale(${cam}) translate(${-800 + camX} ${-320 - 8 * (cam - 1) * 10})`}>
        <Floorplan />
        <g transform="translate(1010 330)">
          <circle r={13 * scopeScale} fill={C.scopeBg} />
          <g transform={`scale(${scopeScale})`} opacity={0.55 + scopeGlow * 0.45}>
            <StethoscopeIcon color={C.scope} />
          </g>
        </g>
        <g transform={`translate(${x} ${y + bob})`} opacity={userOpacity}>
          {rings.map((r) => (
            <circle key={r.key} r={r.r} fill="none" stroke={userColor} strokeWidth="3" opacity={r.o} />
          ))}
          <circle r={12.5 * scale * beat} fill={C.userBg} />
          <g transform={`scale(${scale * beat})`}>
            <UserIcon color={userColor} />
          </g>
        </g>
      </g>
      </g>
    </svg>
  );
}

window.Piece = Piece;
