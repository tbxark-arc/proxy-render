import {Router} from 'itty-router';
import {fetchRules, fetchConfig, deleteCache} from './lib/controller.js';

export function errorHandler(error) {
  return new Response(error.message || 'Server Error', {
    status: error.status || 500,
  });
}

export function createRouter(cache) {
  const router = Router(); // eslint-disable-line 

  router.get('/', () => {
    return new Response('ok');
  });

  router.get('/rule/:type', async ({params, query}) => {
    const body = await fetchRules(params, query, cache);
    return new Response(body);
  });

  router.get('/config/:type', async ({params, query}) => {
    const text = fetchConfig(params, query);
    return new Response(text);
  });

  router.get('/git/*', async (req) => {
    let url = new URL(req.url);
    url = `https://raw.githubusercontent.com${url.pathname.replace(
        '/git',
        '',
    )}`;
    return await fetch(url);
  });

  router.all('/clear', async ({query}) => {
    await deleteCache(query, cache);
    return new Response('Success.');
  });

  router.all('*', () => new Response('Not Found.', {status: 404}));

  return router;
}


