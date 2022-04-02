import 'zx/globals';
import {freeLoader} from './example/core/loader.js';
import {render, defaultNameRender} from './lib/render.js';

const proxies = await freeLoader();
const clash = render('clash', defaultNameRender, proxies);
console.log(clash);
