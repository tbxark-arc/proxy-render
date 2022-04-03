import {freeLoader} from 'proxy-server-core/loader.js';
import {render, defaultNameRender} from '@tbxark/proxy-render/lib/render.js';
import fetch from 'node-fetch';

global.fetch = fetch

const proxies = await freeLoader();
const clash = render('clash', defaultNameRender, proxies);
console.log(clash);
