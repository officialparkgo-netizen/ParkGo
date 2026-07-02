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

  // Route "draw-in": measure the path once, reveal it via stroke-dashoffset,
  // then settle into the dashed style. Neutralised by the global reduced-motion
  // guard (transition-duration is forced to ~0ms).
  const routeRef = useRef<SVGPathElement | null>(null);
  const [routeLen, setRouteLen] = useState<number | null>(null);
  const [routeDrawn, setRouteDrawn] = useState(false);
  const [routeDashed, setRouteDashed] = useState(false);

  useEffect(() => {
    const p = routeRef.current;
    if (!p) return;
    setRouteLen(p.getTotalLength());
    const rafId = requestAnimationFrame(() => setRouteDrawn(true));
    const timer = window.setTimeout(() => setRouteDashed(true), 1200);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

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
          ref={routeRef}
          d={`M ${start.x} ${start.y} Q ${cx} ${cy} ${terminal.x} ${terminal.y}`}
          fill="none"
          stroke="#F26A1B"
          strokeWidth="0.8"
          strokeDasharray={routeDashed ? "1 2" : routeLen ?? undefined}
          strokeDashoffset={routeLen == null ? 0 : routeDrawn ? 0 : routeLen}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            opacity: routeLen == null ? 0 : 1,
            transition: "stroke-dashoffset 1.1s ease-out, opacity 0.3s ease-out",
          }}
        />
      </svg>

      <Pin x={space.x} y={space.y} label={space.label} tone="white" delayMs={60}>
        <MapPin className="h-3.5 w-3.5 text-brand-700" />
      </Pin>
      <Pin x={terminal.x} y={terminal.y} label={terminal.label} tone="accent" delayMs={140}>
        <Plane className="h-3.5 w-3.5 text-white" />
      </Pin>

      {showDriver && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${dx}%`, top: `${dy}%` }}
        >
          <span className="relative flex animate-scale-in">
            <span className="absolute inline-flex h-9 w-9 -translate-x-1/4 -translate-y-1/4 animate-pulse-ring rounded-full bg-go-400/60" />
            <span className="relative flex h-7 w-7 animate-float items-center justify-center rounded-full bg-go-500 shadow-lg ring-2 ring-white">
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
  delayMs = 0,
}: {
  x: number;
  y: number;
  label: string;
  tone: "white" | "accent";
  children: React.ReactNode;
  delayMs?: number;
}) {
  return (
    <div
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className={`flex h-7 w-7 animate-scale-in items-center justify-center rounded-full shadow ring-2 ring-white ${
          tone === "accent" ? "bg-accent-400" : "bg-white"
        }`}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        {children}
      </span>
      <span
        className="animate-fade-in whitespace-nowrap rounded bg-navy-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        {label}
      </span>
    </div>
  );
}
