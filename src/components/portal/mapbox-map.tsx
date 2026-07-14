"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

interface Pt {
  lat: number;
  lng: number;
  label: string;
}

/**
 * Real Mapbox GL map for the space/terminal + (optional) animated driver.
 * Only rendered when NEXT_PUBLIC_MAPBOX_TOKEN is set; the schematic LiveMap is
 * the fallback. mapbox-gl is imported dynamically so it never runs during SSR.
 */
export function MapboxMap({
  space,
  terminal,
  showDriver = false,
  className,
}: {
  space: Pt;
  terminal: Pt;
  showDriver?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const el = containerRef.current;
    if (!token || !el) return;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let map: any;
    let raf: number | null = null;
    let cancelled = false;

    const dot = (color: string) => {
      const d = document.createElement("div");
      d.style.cssText = `width:16px;height:16px;border-radius:9999px;background:${color};box-shadow:0 0 0 3px #fff,0 1px 4px rgba(0,0,0,.45);`;
      return d;
    };

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled || !el) return;
      mapboxgl.accessToken = token;
      map = new mapboxgl.Map({
        container: el,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [space.lng, space.lat],
        zoom: 11,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      new mapboxgl.Marker({ element: dot("#F26A1B") })
        .setLngLat([space.lng, space.lat])
        .setPopup(new mapboxgl.Popup({ offset: 14 }).setText(space.label))
        .addTo(map);
      new mapboxgl.Marker({ element: dot("#ffffff") })
        .setLngLat([terminal.lng, terminal.lat])
        .setPopup(new mapboxgl.Popup({ offset: 14 }).setText(terminal.label))
        .addTo(map);

      map.fitBounds(
        new mapboxgl.LngLatBounds()
          .extend([space.lng, space.lat])
          .extend([terminal.lng, terminal.lat]),
        { padding: 64, maxZoom: 13, duration: 0 }
      );

      map.on("load", () => {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [space.lng, space.lat],
                [terminal.lng, terminal.lat],
              ],
            },
          },
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: { "line-color": "#F26A1B", "line-width": 3, "line-dasharray": [1.5, 1.5] },
        });

        if (showDriver) {
          const driver = new mapboxgl.Marker({ element: dot("#F5843A") })
            .setLngLat([space.lng, space.lat])
            .addTo(map);
          const DURATION = 16000;
          let t0: number | null = null;
          const tick = (ts: number) => {
            if (t0 === null) t0 = ts;
            const p = ((ts - t0) % DURATION) / DURATION;
            driver.setLngLat([
              space.lng + (terminal.lng - space.lng) * p,
              space.lat + (terminal.lat - space.lat) * p,
            ]);
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      });
    });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (map) map.remove();
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [space.lat, space.lng, space.label, terminal.lat, terminal.lng, terminal.label, showDriver]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-72"}
      style={{ borderRadius: "1rem", overflow: "hidden" }}
    />
  );
}
