
const CACHE_NAME = "negosyohub-shell-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("negosyohub-shell-") &&
                           key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);

      if (cached) {
        return cached;
      }

      if (request.mode === "navigate") {
        const appPage = await caches.match("./index.html");

        if (appPage) {
          return appPage;
        }
      }

      return new Response(
        "Walang koneksyon. Pakisuri ang internet at subukan ulit.",
        {
          status: 503,
          statusText: "Service Unavailable",
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        }
      );
    })
  );
});

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
