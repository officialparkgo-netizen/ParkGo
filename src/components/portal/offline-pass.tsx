"use client";

import { useEffect, useState } from "react";
import { CloudOff, Wifi } from "lucide-react";

/**
 * Keeps the entry pass working with no signal.
 *
 * Registers the narrow /pass/* service worker and tells the traveller, in
 * plain terms, that the pass is now stored on the phone. The badge doubles as
 * live connection state, so someone standing at a dead barrier can see at a
 * glance that they are offline and that it does not matter.
 */
export function OfflinePass({
  labels,
}: {
  labels: { saving: string; ready: string; offline: string };
}) {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw-pass.js", { scope: "/pass/" })
        .then(() => setReady(true))
        .catch(() => {
          // Private mode and some corporate profiles block workers; the page
          // still works online, so there is nothing to report.
        });
    }
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return (
    <p
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
        !online
          ? "bg-navy-900 text-white"
          : ready
            ? "bg-go-50 text-go-700"
            : "bg-navy-50 text-navy-500"
      }`}
      data-offline-state={!online ? "offline" : ready ? "ready" : "saving"}
    >
      {!online ? (
        <CloudOff className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Wifi className="h-3.5 w-3.5" aria-hidden />
      )}
      {!online ? labels.offline : ready ? labels.ready : labels.saving}
    </p>
  );
}
