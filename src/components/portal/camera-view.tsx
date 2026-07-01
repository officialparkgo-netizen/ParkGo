"use client";

import { useEffect, useState } from "react";
import { Camera, Maximize2, Video } from "lucide-react";

/**
 * Live camera view. In mock mode this renders a simulated CCTV feed (animated,
 * with a live clock + REC badge) so the differentiator is demoable without
 * hardware. In live mode, swap the inner panel for an <video> playing the signed
 * HLS/WebRTC URL — the chrome (LIVE badge, label, timestamp) stays the same.
 */
export function CameraView({
  label,
  protocol,
  className,
}: {
  label: string;
  protocol: "hls" | "webrtc";
  className?: string;
}) {
  const [clock, setClock] = useState("--:--:--");
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setClock(d.toLocaleTimeString("en-GB"));
    };
    update();
    const id = setInterval(update, 1000);
    const scanId = setInterval(() => setScan((s) => (s + 1) % 100), 60);
    return () => {
      clearInterval(id);
      clearInterval(scanId);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-navy-950 ${className ?? "aspect-video"}`}
    >
      {/* simulated scene: a parked car under the camera */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-800 to-navy-950" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-navy-900/60" />
      <CarSilhouette />

      {/* moving scanline for a "live" feel */}
      <div
        className="absolute left-0 right-0 h-px bg-white/10"
        style={{ top: `${scan}%` }}
      />

      {/* chrome */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        LIVE
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded bg-black/40 px-2 py-1 text-[11px] font-semibold uppercase text-white/80">
        <Video className="h-3.5 w-3.5" /> {protocol}
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white/90">
        <Camera className="h-4 w-4" /> {label}
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-xs text-white/80">
        {clock}
      </div>
      <button
        className="absolute right-3 top-12 flex h-7 w-7 items-center justify-center rounded-lg bg-black/30 text-white/70 hover:bg-black/50"
        aria-label="Fullscreen"
        type="button"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CarSilhouette() {
  return (
    <svg
      viewBox="0 0 240 120"
      className="absolute bottom-6 left-1/2 w-3/5 -translate-x-1/2"
      aria-hidden
    >
      <g fill="#0C0D0F" stroke="#2A2E34" strokeWidth="2">
        <rect x="20" y="62" width="200" height="34" rx="12" />
        <path d="M55 62 C70 38, 170 38, 185 62 Z" />
      </g>
      <circle cx="70" cy="98" r="14" fill="#0C0D0F" stroke="#2A2E34" strokeWidth="3" />
      <circle cx="170" cy="98" r="14" fill="#0C0D0F" stroke="#2A2E34" strokeWidth="3" />
      <rect x="78" y="48" width="40" height="16" rx="4" fill="#2A2E34" opacity="0.7" />
      <rect x="124" y="48" width="40" height="16" rx="4" fill="#2A2E34" opacity="0.7" />
    </svg>
  );
}
