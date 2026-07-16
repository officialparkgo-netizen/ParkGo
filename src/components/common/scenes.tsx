/**
 * Owned illustration scenes for listing imagery.
 *
 * Competitors fill these slots with generic stock photos; ParkGo uses a
 * consistent, on-brand scene per space type instead — no licensing risk and
 * crisp at every size. Hosts' real uploaded photos (http URLs) always take
 * priority in <Photo/>; these scenes only cover token-based (demo) listings.
 *
 * No <defs>/ids are used so any number of scenes can render on one page.
 */

export const P = {
  sky: "#F1F2F4",
  skyDeep: "#E6E8EB",
  white: "#FFFFFF",
  ink900: "#15171A",
  ink800: "#1E2126",
  ink700: "#2A2E34",
  ink600: "#3D424A",
  ink500: "#5B616B",
  ink400: "#878D96",
  ink300: "#B2B6BD",
  ink200: "#D6D8DC",
  ink100: "#ECEDEF",
  or700: "#A9430C",
  or600: "#D4560F",
  or500: "#F26A1B",
  or400: "#F5843A",
  or300: "#F6A06B",
  or200: "#F9C3A0",
  or100: "#FCE1CF",
  or50: "#FEF3EC",
};

const CAR_COLOURS = [P.or500, P.ink700, P.or400, P.ink500];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/* ------------------------------------------------------------------ pieces */

export function Sun({ x = 330, y = 46 }: { x?: number; y?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="26" fill={P.or200} opacity="0.55" />
      <circle cx={x} cy={y} r="16" fill={P.or300} opacity="0.8" />
    </g>
  );
}

export function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={P.white} opacity="0.9">
      <rect x="0" y="8" width="64" height="14" rx="7" />
      <circle cx="20" cy="8" r="10" />
      <circle cx="38" cy="6" r="12" />
    </g>
  );
}

export function CarSide({
  x,
  y,
  s = 1,
  body = P.or500,
}: {
  x: number;
  y: number;
  s?: number;
  body?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="62" cy="36" rx="64" ry="7" fill={P.ink900} opacity="0.12" />
      <path
        d="M6 24 q2 -9 13 -10 l15 -2 q9 -11 24 -11 h16 q15 0 24 11 l17 3 q11 2 11 11 v5 q0 5 -5 5 H11 q-5 0 -5 -5 z"
        fill={body}
      />
      <path d="M40 12 q7 -8 19 -8 h12 q11 0 17 8 z" fill={P.ink800} opacity="0.85" />
      <rect x="60" y="4" width="3" height="9" fill={body} />
      <circle cx="34" cy="34" r="9.5" fill={P.ink900} />
      <circle cx="34" cy="34" r="4" fill={P.ink300} />
      <circle cx="94" cy="34" r="9.5" fill={P.ink900} />
      <circle cx="94" cy="34" r="4" fill={P.ink300} />
      <rect x="119" y="21" width="6" height="5" rx="2" fill={P.or100} />
      <rect x="4" y="22" width="5" height="4" rx="1.5" fill={P.or700} opacity="0.7" />
    </g>
  );
}

export function Van({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="66" cy="42" rx="68" ry="7" fill={P.ink900} opacity="0.12" />
      <path
        d="M6 36 v-20 q0 -6 6 -6 h70 l16 3 q9 2 12 10 l3 8 q1 5 -4 5 H10 q-4 0 -4 -4 z"
        fill={P.white}
      />
      <path d="M86 13 l12 2 q7 2 10 9 l2 5 h-24 z" fill={P.ink200} />
      <rect x="14" y="16" width="26" height="12" rx="2" fill={P.ink200} />
      <circle cx="32" cy="38" r="9" fill={P.ink900} />
      <circle cx="32" cy="38" r="4" fill={P.ink300} />
      <circle cx="96" cy="38" r="9" fill={P.ink900} />
      <circle cx="96" cy="38" r="4" fill={P.ink300} />
      <rect x="6" y="24" width="80" height="3" fill={P.or500} />
    </g>
  );
}

