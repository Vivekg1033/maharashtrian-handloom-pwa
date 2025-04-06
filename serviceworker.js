const CACHE_NAME = "handloom-cache-v1";
const FILES_TO_CACHE = [
  "/maharashtrian-handloom-pwa/",
  "/maharashtrian-handloom-pwa/index.html",
  "/maharashtrian-handloom-pwa/manifest.json",
  "/maharashtrian-handloom-pwa/icons/icon-192x192.png",
  "/maharashtrian-handloom-pwa/icons/icon-512x512.png",
  "/maharashtrian-handloom-pwa/images/Artisan Village.webp",
  "/maharashtrian-handloom-pwa/images/hero.webp",
  "/maharashtrian-handloom-pwa/images/Himroo Shawl.webp",
  "/maharashtrian-handloom-pwa/images/Karvati Saree.webp",
  "/maharashtrian-handloom-pwa/images/Kolhapuri Chappals.webp",
  "/maharashtrian-handloom-pwa/images/Mashru Silk Fabric.webp",
  "/maharashtrian-handloom-pwa/images/Narali Patali Fabric.webp",
  "/maharashtrian-handloom-pwa/images/Paithani Saree.webp",
  "/maharashtrian-handloom-pwa/images/place.webp",
  "/maharashtrian-handloom-pwa/images/place1.webp",
  "/maharashtrian-handloom-pwa/images/place2.webp",
  "/maharashtrian-handloom-pwa/images/placeholder.webp",
  "/maharashtrian-handloom-pwa/images/placeholder1.webp",
  "/maharashtrian-handloom-pwa/images/placeholder2.webp",
  "/maharashtrian-handloom-pwa/images/Traditional Craft.webp",
  "/maharashtrian-handloom-pwa/images/Weaving Workshop.webp",
  "/maharashtrian-handloom-pwa/offline.html",
];

// Install Event
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Caching files");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

// Enhanced Fetch Event
self.addEventListener("fetch", (event) => {
  console.log("[ServiceWorker] Fetch", event.request.url);
  const requestURL = new URL(event.request.url);

  // If request is same-origin, use Cache First
  if (requestURL.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).catch(() => caches.match("offline.html"))
        );
      })
    );
  } else {
    // Else, use Network First
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((res) => {
            return res || caches.match("offline.html");
          })
        )
    );
  }
});

// Sync Event (simulation)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(
      (async () => {
        console.log("Sync event triggered: 'sync-data'");
        // Here you can sync data with server when online
      })()
    );
  }
});

// Push Event
self.addEventListener("push", function (event) {
  if (event && event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        method: "pushMessage",
        message: event.data.text(),
      };
    }

    if (data.method === "pushMessage") {
      console.log("Push notification sent");
      event.waitUntil(
        self.registration.showNotification("Maharashtrian Handloom", {
          body: data.message,
        })
      );
    }
  }
});
