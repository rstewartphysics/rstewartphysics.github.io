// A static server on the repo root for the build-guide scripts (tools/ is not built by Jekyll).
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";
export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
export function serve() {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    const file = join(REPO, path);
    if (!file.startsWith(REPO) || !existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  }).listen(0);
  const demo = `http://127.0.0.1:${server.address().port}/tools/build-guides/preview/guide-demo.html`;
  return { demo, close: () => server.close() };
}
export const launchOpts = () => (process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
