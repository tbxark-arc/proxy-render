import {
  surgeFile,
  clashFile,
} from '../../template.js';
import {
  fetchGsouProxies,
  fetchFyProxies,
  fetchCustomAirport,
  fetchFreeProxies,
} from './rule.js';

export async function deleteCache(query, cache) {
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
}

export function fetchConfig(params, query) {
  const {type} = params;
  const policyPath = `https://${DOMAIN}/rule/${type}?${Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')}`;
  const gitDomain = `https://${DOMAIN}/git`;
  const text = type === 'clash' ?
    clashFile(policyPath, gitDomain) :
    surgeFile(policyPath, gitDomain);
  return text;
}

export async function fetchRules(params, query, cache) {
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

  let body = '';
  if (type === 'clash') {
    body = 'proxies:\n\n';
    body += rules.map((r) => r.replace('proxies:\n\n', '')).join('\n');
  } else {
    body = rules.join('\n');
  }
  return body;
}
