// Serves the site locally the way GitHub Pages does: node scripts/serve.mjs [port]
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] ?? process.env.PORT ?? 8080);
const types = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".xml": "application/xml"
};

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let file = join(root, normalize(pathname).replace(/^([/\\])+/, ""));

  try {
    if ((await stat(file)).isDirectory()) {
      // Like GitHub Pages, send /uscis/questions to /uscis/questions/ so relative links resolve.
      if (!pathname.endsWith("/")) {
        response.writeHead(301, { location: `${pathname}/` });
        response.end();
        return;
      }
      file = join(file, "index.html");
    }

    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { "content-type": "text/plain" });
    response.end("Not found");
  }
}).listen(port, () => {
  console.log(`Serving ${root}`);
  console.log(`Open http://localhost:${port}/uscis/`);
});
