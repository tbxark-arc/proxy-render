import { router } from "./router.js";

function errorHandler(error) {
  return new Response(error.message || "Server Error", {
    status: error.status || 500,
  });
}

addEventListener("fetch", (event) =>
  event.respondWith(router.handle(event.request).catch(errorHandler))
);

addEventListener("scheduled", (event) => {
  event.waitUntil(async (e) => {
    // Update your proxies cache
    await fetch(Update_Cache_Url);
  });
});
