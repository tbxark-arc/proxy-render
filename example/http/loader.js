import {
  surgeRawConfigToProxies,
  ssrBase64ToProxies,
  trojanBase64ToProxies,
  vmessBase64ToProxies,
} from '../../http.js';

export async function freeLoader() {
  let res = [];

  try {
    let vmess = 'https://raw.githubusercontent.com/freefq/free/master/v2';
    vmess = await vmessBase64ToProxies(vmess);
    res = res.concat(vmess);
  } catch (error) {
    console.error(error);
  }
  return res;
}

export async function fengyeLoader(authcode, port) {
  let res = [];

  try {
    let ss = `https://cdnapi.fyapi.net/index.php?m=fyzhujicloudpane&command=FYAUTHAPISurge&port=${port}&type=ss&authcode=${authcode}`;
    ss = await surgeRawConfigToProxies(ss);
    res = res.concat(ss);
  } catch (error) {
    console.error(error);
  }
  try {
    let ssr = `https://cdnapi.fyapi.net/index.php?m=fyzhujicloudpane&command=FYAUTHAPIComSub&port=${port}&authcode=${authcode}`;
    ssr = await ssrBase64ToProxies(ssr);
    res = res.concat(ssr);
  } catch (error) {
    console.error(error);
  }
  try {
    let trojan = `https://cdnapi.fyapi.net/index.php?m=fyzhujicloudpane&command=FYAUTHAPIComSub&port=${port}&type=trojan&authcode=${authcode}`;
    trojan = await trojanBase64ToProxies(trojan);
    res = res.concat(trojan);
  } catch (error) {
    console.error(error);
  }
  return res;
}

export async function gsouLoader(authcode) {
  let res = [];

  try {
    let ssr = `https://sub.gsou.world/link/${authcode}?sub=1&extend=1`;
    ssr = await ssrBase64ToProxies(ssr);
    res = res.concat(ssr.filter((c) => c.config.obfsparam));
    res.forEach((c) => {
      c.config.obfs = 'tls1.2_ticket_auth';
    });
  } catch (error) {
    console.error(error);
  }
  try {
    let vmess = `https://sub.gsou.world/link/${authcode}?sub=3&extend=1`;
    vmess = await vmessBase64ToProxies(vmess);
    res = res.concat(vmess.filter((c) => c.config.class));
  } catch (error) {
    console.error(error);
  }

  return res;
}
