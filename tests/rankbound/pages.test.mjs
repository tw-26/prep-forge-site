import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, PAGES_BY_SLUG, RANKBOUND_APP_ID } from "../../scripts/rankbound/pages.mjs";
import { buildRankboundPages } from "../../scripts/rankbound/build-tools.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://elevixapps.com";
const built = buildRankboundPages();
const read = (file) => readFileSync(join(root, file), "utf8");
const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
const meta = (html, attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];
const jsonLdBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
const unescape = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

test("route inventory: 7 unique, well-formed pages", () => {
  assert.equal(PAGES.length, 7);
  assert.equal(built.length, 7);
  for (const key of ["slug", "path", "campaign", "title", "description", "h1"]) {
    assert.equal(new Set(PAGES.map((page) => page[key])).size, PAGES.length, `${key} must be unique`);
  }
  for (const page of PAGES) {
    assert.match(page.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.match(page.path, /^\/rankbound\/(workouts\/|guides\/)?[a-z0-9-]+\/$/);
    assert.match(page.campaign, /^[a-z0-9]+$/);
  }
});

test("invalid slugs and stray routes do not exist", () => {
  assert.equal(PAGES_BY_SLUG.get("nope"), undefined);
  assert.equal(PAGES_BY_SLUG.get("../etc/passwd"), undefined);
  for (const page of PAGES) {
    for (const slug of page.related) assert.ok(PAGES_BY_SLUG.has(slug), `${page.slug} links to unknown ${slug}`);
  }
  // No thin index pages for the folders: every URL in them must be a real, useful page.
  for (const folder of ["rankbound/workouts", "rankbound/guides"]) {
    assert.equal(existsSync(join(root, folder, "index.html")), false, `${folder}/ must not have an index page`);
  }
  assert.match(read("404.html"), /<meta name="robots" content="noindex/);
});

test("committed pages are up to date with the generator (run npm run build:rankbound)", () => {
  for (const page of built) {
    assert.ok(existsSync(join(root, page.file)), `${page.file} is missing`);
    assert.equal(read(page.file).replace(/\r\n/g, "\n"), page.html, `${page.file} is stale`);
  }
  assert.equal(buildRankboundPages()[0].html, built[0].html, "build is deterministic");
});

test("metadata: title, description, canonical, robots, Open Graph", () => {
  for (const { path, html } of built) {
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    const description = meta(html, "name", "description");
    assert.ok(title && title.length >= 25 && title.length <= 65, `${path} title length ${title?.length}`);
    assert.ok(description && description.length >= 100 && description.length <= 160, `${path} description length ${description?.length}`);
    assert.match(title, /Rankbound/);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical, `${SITE}${path}`);
    assert.doesNotMatch(canonical, /[?#]/);
    assert.match(meta(html, "name", "robots"), /^index, follow/);
    assert.equal(meta(html, "property", "og:url"), `${SITE}${path}`);
    assert.equal(meta(html, "property", "og:title"), title);
    assert.equal(meta(html, "property", "og:image"), `${SITE}/assets/og/rankbound-tools.png`);
    assert.equal(meta(html, "name", "twitter:card"), "summary_large_image");
    assert.equal(meta(html, "name", "apple-itunes-app"), `app-id=${RANKBOUND_APP_ID}`);
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${path} needs exactly one h1`);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<a class="rb-skip" href="#main">/);
  }
  assert.ok(existsSync(join(root, "assets/og/rankbound-tools.png")));
});

test("headings are logically ordered", () => {
  for (const { path, html } of built) {
    const levels = [...html.matchAll(/<h([1-6])[ >]/g)].map((match) => Number(match[1]));
    assert.equal(levels[0], 1, path);
    for (let i = 1; i < levels.length; i += 1) {
      assert.ok(levels[i] - levels[i - 1] <= 1, `${path}: heading jump ${levels[i - 1]} -> ${levels[i]}`);
    }
  }
});

test("structured data is valid and FAQ JSON-LD matches the visible FAQ", () => {
  for (const { path, html } of built) {
    const blocks = jsonLdBlocks(html);
    assert.deepEqual(blocks.map((block) => block["@type"]).sort(), ["BreadcrumbList", "FAQPage", "WebApplication"], path);
    const faq = blocks.find((block) => block["@type"] === "FAQPage");
    const visible = [...html.matchAll(/<summary>([^<]*)<\/summary>\s*<p>([^<]*)<\/p>/g)].map((match) => [match[1], match[2]]);
    assert.equal(visible.length, faq.mainEntity.length);
    faq.mainEntity.forEach((entity, index) => {
      assert.equal(entity.name, unescape(visible[index][0]));
      assert.equal(entity.acceptedAnswer.text, unescape(visible[index][1]));
    });
    const crumbs = blocks.find((block) => block["@type"] === "BreadcrumbList").itemListElement;
    assert.equal(crumbs[crumbs.length - 1].item, `${SITE}${path}`);
    const app = blocks.find((block) => block["@type"] === "WebApplication");
    assert.equal(app.offers.price, "0");
    assert.equal(app.url, `${SITE}${path}`);
  }
});

test("sitemap and staticPages include every page exactly once, with no query strings", () => {
  const sitemap = read("sitemap.xml");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(locs).size, locs.length, "no duplicate sitemap URLs");
  assert.ok(locs.every((loc) => !/[?#]/.test(loc)));
  const buildScript = read("scripts/build-site.mjs");
  for (const page of PAGES) {
    assert.equal(locs.filter((loc) => loc === `${SITE}${page.path}`).length, 1, `sitemap entry for ${page.path}`);
    assert.ok(buildScript.includes(`path: "${page.path}", file: "${page.path.slice(1)}index.html"`), `staticPages entry for ${page.path}`);
  }
  assert.ok(locs.includes(`${SITE}/rankbound/`));
  assert.ok(!locs.some((loc) => loc.endsWith("/404.html")));
  assert.match(read("robots.txt"), /Sitemap: https:\/\/elevixapps\.com\/sitemap\.xml/);
  assert.doesNotMatch(read("robots.txt"), /Disallow:\s*\/rankbound/);
});

test("internal links resolve and no page is orphaned", () => {
  const files = [...built.map((page) => ({ path: page.path, html: page.html })), { path: "/rankbound/", html: read("rankbound/index.html") }];
  const inbound = new Map(PAGES.map((page) => [page.path, new Set()]));
  for (const { path, html } of files) {
    for (const [, href] of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const clean = href.split(/[?#]/)[0];
      const absolute = clean.startsWith("/") ? clean : new URL(clean, `${SITE}${path}`).pathname;
      const target = absolute.endsWith("/") ? `${absolute}index.html` : absolute;
      assert.ok(existsSync(join(root, target)), `${path} links to missing ${href}`);
      if (inbound.has(absolute) && absolute !== path) inbound.get(absolute).add(path);
    }
    for (const [, src] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
      assert.ok(existsSync(join(root, src)), `${path} references missing ${src}`);
    }
  }
  for (const page of PAGES) {
    const sources = inbound.get(page.path);
    assert.ok(sources.has("/rankbound/"), `${page.path} must be linked from the Rankbound landing page`);
    assert.ok([...sources].some((source) => source !== "/rankbound/"), `${page.path} must be linked from another tool page`);
  }
});

test("every page renders a useful result before JavaScript runs", () => {
  for (const { path, html } of built) {
    assert.match(html, /<div class="rb-result" aria-live="polite">/, path);
    assert.match(html, /class="(rb-quest|rb-result-summary)"/, `${path} lacks a static result`);
    assert.match(html, /<details class="rb-faq-item">/);
    assert.match(html, /<noscript>/);
    assert.ok(text(html).split(" ").length > 700, `${path} has too little on-page content`);
  }
  const challenge = built.find((page) => page.path.includes("30-day")).html;
  assert.equal((challenge.match(/<li class="rb-day/g) ?? []).length, 30);
});

test("forms are accessible: every control has a label and ids are unique", () => {
  for (const { path, html } of built) {
    for (const [, id] of html.matchAll(/<(?:select|input)[^>]* id="([^"]+)"/g)) {
      assert.match(html, new RegExp(`<label for="${id}"`), `${path}: ${id} has no label`);
    }
    assert.doesNotMatch(html, /<img(?![^>]*\balt=)[^>]*>/, `${path} has an img without alt`);
    for (const [, id] of html.matchAll(/ id="([^"]+)"/g)) {
      assert.equal(html.split(` id="${id}"`).length - 1, 1, `${path}: duplicate id ${id}`);
    }
  }
});

test("App Store CTAs: three per page, real listing, tracked campaign", () => {
  for (const page of PAGES) {
    const html = built.find((entry) => entry.path === page.path).html;
    const links = [...html.matchAll(/<a class="[^"]*" href="(https:\/\/apps\.apple\.com[^"]+)" data-cta="([^"]+)"/g)];
    assert.deepEqual(
      links.map((link) => link[2]),
      ["header", "result", "final"].map((placement) => `rankbound-${page.campaign}-${placement}`)
    );
    for (const [, href, cta] of links) {
      const url = new URL(href.replace(/&amp;/g, "&"));
      assert.equal(url.pathname, `/app/apple-store/id${RANKBOUND_APP_ID}`);
      assert.equal(url.searchParams.get("pt"), "129018838");
      assert.equal(url.searchParams.get("ct"), cta);
    }
    assert.equal((html.match(/apps\.apple\.com/g) ?? []).length, 3, "no stray App Store links");
    assert.match(html, /Download Free on the App Store/);
    assert.match(html, /No account\. No subscription required\. Just train and level up\./);
  }
  const campaigns = built.flatMap((entry) => [...entry.html.matchAll(/data-cta="([^"]+)"/g)].map((match) => match[1]));
  assert.equal(new Set(campaigns).size, campaigns.length, "campaign names are unique per page and placement");
});

test("every external link opens in a new tab, safely", () => {
  for (const { path, html } of built) {
    const external = [...html.matchAll(/<a [^>]*href="https?:\/\/[^"]+"[^>]*>/g)].map((match) => match[0]);
    assert.ok(external.length >= 5, `${path} should have sources and CTAs`);
    for (const tag of external) {
      assert.match(tag, /target="_blank"/, `${path}: ${tag}`);
      assert.match(tag, /rel="noopener noreferrer"/, `${path}: ${tag}`);
    }
  }
});

test("copy rules: no sync claims, no outcome claims, franchise names only on the editorial page", () => {
  for (const { path, html } of built) {
    const body = text(html);
    assert.doesNotMatch(body, /solo leveling/i, path);
    assert.doesNotMatch(body, /\bsync(s|ed|ing)?\b/i, `${path} mentions syncing`);
    assert.doesNotMatch(body, /(?<!not )\bimports?\b/i, `${path} implies an import feature`);
    assert.doesNotMatch(body, /\b(build muscle|lose weight|burn fat|get ripped|six[- ]pack|guaranteed|transform your body|clinically|proven to)\b/i, `${path} makes outcome claims`);
    assert.doesNotMatch(body, /\b(through the pain|no pain,? no gain)\b/i);
    assert.match(body, /not medical advice/i, `${path} lacks the disclaimer`);
    assert.match(body, /does not import/i, `${path} must say the workout is not imported into the app`);
    if (!path.includes("one-punch-man")) {
      assert.doesNotMatch(body, /one[- ]punch|saitama|goku|naruto|dragon ball|attack on titan/i, `${path} names a franchise`);
    }
  }
  const opm = built.find((page) => page.path.includes("one-punch-man")).html;
  assert.match(text(opm), /not affiliated with, sponsored by or endorsed by/);
  // The landing page keeps its own copy rules.
  assert.doesNotMatch(text(read("rankbound/index.html")), /solo leveling|one punch|saitama/i);
});

test("analytics and scripts: cookieless tracker, module UI, no third-party scripts", () => {
  for (const { path, html } of built) {
    const scripts = [...html.matchAll(/<script[^>]* src="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(scripts, ["/assets/js/analytics.js", "/assets/rankbound/nav.js", "/assets/rankbound/tools/ui.js"], path);
    assert.match(html, /<script type="module" src="\/assets\/rankbound\/tools\/ui.js">/);
    assert.match(html, /<script type="application\/json" id="rb-tool-config">\{"tool":"[a-z]+","page":"[a-z0-9]+"\}<\/script>/);
  }
  const ui = read("assets/rankbound/tools/ui.js");
  for (const event of ["rb_tool_started", "rb_tool_generated", "rb_tool_rerolled", "rb_tool_copied", "rb_tool_shared", "rb_tool_printed"]) {
    assert.ok(ui.includes(event), event);
  }
  assert.doesNotMatch(ui, /localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest/, "tool UI must not store or send user data");
});

test("landing page and privacy policy mention the tools and website analytics", () => {
  const landing = read("rankbound/index.html");
  assert.match(landing, /rb-tools-link/);
  // "Free Tools" is in the header of the landing page and of every tool page, not only the footer.
  assert.match(landing, /<header class="rb-header">[^]*data-rb-menu[^]*Free Tools[^]*<[/]header>/);
  for (const { path, html } of built) {
    const header = html.match(/<header class="rb-header">[^]*?<[/]header>/)[0];
    assert.match(header, /<button class="rb-header-link rb-menu-toggle" type="button" aria-expanded="false" aria-controls="rb-tools-menu">Free Tools/, path);
    for (const p of PAGES) assert.ok(header.includes(`href="${p.path}"`), `${path}: menu links to ${p.path}`);
    assert.equal((header.match(/aria-current="page"/g) ?? []).length, 1, path + ": exactly one current item");
    assert.doesNotMatch(header, /one punch|saitama|solo leveling/i, path);
  }
  assert.match(read("rankbound/privacy.html"), /cookieless analytics/i);
  // Existing landing-page SEO is preserved.
  assert.match(landing, /<link rel="canonical" href="https:\/\/elevixapps\.com\/rankbound\/">/);
  assert.equal((landing.match(/data-cta="rankbound-/g) ?? []).length, 3);
});
