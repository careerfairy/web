// public/service-worker.js
self.addEventListener("install", () => {
   console.log("Service worker installed")
})

self.addEventListener("activate", () => {
   console.log("Service worker activated")
})

self.addEventListener("fetch", (event) => {
   console.log("Fetch event for ", event.request.url)
})
