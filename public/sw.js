self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);

// ponytail: tanpa offline caching — absen butuh jaringan (Supabase + geofence GPS)
self.addEventListener("fetch", () => {});