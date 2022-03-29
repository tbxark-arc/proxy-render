import 'zx/globals'
import { freeLoader } from './example/loader.js';
import { render, defaultNameRender } from './render.js';

let proxies = await freeLoader()
const clash = render('clash', defaultNameRender, proxies)
console.log(clash)