export function Cctv({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`}>
      <rect x="-2" y="0" width="4" height="46" rx="2" fill={P.ink600} />
      <rect x="-2" y="0" width="18" height="4" rx="2" fill={P.ink600} />
      <g transform="translate(14 2) rotate(18)">
        <rect x="0" y="0" width="22" height="11" rx="4" fill={P.ink800} />
        <circle cx="19" cy="5.5" r="3" fill={P.or400} />
      </g>
    </g>
  );
}

export function Bush({ x, y, s = 1, tone = P.ink300 }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={tone}>
      <circle cx="0" cy="0" r="12" />
      <circle cx="13" cy="3" r="9" />
      <circle cx="-12" cy="4" r="8" />
    </g>
  );
}

function Sky({ deep = false }: { deep?: boolean }) {
  return (
    <g>
      <rect width="400" height="300" fill={deep ? P.skyDeep : P.sky} />
      <rect width="400" height="90" fill={P.white} opacity="0.35" />
    </g>
  );
}

/* ------------------------------------------------------------------ scenes */

function DriveScene({ v }: { v: number }) {
  const car = CAR_COLOURS[v % CAR_COLOURS.length];
  return (
    <>
      <Sky />
      <Sun />
      <Cloud x={40 + (v % 3) * 30} y={34} s={0.8} />
      {/* hedge + wall line */}
      <rect x="0" y="150" width="400" height="16" fill={P.ink200} />
      <Bush x={318} y={152} s={1.15} tone={P.or200} />
      <Bush x={366} y={156} s={0.9} />
      {/* house */}
      <g>
        <rect x="24" y="78" width="150" height="88" fill={P.white} />
        <polygon points="16,80 99,44 182,80" fill={P.ink800} />
        <rect x="44" y="98" width="30" height="26" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
        <rect x="124" y="98" width="30" height="26" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
        <rect x="88" y="112" width="26" height="54" rx="2" fill={P.or500} />
        <circle cx="108" cy="140" r="2" fill={P.or100} />
      </g>
      {/* driveway */}
      <polygon points="60,300 340,300 260,166 132,166" fill={P.ink300} />
      <polygon points="150,300 250,300 216,166 178,166" fill={P.ink200} opacity="0.5" />
      <line x1="118" y1="232" x2="288" y2="232" stroke={P.ink400} strokeWidth="2" opacity="0.5" />
      {/* car */}
      <CarSide x={132} y={196} s={1.15} body={car} />
      <Bush x={36} y={182} s={1.2} tone={P.or300} />
    </>
  );
}

function YardScene({ v }: { v: number }) {
  return (
    <>
      <Sky deep />
      <Sun x={64} y={46} />
      <Cloud x={250} y={30} s={0.9} />
      {/* timber fence */}
      <rect x="0" y="96" width="400" height="86" fill={P.or200} />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={i * 31 + 2} y="96" width="4" height="86" fill={P.or300} />
      ))}
      <rect x="0" y="104" width="400" height="5" fill={P.or300} />
      <rect x="0" y="160" width="400" height="5" fill={P.or300} />
      {/* gravel */}
      <rect x="0" y="182" width="400" height="118" fill={P.ink200} />
      {Array.from({ length: 26 }, (_, i) => {
        const gx = ((i * 67 + v * 13) % 384) + 8;
        const gy = 196 + ((i * 41) % 92);
        return <circle key={i} cx={gx} cy={gy} r={2.2} fill={i % 3 ? P.ink300 : P.ink400} />;
      })}
      {/* floodlight */}
      <g transform="translate(352 88)">
        <rect x="-2" y="0" width="4" height="96" fill={P.ink600} />
        <rect x="-10" y="-6" width="20" height="10" rx="3" fill={P.ink800} />
        <polygon points="-8,4 8,4 26,84 -42,84" fill={P.or100} opacity="0.45" />
      </g>
      <Van x={104} y={190} s={1.2} />
      <Cctv x={16} y={92} />
    </>
  );
}

function CarportScene({ v }: { v: number }) {
  const car = CAR_COLOURS[(v + 1) % CAR_COLOURS.length];
  return (
    <>
      <Sky />
      <Sun x={58} y={50} />
      <Cloud x={200} y={36} s={0.7} />
      {/* house wall on the right */}
      <rect x="308" y="70" width="92" height="160" fill={P.white} />
      <rect x="308" y="70" width="92" height="10" fill={P.ink800} />
      <rect x="330" y="104" width="30" height="26" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
      {/* carport roof + posts */}
      <rect x="52" y="92" width="266" height="14" rx="4" fill={P.ink800} />
      <rect x="60" y="106" width="8" height="112" fill={P.ink600} />
      <rect x="296" y="106" width="8" height="112" fill={P.ink600} />
      <rect x="52" y="106" width="266" height="8" fill={P.ink900} opacity="0.15" />
      {/* ground */}
      <rect x="0" y="218" width="400" height="82" fill={P.ink300} />
      <rect x="0" y="218" width="400" height="6" fill={P.ink400} opacity="0.6" />
      <CarSide x={104} y={172} s={1.25} body={car} />
      <Bush x={24} y={224} s={1.1} tone={P.or300} />
    </>
  );
}

function CompoundScene({ v }: { v: number }) {
  const carA = CAR_COLOURS[v % CAR_COLOURS.length];
  const carB = CAR_COLOURS[(v + 2) % CAR_COLOURS.length];
  return (
    <>
      <Sky deep />
      <Cloud x={60} y={34} s={0.8} />
      <Cloud x={280} y={24} s={1} />
      {/* palisade fence */}
      <rect x="0" y="92" width="400" height="4" fill={P.ink500} />
      <rect x="0" y="146" width="400" height="4" fill={P.ink500} />
      {Array.from({ length: 27 }, (_, i) => (
        <rect key={i} x={i * 15 + 2} y="82" width="5" height="72" rx="2" fill={P.ink600} />
      ))}
      {/* asphalt with bays */}
      <rect x="0" y="154" width="400" height="146" fill={P.ink600} />
      <rect x="0" y="154" width="400" height="8" fill={P.ink700} />
      {[70, 190, 310].map((bx) => (
        <line key={bx} x1={bx} y1="180" x2={bx - 26} y2="292" stroke={P.white} strokeWidth="4" opacity="0.7" />
      ))}
      {/* barrier */}
      <g transform="translate(20 128)">
        <rect x="0" y="14" width="12" height="34" rx="2" fill={P.ink800} />
        <g transform="translate(10 16) rotate(-18)">
          <rect x="0" y="0" width="96" height="8" rx="4" fill={P.white} />
          {[10, 34, 58, 82].map((sx) => (
            <rect key={sx} x={sx} y="0" width="12" height="8" fill={P.or500} />
          ))}
        </g>
      </g>
      <Cctv x={382} y={70} flip />
      <CarSide x={112} y={198} s={1.05} body={carA} />
      <CarSide x={252} y={216} s={1.05} body={carB} />
    </>
  );
}

function EvScene({ v }: { v: number }) {
  const car = CAR_COLOURS[(v + 3) % CAR_COLOURS.length];
  return (
    <>
      <Sky />
      <Sun x={332} y={44} />
      <Cloud x={70} y={38} s={0.85} />
      {/* wall + ground */}
      <rect x="0" y="120" width="400" height="60" fill={P.ink100} />
      <rect x="0" y="176" width="400" height="124" fill={P.ink200} />
      <rect x="0" y="176" width="400" height="6" fill={P.ink300} />
      {/* EV bay marking */}
      <rect x="120" y="216" width="180" height="76" rx="8" fill="none" stroke={P.or400} strokeWidth="4" opacity="0.75" />
      {/* charge post */}
      <g transform="translate(48 132)">
        <rect x="0" y="0" width="34" height="88" rx="8" fill={P.white} />
        <rect x="0" y="82" width="34" height="10" rx="3" fill={P.ink300} />
        <rect x="6" y="8" width="22" height="26" rx="3" fill={P.ink800} />
        <polygon points="19,12 12,23 17,23 15,31 23,19 18,19" fill={P.or400} />
        <circle cx="17" cy="46" r="5" fill={P.or500} />
      </g>
      {/* cable to car */}
      <path d="M82 176 q36 34 78 30" fill="none" stroke={P.ink700} strokeWidth="4" strokeLinecap="round" />
      <CarSide x={150} y={196} s={1.2} body={car} />
      <circle cx="163" cy="222" r="5" fill={P.or500} stroke={P.white} strokeWidth="2" />
    </>
  );
}

/* ------------------------------------------------------------------ export */

/** Full-bleed illustration for a photo token; crops like an image. */
export function Scene({ token }: { token: string }) {
  const v = hash(token);
  let scene: React.ReactNode;
  if (token.startsWith("ev")) scene = <EvScene v={v} />;
  else if (token.startsWith("yard")) scene = <YardScene v={v} />;
  else if (token.startsWith("carport")) scene = <CarportScene v={v} />;
  else if (token.startsWith("compound")) scene = <CompoundScene v={v} />;
  else scene = <DriveScene v={v} />;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-hidden
    >
      {scene}
    </svg>
  );
}
