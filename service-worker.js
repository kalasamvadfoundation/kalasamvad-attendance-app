
const CACHE_NAME = "kalasamvad-attendance-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png",
  "./kalasamvad-icon-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(function(response) {
      if (response && response.ok) {
        const copy = response.clone();

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, copy);
        });
      }

      return response;
    }).catch(function() {
      return caches.match(request).then(function(cached) {
        return cached || caches.match("./index.html");
      });
    })
  );
});
