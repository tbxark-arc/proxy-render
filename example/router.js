import { Router } from "itty-router";
import { freeLoader } from "./loader.js";
import { render, defaultNameRender } from "@tbxark/proxy-render/render.js";
import { surgeFile, clashFile } from "@tbxark/proxy-render/template.js";
import { fetchGsouProxies, fetchFyProxies, customAirport } from "./rule";

export const router = Router();

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
  const text = type === "clash"
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

