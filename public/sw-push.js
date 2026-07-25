/**
 * Push service worker for the support team.
 *
 * Deliberately minimal: it exists so an on-call agent gets told about an
 * urgent chat when the console tab is closed. It caches nothing and handles
 * nothing else, so it can't interfere with the rest of the app.
 */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "ParkGo support", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "ParkGo support";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      // One notification per ticket, replaced rather than stacked.
      tag: payload.tag || "parkgo-support",
      data: { url: payload.url || "/admin/support" },
      icon: "/icon.svg",
      badge: "/icon.svg",
      requireInteraction: payload.urgent === true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/admin/support";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Reuse an open console tab rather than piling up new ones.
      for (const client of windows) {
        if (client.url.includes("/admin/support") && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
