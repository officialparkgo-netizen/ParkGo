"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface SearchMapSpace {
  id: string;
  lat: number;
  lng: number;
  /** Pre-formatted price label shown on the pin (e.g. "£53"). */
  price: string;
  title: string;
  /** Where clicking the pin navigates (space page with the current dates). */
  href: string;
}

/**
 * Search results on a real Mapbox map with price-labelled pins — the standard
 * marketplace pattern (compare on the map, click a price to open the listing).
 * Rendered only when NEXT_PUBLIC_MAPBOX_TOKEN is set; the schematic ResultsMap
 * stays as the keyless fallback. mapbox-gl loads dynamically (never SSR).
 */
export function SearchMap({
  airport,
  spaces,
  className,
}: {
  airport: { lat: number; lng: number; name: string; kind?: string };
  spaces: SearchMapSpace[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const spacesKey = JSON.stringify(spaces.map((s) => [s.id, s.price]));

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const el = containerRef.current;
    if (!token || !el) return;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let map: any;
    let cancelled = false;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled || !el) return;
      mapboxgl.accessToken = token;
      map = new mapboxgl.Map({
        container: el,
        style: "mapbox://styles/mapbox/light-v11",
        center: [airport.lng, airport.lat],
        zoom: 11,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      // Airport marker
      const planeEl = document.createElement("div");
      planeEl.style.cssText =
        "display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#15171A;color:#fff;box-shadow:0 1px 6px rgba(0,0,0,.35);";
      const isAirport = !airport.kind || airport.kind === "airport";
      planeEl.innerHTML = isAirport
        ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>'
        : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';
      new mapboxgl.Marker({ element: planeEl })
        .setLngLat([airport.lng, airport.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(airport.name))
        .addTo(map);

      // Price pins
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([airport.lng, airport.lat]);
      for (const s of spaces) {
        const pin = document.createElement("div");
        pin.style.cssText =
          "padding:4px 10px;border-radius:9999px;background:#fff;border:1.5px solid #D6D8DC;color:#15171A;font-weight:800;font-size:12px;line-height:1.2;box-shadow:0 1px 5px rgba(0,0,0,.25);cursor:pointer;white-space:nowrap;transition:transform .12s,background .12s,color .12s;";
        pin.textContent = s.price;
        pin.title = s.title;
        pin.addEventListener("mouseenter", () => {
          pin.style.transform = "scale(1.12)";
          pin.style.background = "#F26A1B";
          pin.style.color = "#fff";
          pin.style.borderColor = "#F26A1B";
          pin.style.zIndex = "10";
        });
        pin.addEventListener("mouseleave", () => {
          pin.style.transform = "scale(1)";
          pin.style.background = "#fff";
          pin.style.color = "#15171A";
          pin.style.borderColor = "#D6D8DC";
          pin.style.zIndex = "";
        });
        pin.addEventListener("click", () => router.push(s.href));
        new mapboxgl.Marker({ element: pin }).setLngLat([s.lng, s.lat]).addTo(map);
        bounds.extend([s.lng, s.lat]);
      }

      map.fitBounds(bounds, { padding: 56, maxZoom: 13, duration: 0 });
    });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airport.lat, airport.lng, airport.name, spacesKey]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-[28rem]"}
      style={{ borderRadius: "1rem", overflow: "hidden" }}
    />
  );
}
