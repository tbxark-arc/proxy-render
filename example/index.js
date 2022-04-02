import {createRouter, errorHandler} from './router.js';

addEventListener('fetch', (event) => {
  const router = createRouter(ProxiesCache);
  event.respondWith(router.handle(event.request).catch(errorHandler));
},
);

addEventListener('scheduled', (event) => {
  event.waitUntil(async (e) => {
    await fetch(UPDATE_CACHE_URL);
  });
});
