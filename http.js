import { isValidHostname } from "./hostname.js";

export async function surgeRawConfigToProxies(url) {
  let resp = await fetch(url);
  let text = await resp.text();
  return text
    .split("\n")
    .filter((l) => l.indexOf("SSEncrypt.module") > 0)
    .map((l) => {
      let [name, host, port, cipher, password, ss, obfs, obfs_host] = l
        .split(",")
        .map((l) => l.trim());
      if (!isValidHostname(host)) {
        return null;
      }
      name = name.split("-")[1];
      obfs = obfs.split("=")[1];
      obfs_host = obfs_host.split("=")[1];
      return {
        type: "ss",
        config: {
          name,
          host,
          port,
          cipher,
          password,
          obfs,
          obfs_host,
        },
      };
    })
    .filter((l) => l != null);
}

export async function ssrBase64ToProxies(url) {
  let resp = await fetch(url);
  let text = await resp.text();
  return atob(text)
    .split("\n")
    .map((l) =>
      atob(l.replace("ssr://", "").replace(/_/g, "/").replace(/-/g, "+")).split(":")
    )
    .filter((l) => l.length == 6)
    .map((l) => {
      let [host, port, auth, cipher, obfs, cmp] = l;
      if (!isValidHostname(host)) {
        return null;
      }
      let [password, obfs_config] = cmp.split("/?");
      obfs_config = obfs_config.split("&").reduce((sum, elt) => {
        let [key, value] = elt.split("=");
        return {
          ...sum,
          [key.replace("-", "")]: atob(
            value.replace(/_/g, "/").replace(/-/g, "+")
          ),
        };
      }, {});
      return {
        type: "ssr",
        config: {
          host,
          port,
          auth,
          cipher,
          obfs,
          password,
          ...obfs_config,
        },
      };
    })
    .filter((l) => l != null);
}

export async function trojanBase64ToProxies(url) {
  let resp = await fetch(trojan);
  let text = await resp.text();
  return atob(text)
    .replace(/ /g, "")
    .split("\n")
    .map((l) => l.replace("trojan://", "").split(/[@:?]/))
    .filter((l) => l.length == 4)
    .map((l) => {
      let [password, host, port, config] = l;
      if (!isValidHostname(host)) {
        return null;
      }
      config = config.split("&").reduce((sum, elt) => {
        let [key, value] = elt.split("=");
        return {
          ...sum,
          [key]: value,
        };
      }, {});
      return {
        type: "trojan",
        config: {
          password,
          host,
          port,
          ...config,
        },
      };
    })
    .filter((l) => l != null);
}

export async function vmessBase64ToProxies(url) {
  let resp = await fetch(url);
  let text = await resp.text();
  return atob(text)
    .split("\n")
    .map((l) => {
      try {
        return JSON.parse(atob(l.replace("vmess://", "")));
      } catch {
        return null;
      }
    })
    .filter((l) => l != null && l.add && isValidHostname(l.add))
    .map((l) => {
      return {
        type: "vmess",
        config: {
          ...l,
          host: l.add,
        },
      };
    });
}
