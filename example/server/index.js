import http from 'http';
import {argv} from 'process';
import fetch, {Request, Response} from 'node-fetch';
import {MemoryCache} from '@tbxark/proxy-render/lib/cache.js';
import {createRouter} from '../core/router.js';

global.fetch = fetch;
global.Request = Request;
global.Response = Response;

function getPort(argv) {
  if (argv.indexOf('--port') !== -1) {
    return parseInt(argv[argv.indexOf('--port') + 1], 10);
  }
  return null;
}

function convertIncomeToNodeFecthRequest(income, host) {
  const {url, method, headers, body} = income;
  return new Request(`${host}${url}`, {method, headers, body});
}

async function mergeNodeFecthResponseIntoOutcome(nodeFecthResponse, outcome) {
  const {status, headers} = nodeFecthResponse;
  outcome.writeHead(status, headers);
  const res = await nodeFecthResponse.text();
  outcome.end(res);
}

const port = getPort(argv) || 8080;
const host = `http://localhost`;
const router = createRouter(new MemoryCache());
http.createServer((req, res) => {
  router.handle(convertIncomeToNodeFecthRequest(req, host))
      .then((response) => {
        mergeNodeFecthResponseIntoOutcome(response, res);
      });
}).listen(port);
console.log(`Server running at ${host}:${port}/`);
