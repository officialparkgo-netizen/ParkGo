"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";

/**
 * base64url → bytes, the format the Push API wants for a VAPID key. Built on
 * an explicit ArrayBuffer so the result is the plain `BufferSource` the
 * subscribe() signature asks for.
 */
function urlBase64ToBytes(base64: string): ArrayBuffer {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) view[i] = raw.charCodeAt(i);
  return buffer;
}

/**
 * Phone alerts for the on-call agent.
 *
 * Desktop notifications only reach someone with the console open; this
 * registers the device with the push service so an urgent chat or a missed
 * reply target lands even with the tab closed. Renders nothing at all until
 * VAPID keys are configured — a dead button is worse than no button.
 */
export function PushToggle({
  labels,
}: {
  labels: { off: string; on: string; blocked: string; unsupported: string };
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "on" | "blocked" | "unsupported">("idle");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/support/push", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { enabled: boolean; key: string | null } | null) => {
        setEnabled(!!d?.enabled);
        setKey(d?.key ?? null);
      })
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    navigator.serviceWorker
      .getRegistration("/sw-push.js")
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => sub && setState("on"))
      .catch(() => {
        /* not registered yet — the button offers to */
      });
  }, [enabled]);

  if (!enabled || state === "unsupported") return null;

  const subscribe = async () => {
    if (busy || !key) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("blocked");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw-push.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBytes(key),
      });
      const res = await fetch("/api/support/push", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (res.ok) setState("on");
    } catch {
      setState("blocked");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={busy || state === "on"}
      data-push-toggle
      aria-pressed={state === "on"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
        state === "on"
          ? "bg-brand-500 text-white"
          : "border border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
      }`}
    >
      <BellRing className="h-3.5 w-3.5" aria-hidden />
      {state === "on" ? labels.on : state === "blocked" ? labels.blocked : labels.off}
    </button>
  );
}
