const CACHE_VERSION = "uxfs-v1.1.1";   // bump on EVERY deploy, including content edits
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./content.js",
  "./storage.js",
  "./engine.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./fonts/BricolageGrotesque.woff2",
  "./fonts/HankenGrotesk.woff2",
  "./fonts/JetBrainsMono.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(SHELL)));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit =>
      hit || fetch(e.request)
    )
  );
});
self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
