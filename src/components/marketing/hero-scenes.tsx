import { cn } from "@/lib/utils";
import { Bush, CarSide, Cctv, Cloud, P, Van } from "@/components/common/scenes";

/**
 * Hero illustrations for the marketing pages — same owned visual language as
 * the listing scenes, composed at hero scale. Rendered on the right of each
 * page hero (stacks under the copy on small screens). No <defs>/ids, so any
 * number can render on one page.
 */

export type HeroKind = "journey" | "traveller" | "host" | "trust" | "pricing" | "support";

function HeroSky({ deep = false }: { deep?: boolean }) {
  return (
    <g>
      <rect width="480" height="360" fill={deep ? P.skyDeep : P.sky} />
      <rect width="480" height="110" fill={P.white} opacity="0.4" />
    </g>
  );
}

function Plane({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 14 L46 0 Q52 -2 50 4 L36 18 L52 26 L44 30 L26 26 L12 34 L8 32 L16 22 L2 18 Z"
        fill={P.ink800}
      />
      <path d="M28 8 L44 22" stroke={P.white} strokeWidth="2" opacity="0.4" />
    </g>
  );
}

function Terminal({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* control tower */}
      <rect x="118" y="-46" width="10" height="52" fill={P.ink600} />
      <rect x="106" y="-64" width="34" height="22" rx="6" fill={P.ink800} />
      <circle cx="123" cy="-53" r="3" fill={P.or400} />
      {/* main hall */}
      <path d="M0 6 Q80 -26 160 6 V64 H0 Z" fill={P.white} />
      <path d="M0 6 Q80 -26 160 6 v10 Q80 -14 0 16 Z" fill={P.ink800} />
      {[18, 50, 82, 114].map((wx) => (
        <rect key={wx} x={wx} y="24" width="26" height="24" rx="3" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
      ))}
      <rect x="66" y="40" width="30" height="24" rx="2" fill={P.or500} />
    </g>
  );
}

