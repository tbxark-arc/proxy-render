import {bindGlobal, startServer, MemoryCache} from 'cloudflare-worker-adapter';
import {createRouter, errorHandler} from './http/router.js';

bindGlobal({
  ProxiesCache: new MemoryCache(),
});

addEventListener('fetch', (event) => {
  const router = createRouter(ProxiesCache);
  event.respondWith(router.handle(event.request).catch(errorHandler));
});

startServer();
