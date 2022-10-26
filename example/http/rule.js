import {fengyeLoader, gsouLoader, freeLoader} from './loader.js';
import {render, defaultNameRender, makeID} from '../../src/render.js';
import {fetchProxies} from '../../src/http.js';


export async function fetchFreeProxies(type) {
  const nameRender = () => {
    return `free-${makeID(10)}`;
  };
  return render(type, nameRender, await freeLoader());
}

export async function fetchCustomAirport(type, custom) {
  const [proxy, url] = JSON.parse(custom);
  const rules = await fetchProxies(proxy, url);
  return render(type, defaultNameRender, rules);
}

export async function fetchGsouProxies(gsou, ignoreCache, type, cache) {
  let gsouRules = [];
  const key = `proxies-gsou-${gsou}`;
  if (!ignoreCache && cache) {
    try {
      const raw = await cache.get(key);
      gsouRules = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.log(e);
    }
  }
  if (gsouRules == null || !gsouRules.length) {
    gsouRules = await gsouLoader(gsou);
    if (cache) {
      await cache.put(key, JSON.stringify(gsouRules));
    }
  }

  const nameRender = (proxy) => {
    if (proxy.type === 'vmess') {
      return (
        'GS-' +
        proxy.config.remark
            .replace(/ /g, '')
            .replace('VIP-v2ray', 'v1')
            .replace('v2ray', 'v2')
      );
    } else {
      const name = proxy.config.host.split('.').slice(2).reverse().join('-');
      return `GS-${proxy.type}-${name}-${proxy.config.port}`;
    }
  };
  // sort by name
  gsouRules = gsouRules.sort((a, b) => {
    const nameA = nameRender(a).toUpperCase();
    const nameB = nameRender(b).toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  return render(type, nameRender, gsouRules);
}

export async function fetchFyProxies(fy, ignoreCache, type, cache) {
  const [auth, port] = fy.split('-');
  const key = `proxies-fy-${auth}-${port}`;
  let fyRules = null;
  if (!ignoreCache && cache) {
    try {
      const raw = await cache.get(key);
      fyRules = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.log(e);
    }
  }
  if (fyRules == null || !fyRules.length) {
    fyRules = await fengyeLoader(auth, port);
    if (cache) {
      await cache.put(key, JSON.stringify(fyRules));
    }
  }

  const nameRender = (proxy) => {
    const name = proxy.config.host.split('.')[0];
    return `FY-${proxy.type}-${name}`;
  };

  return render(type, nameRender, fyRules);
}
