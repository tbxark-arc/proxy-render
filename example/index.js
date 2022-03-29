import { Router } from "itty-router";
import { fengyeLoader, gsouLoader, freeLoader } from "@tbxark/proxy-render/loader.js";
import { render, defaultNameRender } from "@tbxark/proxy-render/render.js";
import { surgeFile, clashFile } from "@tbxark/proxy-render/template.js";
import { surgeRawConfigToProxies, ssrBase64ToProxies, trojanBase64ToProxies, vmessBase64ToProxies } from '@tbxark/proxy-render/http.js';

const router = Router();

const errorHandler = (error) => {
    return new Response(error.message || "Server Error", {
        status: error.status || 500,
    });
};


const customAirport = async (type, custom) => {
    let [proxy, url] = JSON.parse(custom);
    let rules = []
    switch (proxy) {
        case 'surge-ss': {
            rules = await surgeRawConfigToProxies(url)
            break
        }
        case 'ssr': {
            rules = await ssrBase64ToProxies(url)
            break
        }
        case 'trojan': {
            rules = await trojanBase64ToProxies(url)
            break
        }
        case 'vmess': {
            rules = await vmessBase64ToProxies(url)
            break
        }
        default: {
            break
        }
    }
    return render(type, defaultNameRender, rules)
}

router.get("/rule/:type", async ({ params, query }) => {
    const { type } = params;
    const { fy, gsou, free, custom, ignoreCache } = query;
    let rules = [];
    if (fy) {

        const [auth, port] = fy.split("-");
        const key = `proxies-fy-${auth}-${port}`;
        let fyRules = null
        if (!ignoreCache) {
            try {
                const raw = await Proxies_Cache.get(key);
                fyRules = JSON.parse(raw)
            } catch (e) {
                console.log(e)
            }
        }
        if (fyRules == null || !fyRules.length) {
            fyRules = await fengyeLoader(auth, port);
            await Proxies_Cache.put(key, JSON.stringify(fyRules))
        }

        const nameRender = (proxy) => {
            let name = proxy.config.host.split(".")[0];
            return `FY-${proxy.type}-${name}`;
        };

        rules = rules.concat(render(type, nameRender, fyRules));
    }

    if (gsou) {

        let gsouRules = [];
        const key = `proxies-gsou-${gsou}`;
        if (!ignoreCache) {
            try {
                const raw = await Proxies_Cache.get(key);
                gsouRules = JSON.parse(raw)
            } catch (e) {
                console.log(e)
            }
        }
        if (gsouRules == null || !gsouRules.length) {
            gsouRules = await await gsouLoader(gsou);
            await Proxies_Cache.put(key, JSON.stringify(gsouRules))
        }

        const nameRender = (proxy) => {
            let name = proxy.config.host.split(".");
            name.pop();
            name.pop();
            name = name.reverse();
            return `FY-${proxy.type}-${name.join("-")}-${proxy.config.port}`;
        };
        rules = rules.concat(render(type, nameRender, gsouRules));
    }

    if (custom) {
        const r = await customAirport(type, custom);
        rules = rules.concat(r)
    }   

    if (free) {
        const freeRules = await freeLoader();
        rules = rules.concat(render(type, defaultNameRender, freeRules));
    }

    return new Response(rules.join('\n'));
});

router.get("/config/:type", async ({ params, query }) => {
    const { type } = params;
    const policy_path = `https://${DOMAIN}/rule/${type}?${Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&")}`;
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

    return new Response("Success.")
});


router.all("*", () => new Response("Not Found.", { status: 404 }));


addEventListener("fetch", (event) =>
    event.respondWith(router.handle(event.request).catch(errorHandler))
);

addEventListener('scheduled', event => {
    event.waitUntil(async (e) => {
        // Update your proxies cache
        await fetch(Update_Cache_Url);
    })
})