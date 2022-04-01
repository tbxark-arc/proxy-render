import { fengyeLoader, gsouLoader, freeLoader } from "./loader.js";
import { render, defaultNameRender } from "@tbxark/proxy-render/render.js";
import { fetchProxies } from "@tbxark/proxy-render/http.js";


export async function fetchFreeProxies(type) {
  return render(type, defaultNameRender, await freeLoader())
}

export async function fetchCustomAirport(type, custom) {
  const [proxy, url] = JSON.parse(custom);
  const rules = await fetchProxies(proxy, url);
  return render(type, defaultNameRender, rules);
}

export async function fetchGsouProxies(gsou, ignoreCache, type) {
  let gsouRules = [];
  const key = `proxies-gsou-${gsou}`;
  if (!ignoreCache) {
    try {
      const raw = await Proxies_Cache.get(key);
      gsouRules = JSON.parse(raw);
    } catch (e) {
      console.log(e);
    }
  }
  if (gsouRules == null || !gsouRules.length) {
    gsouRules = await gsouLoader(gsou);
    await Proxies_Cache.put(key, JSON.stringify(gsouRules));
  }

  const nameRender = (proxy) => {
    if (proxy.type === "vmess") {
      return (
        "GS-" +
        proxy.config.remark
          .replace(/ /g, "")
          .replace("-v2ray", "")
          .replace("-v2ray", "")
      );
    } else {
      const name = proxy.config.host.split(".").slice(2).reverse().join("-");
      return `GS-${proxy.type}-${name}-${proxy.config.port}`;
    }
  };
  return render(type, nameRender, gsouRules);
}

export async function fetchFyProxies(fy, ignoreCache, type) {
  const [auth, port] = fy.split("-");
  const key = `proxies-fy-${auth}-${port}`;
  let fyRules = null;
  if (!ignoreCache) {
    try {
      const raw = await Proxies_Cache.get(key);
      fyRules = JSON.parse(raw);
    } catch (e) {
      console.log(e);
    }
  }
  if (fyRules == null || !fyRules.length) {
    fyRules = await fengyeLoader(auth, port);
    await Proxies_Cache.put(key, JSON.stringify(fyRules));
  }

  const nameRender = (proxy) => {
    let name = proxy.config.host.split(".")[0];
    return `FY-${proxy.type}-${name}`;
  };

  return render(type, nameRender, fyRules);
}
