// Manifest-only PWA: no service worker registration.
// If a previous build registered any service worker, unregister it so users
// don't get stuck on stale cached HTML.
export function cleanupLegacyServiceWorkers() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => {
      regs.forEach((r) => {
        r.unregister().catch(() => {});
      });
    })
    .catch(() => {});
}
