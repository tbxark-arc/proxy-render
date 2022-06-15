import {isValidHostname} from './hostname.js';

export async function surgeRawConfigToProxies(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  return text
      .split('\n')
      .filter((l) => l.indexOf('SSEncrypt.module') > 0)
      .map((l) => {
        let [name, host, port, cipher, password, , obfs, obfsHost] = l
            .split(',')
            .map((l) => l.trim());
        if (!isValidHostname(host)) {
          return null;
        }
        name = name.split('-')[1];
        obfs = obfs.split('=')[1];
        obfsHost = obfsHost.split('=')[1];
        return {
          type: 'ss',
          config: {
            name,
            host,
            port,
            cipher,
            password,
            obfs,
            obfsHost,
          },
        };
      })
      .filter((l) => l != null);
}

export async function ssrBase64ToProxies(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  return atob(text)
      .split('\n')
      .map((l) =>
        atob(l.replace('ssr://', '').replace(/_/g, '/').replace(/-/g, '+')).split(':'),
      )
      .filter((l) => l.length == 6)
      .map((l) => {
        const [host, port, auth, cipher, obfs, cmp] = l;
        if (!isValidHostname(host)) {
          return null;
        }
        let [password, obfsConfig] = cmp.split('/?');
        obfsConfig = obfsConfig.split('&').reduce((sum, elt) => {
          const [key, value] = elt.split('=');
          return {
            ...sum,
            [key.replace('-', '')]: atob(
                value.replace(/_/g, '/').replace(/-/g, '+'),
            ),
          };
        }, {});
        return {
          type: 'ssr',
          config: {
            host,
            port,
            auth,
            cipher,
            obfs,
            password,
            ...obfsConfig,
          },
        };
      })
      .filter((l) => l != null);
}

export async function trojanBase64ToProxies(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  return atob(text)
      .replace(/ /g, '')
      .split('\n')
      .map((l) => l.replace('trojan://', '').split(/[@:?]/))
      .filter((l) => l.length == 4)
      .map((l) => {
        let [password, host, port, config] = l;
        if (!isValidHostname(host)) {
          return null;
        }
        config = config.split('&').reduce((sum, elt) => {
          const [key, value] = elt.split('=');
          return {
            ...sum,
            [key]: value,
          };
        }, {});
        return {
          type: 'trojan',
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
  const resp = await fetch(url);
  const text = await resp.text();
  const regx = new RegExp('\w{8}-\w{4}-\w{4}-\w{4}-\w{12}');
  return atob(text)
      .split('\n')
      .map((l) => {
        try {
          return JSON.parse(atob(l.replace('vmess://', '')));
        } catch {
          return null;
        }
      })
      .filter((l) => {
        return l != null && l.add && isValidHostname(l.add) && regx.test(l.id);
      })
      .map((l) => {
        return {
          type: 'vmess',
          config: {
            ...l,
            host: l.add,
          },
        };
      });
}


export async function fetchProxies(type, url) {
  switch (type) {
    case 'surge-ss': {
      return await surgeRawConfigToProxies(url);
    }
    case 'ssr': {
      return await ssrBase64ToProxies(url);
    }
    case 'trojan': {
      return await trojanBase64ToProxies(url);
    }
    case 'vmess': {
      return await vmessBase64ToProxies(url);
    }
    default: {
      return [];
    }
  }
}
