// Renders the share image and the printable PDFs with headless Chrome.
// Run after build-site.mjs: node scripts/render-assets.mjs [path-to-chrome]
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const chromeCandidates = [
  process.argv[2],
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome"
].filter(Boolean);
const chrome = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chrome) {
  console.error("Chrome or Edge not found. Pass its path as the first argument.");
  process.exit(1);
}

const types = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let file = join(root, normalize(pathname).replace(/^([/\\])+/, ""));

  try {
    if ((await stat(file)).isDirectory()) {
      file = join(file, "index.html");
    }

    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end();
  }
});

await new Promise((done) => server.listen(0, done));
const base = `http://localhost:${server.address().port}`;
// Async on purpose: a sync call would block this process's own server while Chrome loads pages.
const run = (args) =>
  new Promise((done, fail) =>
    execFile(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", ...args], (error) =>
      error ? fail(error) : done()
    )
  );

await run([
  "--window-size=1200,630",
  "--virtual-time-budget=3000",
  `--screenshot=${join(root, "assets/og/citizen-ready.png")}`,
  `${base}/scripts/assets/og-citizen-ready.html`
]);
console.log("Rendered assets/og/citizen-ready.png");

await run([
  "--window-size=1200,630",
  "--virtual-time-budget=3000",
  `--screenshot=${join(root, "assets/og/rankbound.png")}`,
  `${base}/scripts/assets/og-rankbound.html`
]);
console.log("Rendered assets/og/rankbound.png");

const pdfs = [
  { page: "/uscis/civics-questions/", out: "uscis/128-civics-questions-and-answers.pdf" },
  { page: "/uscis/es/preguntas-de-ciudadania/", out: "uscis/128-preguntas-de-la-ciudadania.pdf" }
];

for (const pdf of pdfs) {
  await run(["--no-pdf-header-footer", "--virtual-time-budget=3000", `--print-to-pdf=${join(root, pdf.out)}`, `${base}${pdf.page}`]);
  console.log(`Rendered ${pdf.out}`);
}

server.close();
