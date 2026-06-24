"use client";

import { useEffect, useRef, useState } from "react";
import { Car, MapPin, Plane } from "lucide-react";

interface Marker {
  x: number; // 0–100
  y: number; // 0–100
  label: string;
}

/**
 * Schematic live map (mock maps provider). Animates the driver marker along a
 * route toward the terminal so travel day feels live with no token/network.
 * In live mode this component is swapped for Mapbox/Google with real coords.
 */
export function LiveMap({
  space,
  terminal,
  driverStart,
  className,
  showDriver = true,
}: {
  space: Marker;
  terminal: Marker;
  driverStart?: Marker;
  className?: string;
  showDriver?: boolean;
}) {
  const start = driverStart ?? { x: 12, y: 82, label: "Driver" };
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!showDriver) return;
    let mounted = true;
    const DURATION = 16000;
    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const elapsed = (ts - startTs) % DURATION;
      if (mounted) setT(elapsed / DURATION);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [showDriver]);

  // Quadratic bezier from driver start -> terminal, arced control point.
  const cx = (start.x + terminal.x) / 2 + 8;
  const cy = Math.min(start.y, terminal.y) - 18;
  const bz = (a: number, b: number, c: number, p: number) =>
    (1 - p) * (1 - p) * a + 2 * (1 - p) * p * b + p * p * c;
  const dx = bz(start.x, cx, terminal.x, t);
  const dy = bz(start.y, cy, terminal.y, t);
  const etaMin = Math.max(1, Math.round((1 - t) * 12));

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-navy-800 ${className ?? "h-72"}`}
    >
      <div className="absolute inset-0 bg-grid opacity-25" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={`M ${start.x} ${start.y} Q ${cx} ${cy} ${terminal.x} ${terminal.y}`}
          fill="none"
          stroke="#36B24A"
          strokeWidth="0.8"
          strokeDasharray="1 2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <Pin x={space.x} y={space.y} label={space.label} tone="white">
        <MapPin className="h-3.5 w-3.5 text-brand-700" />
      </Pin>
      <Pin x={terminal.x} y={terminal.y} label={terminal.label} tone="accent">
        <Plane className="h-3.5 w-3.5 text-white" />
      </Pin>

      {showDriver && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${dx}%`, top: `${dy}%` }}
        >
          <span className="relative flex">
            <span className="absolute inline-flex h-9 w-9 -translate-x-1/4 -translate-y-1/4 animate-pulse-ring rounded-full bg-go-400/60" />
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-go-500 shadow-lg ring-2 ring-white">
              <Car className="h-3.5 w-3.5 text-white" />
            </span>
          </span>
        </div>
      )}

      {showDriver && (
        <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-navy-900 shadow">
          Driver arriving in ~{etaMin} min
        </div>
      )}
    </div>
  );
}

function Pin({
  x,
  y,
  label,
  tone,
  children,
}: {
  x: number;
  y: number;
  label: string;
  tone: "white" | "accent";
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full shadow ring-2 ring-white ${
          tone === "accent" ? "bg-accent-400" : "bg-white"
        }`}
      >
        {children}
      </span>
      <span className="whitespace-nowrap rounded bg-navy-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {label}
      </span>
    </div>
  );
}
