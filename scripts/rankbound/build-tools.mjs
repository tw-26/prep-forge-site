// Generates the Rankbound tool pages (rankbound/workout-generator/, rankbound/workouts/*, rankbound/guides/*,
// rankbound/push-up-calculator/). Run with: npm run build:rankbound
// Deterministic: no dates or randomness beyond the seeded engine, so a second run produces no diff.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "./pages.mjs";
import { renderPage } from "./templates.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** @returns {Array<{path: string, file: string, html: string}>} */
export function buildRankboundPages() {
  return PAGES.map((page) => ({
    path: page.path,
    file: `${page.path.replace(/^\//, "")}index.html`,
    html: renderPage(page)
  }));
}

/** @param {string} [outDir] */
export function writeRankboundPages(outDir = root) {
  const pages = buildRankboundPages();
  for (const page of pages) {
    const filePath = join(outDir, page.file);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, page.html);
  }
  return pages;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pages = writeRankboundPages();
  console.log(`Wrote ${pages.length} Rankbound tool pages.`);
}
