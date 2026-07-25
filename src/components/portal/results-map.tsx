import { MapPin, Plane } from "lucide-react";
import { projectToViewport } from "@/lib/services/maps";

/**
 * Static multi-pin results map (mock maps provider) — server-rendered, no token.
 * Swap for Mapbox/Google in live mode using NEXT_PUBLIC_MAPS_PROVIDER.
 */
export function ResultsMap({
  airport,
  spaces,
  className,
}: {
  airport: { lat: number; lng: number; name: string; kind?: string };
  spaces: { id: string; lat: number; lng: number }[];
  className?: string;
}) {
  const points = [
    { lat: airport.lat, lng: airport.lng },
    ...spaces.map((s) => ({ lat: s.lat, lng: s.lng })),
  ];
  const project = projectToViewport(points);
  const ap = project({ lat: airport.lat, lng: airport.lng });

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-navy-800 ${className ?? "h-80"}`}
    >
      <div className="absolute inset-0 bg-grid opacity-25" />
      {spaces.map((s, i) => {
        const p = project({ lat: s.lat, lng: s.lng });
        return (
          <div
            key={s.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-700 shadow ring-2 ring-white">
              {i + 1}
            </span>
          </div>
        );
      })}
      <div
        className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        style={{ left: `${ap.x * 100}%`, top: `${ap.y * 100}%` }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-400 shadow ring-2 ring-white">
          {!airport.kind || airport.kind === "airport" ? (
            <Plane className="h-4 w-4 text-navy-900" />
          ) : (
            <MapPin className="h-4 w-4 text-navy-900" />
          )}
        </span>
        <span className="whitespace-nowrap rounded bg-navy-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {airport.name}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-navy-700">
        <MapPin className="h-3.5 w-3.5 text-brand-700" /> {spaces.length} spaces near{" "}
        {airport.name}
      </div>
    </div>
  );
}
