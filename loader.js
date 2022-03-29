import { surgeRawConfigToProxies, ssrBase64ToProxies, trojanBase64ToProxies, vmessBase64ToProxies } from './http.js';


export async function freeLoader() {
    let vmess = 'https://raw.githubusercontent.com/freefq/free/master/v2'
    return await vmessBase64ToProxies(vmess)
}

export async function fengyeLoader(authcode, port) {
    let ss    = `https://cdnapi.fyapi.net/index.php?m=fyzhujicloudpane&command=FYAUTHAPISurge&port=${port}&type=ss&authcode=${authcode}`
    let ssr    = `https://cdnapi.fyapi.net/index.php?m=fyzhujicloudpane&command=FYAUTHAPIComSub&port=${port}&authcode=${authcode}`
    let trojan = `https://cdnapi.fyapi.net/index.php?m=fyzhujicloudpane&command=FYAUTHAPIComSub&port=${port}&type=trojan&authcode=${authcode}`

    ss = await surgeRawConfigToProxies(ss)
    ssr = await ssrBase64ToProxies(ssr)
    trojan = await trojanBase64ToProxies(trojan)

    let res = ss
    res = res.concat(ssr)
    res = res.concat(trojan)
    return res
}

export async function gsouLoader(authcode) {
    let ssr = `https://sub.gsou.world/link/${authcode}?sub=1&extend=1`
    let vmess = `https:sub.gsou.world/link/${authcode}?sub=3&extend=1`

    ssr = await ssrBase64ToProxies(ssr)
    vmess = await vmessBase64ToProxies(vmess)

    let res = ssr
    res = res.concat(vmess)
    return res
}