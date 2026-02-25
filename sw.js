const CACHE_NAME = "signature-arc-v3";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/privacy-policy.html",
  "/terms-conditions.html",
  "/service-agreement.html",
  "/img/hero.webp",
  "/android-icon-192x192.png",
  "/android-icon-512x512.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        STATIC_ASSETS.map(url =>
          fetch(url)
            .then(response => {
              if (!response.ok) throw new Error("Bad response");
              return cache.put(url, response);
            })
            .catch(() => console.warn("Cache failed:", url))
        )
      )
    )
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (Network First Strategy)
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || caches.match("/index.html"));
      })
  );
});
