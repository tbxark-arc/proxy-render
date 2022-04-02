import {Router} from 'itty-router';
import {surgeFile, clashFile} from '@tbxark/proxy-render/lib/template.js';
import {
  fetchGsouProxies,
  fetchFyProxies,
  fetchCustomAirport,
  fetchFreeProxies,
} from './rule.js';

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
    const {type} = params;
    const {fy, gsou, free, custom, ignoreCache} = query;
    const rules = [];

    if (gsou) {
      rules.push(await fetchGsouProxies(gsou, ignoreCache, type, cache));
    }
    if (fy) {
      rules.push(await fetchFyProxies(fy, ignoreCache, type, cache));
    }
    if (custom) {
      rules.push(await fetchCustomAirport(type, custom));
    }
    if (free) {
      rules.push(await fetchFreeProxies(type));
    }

    if (type === 'clash') {
      return new Response(
          'proxies:\n\n' +
          rules.map((r) => r.replace('proxies:\n\n', '')).join('\n'),
      );
    } else {
      return new Response(rules.join('\n'));
    }
  });

  router.get('/config/:type', async ({params, query}) => {
    const {type} = params;
    const policyPath = `https://${DOMAIN}/rule/${type}?${Object.entries(query)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')}`;
    const gitDomain = `https://${DOMAIN}/git`;
    const text =
      type === 'clash' ?
        clashFile(policyPath, gitDomain) :
        surgeFile(policyPath, gitDomain);
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
    const {fy, gsou} = query;

    if (fy) {
      const [auth, port] = fy.split('-');
      const key = `proxies-fy-${auth}-${port}`;
      await cache.delete(key);
    }

    if (gsou) {
      const key = `proxies-gsou-${gsou}`;
      await cache.delete(key);
    }

    return new Response('Success.');
  });

  router.all('*', () => new Response('Not Found.', {status: 404}));

  return router;
}