function CoinStack({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[18, 9, 0].map((dy, i) => (
        <g key={dy}>
          <ellipse cx="0" cy={dy} rx="22" ry="9" fill={i === 2 ? P.or400 : P.or500} />
          <ellipse cx="0" cy={dy - 3} rx="22" ry="9" fill={P.or300} />
        </g>
      ))}
      <text x="0" y="1" textAnchor="middle" fontSize="12" fontWeight="800" fill={P.or700}>
        £
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ scenes */

function JourneyScene() {
  return (
    <>
      <HeroSky />
      <Cloud x={180} y={40} s={0.9} />
      <Cloud x={330} y={64} s={0.7} />
      <Plane x={300} y={38} s={1.1} />
      {/* terminal on the right */}
      <Terminal x={288} y={168} />
      {/* house + driveway on the left */}
      <g transform="translate(6 96)">
        <rect x="18" y="42" width="118" height="70" fill={P.white} />
        <polygon points="10,44 77,16 144,44" fill={P.ink800} />
        <rect x="34" y="58" width="24" height="20" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
        <rect x="96" y="58" width="24" height="20" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
        <rect x="66" y="70" width="22" height="42" rx="2" fill={P.or500} />
      </g>
      {/* ground */}
      <rect x="0" y="232" width="480" height="128" fill={P.ink200} />
      <rect x="0" y="232" width="480" height="6" fill={P.ink300} />
      {/* dotted route from the drive to the terminal */}
      <path
        d="M96 268 C 180 316, 300 312, 396 252"
        fill="none"
        stroke={P.or500}
        strokeWidth="4"
        strokeDasharray="2 12"
        strokeLinecap="round"
      />
      <circle cx="96" cy="268" r="7" fill={P.white} stroke={P.or500} strokeWidth="3" />
      <circle cx="396" cy="252" r="8" fill={P.ink900} stroke={P.white} strokeWidth="3" />
      <CarSide x={128} y={244} s={1.1} />
      <Bush x={26} y={238} s={1.1} tone={P.or300} />
      <Bush x={452} y={244} s={0.9} />
    </>
  );
}

function TravellerScene() {
  return (
    <>
      <HeroSky />
      <Cloud x={60} y={44} s={0.9} />
      <Plane x={150} y={54} s={0.9} />
      <Terminal x={20} y={162} />
      <rect x="0" y="226" width="480" height="134" fill={P.ink200} />
      <rect x="0" y="226" width="480" height="6" fill={P.ink300} />
      {/* transfer van + traveller's car with luggage */}
      <Van x={218} y={244} s={1.15} />
      <CarSide x={352} y={266} s={0.95} body={P.ink700} />
      {/* suitcases */}
      <g transform="translate(196 296)">
        <rect x="0" y="0" width="22" height="30" rx="4" fill={P.or500} />
        <rect x="9" y="-6" width="4" height="8" rx="2" fill={P.ink700} />
        <rect x="26" y="8" width="18" height="22" rx="4" fill={P.ink700} />
      </g>
      <Bush x={462} y={238} s={1} tone={P.or300} />
    </>
  );
}

function HostScene() {
  return (
    <>
      <HeroSky />
      <Cloud x={90} y={44} s={0.9} />
      {/* hedge */}
      <rect x="0" y="188" width="480" height="14" fill={P.ink200} />
      {/* house */}
      <g transform="translate(120 68)">
        <rect x="20" y="52" width="150" height="82" fill={P.white} />
        <polygon points="12,54 95,18 178,54" fill={P.ink800} />
        <rect x="40" y="72" width="28" height="24" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
        <rect x="122" y="72" width="28" height="24" fill={P.ink100} stroke={P.ink300} strokeWidth="2" />
        <rect x="84" y="82" width="24" height="52" rx="2" fill={P.or500} />
      </g>
      {/* driveway */}
      <rect x="0" y="202" width="480" height="158" fill={P.ink200} />
      <polygon points="120,360 372,360 306,202 186,202" fill={P.ink300} />
      <CarSide x={182} y={266} s={1.2} />
      {/* earnings */}
      <CoinStack x={92} y={300} s={1.15} />
      <CoinStack x={412} y={288} s={0.9} />
      <Bush x={34} y={206} s={1.2} tone={P.or300} />
      <Bush x={444} y={208} s={1} />
    </>
  );
}

function TrustScene() {
  return (
    <>
      <HeroSky deep />
      <Cloud x={70} y={40} s={0.8} />
      <Cloud x={330} y={30} s={1} />
      {/* palisade fence */}
      <rect x="0" y="140" width="480" height="4" fill={P.ink500} />
      <rect x="0" y="196" width="480" height="4" fill={P.ink500} />
      {Array.from({ length: 32 }, (_, i) => (
        <rect key={i} x={i * 15 + 2} y="130" width="5" height="74" rx="2" fill={P.ink600} />
      ))}
      <Cctv x={40} y={104} />
      <Cctv x={452} y={104} flip />
      {/* ground */}
      <rect x="0" y="204" width="480" height="156" fill={P.ink600} />
      <rect x="0" y="204" width="480" height="8" fill={P.ink700} />
      <CarSide x={70} y={262} s={1} body={P.ink500} />
      <CarSide x={310} y={272} s={1} />
      {/* big shield */}
      <g transform="translate(240 118)">
        <path
          d="M0 -54 L52 -36 V4 C52 40 26 66 0 78 C-26 66 -52 40 -52 4 V-36 Z"
          fill={P.ink900}
          stroke={P.white}
          strokeWidth="6"
        />
        <path
          d="M-20 6 L-6 22 L24 -14"
          fill="none"
          stroke={P.or500}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}

function PricingScene() {
  return (
    <>
      <HeroSky />
      <Cloud x={300} y={40} s={0.9} />
      <rect x="0" y="250" width="480" height="110" fill={P.ink200} />
      <rect x="0" y="250" width="480" height="6" fill={P.ink300} />
      {/* big price tag */}
      <g transform="translate(150 92) rotate(-12)">
        <path
          d="M36 0 H150 Q162 0 162 12 V96 Q162 108 150 108 H36 L0 54 Z"
          fill={P.or500}
        />
        <circle cx="34" cy="54" r="10" fill={P.white} />
        <text x="98" y="66" textAnchor="middle" fontSize="40" fontWeight="800" fill={P.white}>
          £
        </text>
        {/* string */}
        <path d="M30 44 q-24 -34 8 -58" fill="none" stroke={P.ink500} strokeWidth="3" />
      </g>
      {/* payment card */}
      <g transform="translate(268 176) rotate(8)">
        <rect x="0" y="0" width="150" height="94" rx="12" fill={P.ink800} />
        <rect x="0" y="18" width="150" height="16" fill={P.ink900} />
        <rect x="14" y="48" width="34" height="24" rx="4" fill={P.or400} />
        <rect x="14" y="78" width="70" height="6" rx="3" fill={P.ink500} />
      </g>
      <CoinStack x={110} y={296} s={1.1} />
      <CarSide x={186} y={286} s={0.95} body={P.ink700} />
      <Bush x={442} y={258} s={1} tone={P.or300} />
    </>
  );
}

function SupportScene() {
  return (
    <>
      <HeroSky />
      <Cloud x={80} y={46} s={0.9} />
      <rect x="0" y="268" width="480" height="92" fill={P.ink200} />
      <rect x="0" y="268" width="480" height="6" fill={P.ink300} />
      {/* big open envelope */}
      <g transform="translate(96 128)">
        <rect x="0" y="20" width="180" height="120" rx="10" fill={P.or500} />
        <polygon points="0,30 90,96 180,30 180,140 0,140" fill={P.or600} />
        <polygon points="0,20 90,-30 180,20 90,86" fill={P.or400} />
        <circle cx="90" cy="12" r="6" fill={P.white} />
      </g>
      {/* chat bubbles */}
      <g transform="translate(312 108)">
        <rect x="0" y="0" width="120" height="58" rx="16" fill={P.white} />
        <polygon points="22,56 40,56 20,76" fill={P.white} />
        <rect x="16" y="18" width="88" height="7" rx="3.5" fill={P.ink300} />
        <rect x="16" y="34" width="60" height="7" rx="3.5" fill={P.ink200} />
      </g>
      <g transform="translate(342 196)">
        <rect x="0" y="0" width="104" height="50" rx="14" fill={P.ink800} />
        <polygon points="80,48 96,48 100,66" fill={P.ink800} />
        <rect x="14" y="16" width="52" height="7" rx="3.5" fill={P.or400} />
        <rect x="14" y="30" width="72" height="7" rx="3.5" fill={P.ink600} />
      </g>
      <Bush x={40} y={276} s={1.2} tone={P.or300} />
      <Bush x={452} y={280} s={0.9} />
    </>
  );
}

const SCENES: Record<HeroKind, () => React.ReactNode> = {
  journey: JourneyScene,
  traveller: TravellerScene,
  host: HostScene,
  trust: TrustScene,
  pricing: PricingScene,
  support: SupportScene,
};

/**
 * Real-photo overrides. To replace an illustration with photography:
 * put the file in public/photos/ (e.g. public/photos/hero-journey.jpg,
 * ~1200×900, licensed for commercial use) and map it here — the photo then
 * renders in the same frame and the illustration becomes the fallback.
 */
const HERO_PHOTOS: Partial<Record<HeroKind, string>> = {
  // journey: "/photos/hero-journey.jpg",
  // traveller: "/photos/hero-traveller.jpg",
  // host: "/photos/hero-host.jpg",
  // trust: "/photos/hero-trust.jpg",
  // pricing: "/photos/hero-pricing.jpg",
  // support: "/photos/hero-support.jpg",
};

/** Framed hero visual (photo when provided, illustration otherwise). */
export function HeroVisual({ kind, className }: { kind: HeroKind; className?: string }) {
  const photo = HERO_PHOTOS[kind];
  const Scene = SCENES[kind];
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-navy-100 shadow-card-lg",
        className
      )}
      aria-hidden
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="block aspect-[4/3] h-auto w-full object-cover" />
      ) : (
        <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img">
          {Scene()}
        </svg>
      )}
    </div>
  );
}
