import { Router } from "itty-router";
import { fengyeLoader, gsouLoader, freeLoader } from "./loader.js";
import { render, defaultNameRender } from "@tbxark/proxy-render/render.js";
import { surgeFile, clashFile } from "@tbxark/proxy-render/template.js";
import { fetchProxies } from "@tbxark/proxy-render/http.js";

const router = Router();

router.get("/rule/:type", async ({ params, query }) => {
  const { type } = params;
  const { fy, gsou, free, custom, ignoreCache } = query;
  let rules = [];

  if (gsou) {
    rules.push(await fetchGsouProxies(gsou, ignoreCache, type));
  }
  if (fy) {
    rules.push(await fetchFyProxies(fy, ignoreCache, type));
  }
  if (custom) {
    rules.push(await customAirport(type, custom));
  }
  if (free) {
    rules.push(render(type, defaultNameRender, await freeLoader()));
  }

  if (type === "clash") {
    return new Response(
      "proxies:\n\n" +
        rules.map((r) => r.replace("proxies:\n\n", "")).join("\n")
    );
  } else {
    return new Response(rules.join("\n"));
  }
});

router.get("/config/:type", async ({ params, query }) => {
  const { type } = params;
  const policy_path = `https://${DOMAIN}/rule/${type}?${Object.entries(query)
    .map(([k, v]) => `${k}=${v}`)
    .join("&")}`;
  const git_domain = `https://${DOMAIN}/git`;
  const text =
    type === "clash"
      ? clashFile(policy_path, git_domain)
      : surgeFile(policy_path, git_domain);
  return new Response(text);
});

router.get("/git/*", async (req) => {
  let url = new URL(req.url);
  url = `https://raw.githubusercontent.com${url.pathname.replace("/git", "")}`;
  return await fetch(url);
});

router.all("/clear", async ({ query }) => {
  const { fy, gsou } = query;

  if (fy) {
    const [auth, port] = fy.split("-");
    const key = `proxies-fy-${auth}-${port}`;
    await Proxies_Cache.delete(key);
  }

  if (gsou) {
    const key = `proxies-gsou-${gsou}`;
    await Proxies_Cache.delete(key);
  }

  return new Response("Success.");
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

addEventListener("fetch", (event) =>
  event.respondWith(router.handle(event.request).catch(errorHandler))
);

addEventListener("scheduled", (event) => {
  event.waitUntil(async (e) => {
    // Update your proxies cache
    await fetch(Update_Cache_Url);
  });
});

function errorHandler(error) {
  return new Response(error.message || "Server Error", {
    status: error.status || 500,
  });
}

async function customAirport(type, custom) {
  const [proxy, url] = JSON.parse(custom);
  const rules = await fetchProxies(proxy, url);
  return render(type, defaultNameRender, rules);
}

async function fetchGsouProxies(gsou, ignoreCache, type) {
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
      let name = proxy.config.host.split(".");
      name.pop();
      name.pop();
      name = name.reverse().join("-");
      return `GS-${proxy.type}-${name}-${proxy.config.port}`;
    }
  };
  return render(type, nameRender, gsouRules);
}

async function fetchFyProxies(fy, ignoreCache, type) {
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
