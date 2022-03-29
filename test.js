import 'zx/globals'
import { vmessBase64ToProxies } from './http.js';
import { render, defaultNameRender } from './render.js';

let proxies = await vmessBase64ToProxies('https://raw.githubusercontent.com/freefq/free/master/v2')
const clash = render('clash', defaultNameRender, proxies)
console.log(clash)