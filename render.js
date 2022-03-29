const surge = (nameRender) => {
  return {
    ss: (proxy) => {
      const config = proxy.config;
      return `${nameRender(proxy)} = ss, ${config.host}, ${config.port}, encrypt-method=${config.cipher}, password=${config.password}, obfs=${config.obfs}, obfs-host=${config.obfs_host}, udp-relay=true, tfo=true`;
    },
    ssr: (proxy) => {
      return null;
    },
    trojan: (proxy) => {
      const config = proxy.config;
      return `${nameRender(proxy)} = trojan, ${config.host}, ${config.port}, password=${config.password}, sni=${config.sni}`;
    },
    vmess: (proxy) => {
      const config = proxy.config;
      return `${nameRender(proxy)} = vmess, ${config.add}, ${config.port}, username=${config.id}, tfo=true`;
    },
  };
};

const clash = (nameRender) => {
  return {
    ss: (proxy) => {
      const config = proxy.config;
      return `
    - name: "${nameRender(proxy)}"
      type: ss
      server: ${config.host}
      port: ${config.port}
      udp: true
      cipher: ${config.cipher}
      password: "${config.password}"
      plugin: obfs
      plugin-opts:
      mode: ${config.obfs}
      host: ${config.obfs_host}
      `;
    },
    ssr: (proxy) => {
      const config = proxy.config;
      return `
    - name: "${nameRender(proxy)}"
      type: ssr
      server: ${config.host}
      port: ${config.port}
      udp: true
      cipher: ${config.cipher}
      password: "${config.password}"
      obfs: plain
      protocol: ${config.auth}
      obfs-param: ${config.obfsparam}
      protocol-param: ${config.protoparam}
      `;
    },
    trojan: (proxy) => {
      const config = proxy.config;
      return `
    - name: "${nameRender(proxy)}"
      type: trojan
      server: ${config.host}
      port: ${config.port}
      password: "${config.password}"
      sni: ${config.sni}
      `;
    },
    vmess: (proxy) => {
      const config = proxy.config;
      return `
    - name: "${nameRender(proxy)}"
      type: vmess
      server: ${config.add}
      port: ${config.port}
      uuid: ${config.id}
      alterId: ${config.aid}
      cipher: auto
      `;
    },
  };
};

export const render = (file, nameRender, proxies) => {
  let r = file === "clash" ? clash : surge;
  r = r(nameRender);
  const raw = proxies
    .map((c) => {
      switch (c.type) {
        case "ss": {
          return r.ss(c);
        }
        case "ssr": {
          return r.ssr(c);
        }
        case "trojan": {
          return r.trojan(c);
        }
        case "vmess": {
          return r.vmess(c);
        }
        default: {
          return null;
        }
      }
    })
    .filter((c) => c != null)
    .join("\n");

  if (file === 'clash') {
      return 'proxies:\n\n' + raw
  }
  return raw
};

export const defaultNameRender = (proxy) => {
    let name = proxy.config.host.split('.')
    name.pop();
    name = name.reverse()
    return `${proxy.type.toUpperCase()}-${name.join('-')}`
}
