/**
 * Offline entry pass.
 *
 * Airport car parks are exactly where a phone has no signal — underground, or
 * behind a wall of concrete at 5am. The pass page is small and self-contained
 * (the QR is an inline data URL), so caching it means the barrier still opens
 * when the network does not.
 *
 * Scope is deliberately narrow: only /pass/* is touched, so this cannot
 * interfere with the rest of the app or serve anyone stale prices.
 */
const CACHE = "parkgo-pass-v1";

self.addEventListener("install", () => {
  // Take over as soon as the pass page registers us — the traveller may be
  // about to lose signal, so waiting for a second visit is no use.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith("/pass/")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        // Network first while there is a network: a cancelled booking must
        // not keep opening a barrier from a stale copy.
        const fresh = await fetch(event.request);
        if (fresh.ok) await cache.put(event.request, fresh.clone());
        return fresh;
      } catch {
        const hit = await cache.match(event.request, { ignoreSearch: true });
        if (hit) return hit;
        return new Response(
          "<h1>Offline</h1><p>Open this pass once while online and it will be here next time.</p>",
          { status: 503, headers: { "content-type": "text/html; charset=utf-8" } }
        );
      }
    })()
  );
});
