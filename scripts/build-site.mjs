// Generates the Citizen Ready (USCIS) pages and sitemap.xml from data/.
// Usage: node scripts/build-site.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "./site/html.mjs";
import { buildUscisPages, prepareModel } from "./site/uscis-pages.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const buildDate = new Date().toISOString().slice(0, 10);

// Directories owned entirely by the generator. Hand-written pages (terms, privacy) live outside them.
const generatedDirs = [
  "uscis/practice-test",
  "uscis/civics-questions",
  "uscis/questions",
  "uscis/citizenship-test-guide",
  "uscis/es"
];

for (const dir of generatedDirs) {
  rmSync(join(root, dir), { force: true, recursive: true });
}

const model = prepareModel(
  readJson("data/uscis-questions.json"),
  readJson("data/uscis-jurisdictions.json"),
  buildDate
);
const pages = buildUscisPages(model);

for (const page of pages) {
  const filePath = join(root, page.path, "index.html");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, page.html);
}

console.log(`Wrote ${pages.length} USCIS pages.`);

// Hand-written pages keep their own lastmod from git history.
const staticPages = [
  { path: "/", file: "index.html", priority: "1.0" },
  { path: "/sierra-math/index.html", file: "sierra-math/index.html", priority: "0.9" },
  { path: "/sierra-math/terms.html", file: "sierra-math/terms.html", priority: "0.3" },
  { path: "/sierra-math/privacy.html", file: "sierra-math/privacy.html", priority: "0.3" },
  { path: "/uscis/terms.html", file: "uscis/terms.html", priority: "0.3" },
  { path: "/uscis/privacy.html", file: "uscis/privacy.html", priority: "0.3" },
  { path: "/support.html", file: "support.html", priority: "0.3" }
];

function gitLastModified(file) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: root })
      .toString()
      .trim();
    return date || buildDate;
  } catch {
    return buildDate;
  }
}

function priorityFor(path) {
  if (/^\/uscis\/(es\/)?$/.test(path)) return "0.9";
  if (/practice-test|examen-de-ciudadania|civics-questions\/$|preguntas-de-ciudadania\/$/.test(path)) return "0.9";
  if (/guide|guia/.test(path)) return "0.8";
  if (/civics-questions\/|preguntas-de-ciudadania\//.test(path)) return "0.7";
  return "0.6";
}

const urls = [
  ...staticPages.map((page) => ({ loc: page.path, lastmod: gitLastModified(page.file), priority: page.priority })),
  ...pages.map((page) => ({ loc: page.path, lastmod: buildDate, priority: priorityFor(page.path) }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "sitemap.xml"), sitemap);
console.log(`Wrote sitemap.xml with ${urls.length} URLs.`);
