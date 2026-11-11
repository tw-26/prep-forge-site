// HTML templates for the Rankbound tool pages. Reuses the site's JSON-LD and App Store helpers and the
// rb- styles in styles.css. Result markup comes from the same renderers the browser uses.
import { appStoreUrl, breadcrumbJsonLd, faqJsonLd, jsonLd, SITE_URL } from "../site/html.mjs";
import { esc, renderQuest, renderWeek, renderChallenge, renderPushUps, renderRoutine } from "../../assets/rankbound/tools/render.js";
import { generateWorkout, weeklyPlan, buildChallenge } from "../../assets/rankbound/tools/engine.js";
import { planPushUps } from "../../assets/rankbound/tools/pushups.js";
import { scaleRoutine } from "../../assets/rankbound/tools/opm.js";
import { toolsMenuHtml } from "./menu.mjs";
import { PAGES_BY_SLUG, RANKBOUND_APP_ID, SOURCES, UPDATED, UPDATED_LABEL } from "./pages.mjs";

export const OG_IMAGE = `${SITE_URL}/assets/og/rankbound-tools.png`;
const CTA_NOTE = "No account. No subscription required. Just train and level up.";

/** @param {string} page @param {"header"|"result"|"final"} placement */
export function ctaUrl(page, placement) {
  return appStoreUrl(`rankbound-${page}-${placement}`, RANKBOUND_APP_ID);
}

/** @param {Record<string, any>} page @param {"header"|"result"|"final"} placement */
function ctaLink(page, placement, label, className) {
  const campaign = `rankbound-${page.campaign}-${placement}`;
  return `<a class="${className}" href="${esc(ctaUrl(page.campaign, placement))}" data-cta="${esc(campaign)}" target="_blank" rel="noopener noreferrer">${esc(label)}<span class="rb-sr-only"> (opens in a new tab)</span></a>`;
}

function head(page) {
  const url = `${SITE_URL}${page.path}`;
  const webApp = jsonLd({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: page.h1,
    url,
    description: page.description,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript for the interactive controls",
    isAccessibleForFree: true,
    inLanguage: "en-US",
    dateModified: UPDATED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "Elevix Apps", url: `${SITE_URL}/` }
  });
  const crumbs = breadcrumbJsonLd([
    { name: "Elevix Apps", path: "/" },
    { name: "Rankbound", path: "/rankbound/" },
    { name: page.navLabel, path: page.path }
  ]);

  return `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(page.title)}">
    <meta property="og:description" content="${esc(page.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="Elevix Apps">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Free Rankbound workout tools: workout generator, push-up calculator and training challenges.">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(page.title)}">
    <meta name="twitter:description" content="${esc(page.description)}">
    <meta name="twitter:image" content="${OG_IMAGE}">
    <meta name="apple-itunes-app" content="app-id=${RANKBOUND_APP_ID}">
    <link rel="icon" href="/assets/rankbound/icon.png" type="image/png">
    <link rel="apple-touch-icon" href="/assets/rankbound/apple-touch-icon.png">
    <meta name="theme-color" content="#050a14">
    <link rel="stylesheet" href="/styles.css">
    <script src="/assets/js/analytics.js" defer></script>
    <script src="/assets/rankbound/nav.js" defer></script>
    <script type="module" src="/assets/rankbound/tools/ui.js"></script>
    ${webApp}
    ${crumbs}
    ${faqJsonLd(page.faqs)}
  </head>`;
}

/** @param {string} label @param {string} name @param {Array<{value: string|number, label: string}>} options @param {string|number} value */
function select(label, name, options, value) {
  const id = `f-${name}`;
  return `<div class="rb-field"><label for="${id}">${esc(label)}</label><select id="${id}" name="${name}">${options
    .map((option) => `<option value="${esc(option.value)}"${String(option.value) === String(value) ? " selected" : ""}>${esc(option.label)}</option>`)
    .join("")}</select></div>`;
}

/** @param {string} label @param {string} name @param {number} value @param {number} max @param {string} [hint] */
function number(label, name, value, max, hint) {
  const id = `f-${name}`;
  return `<div class="rb-field"><label for="${id}">${esc(label)}</label><input id="${id}" name="${name}" type="number" inputmode="numeric" min="0" max="${max}" step="1" value="${value}">${hint ? `<span class="rb-hint">${esc(hint)}</span>` : ""}</div>`;
}

/** @param {Record<string, any>} defaults @param {boolean} lowImpactOnly */
function equipmentFields(defaults, showEquipment = true) {
  const equipment = showEquipment
    ? `<fieldset class="rb-field rb-checkgroup"><legend>Equipment you have (optional)</legend>${[
        ["bar", "Pull-up bar or sturdy low bar"],
        ["bench", "Bench, chair or step"],
        ["rope", "Jump rope"]
      ]
        .map(
          ([value, label]) =>
            `<label class="rb-check"><input type="checkbox" name="equipment" value="${value}"${(defaults.equipment ?? []).includes(value) ? " checked" : ""}><span>${label}</span></label>`
        )
        .join("")}</fieldset>`
    : "";
  const impact = `<div class="rb-field rb-checkgroup"><label class="rb-check"><input type="checkbox" name="lowImpact"${defaults.lowImpact ? " checked" : ""}><span>Low impact (no jumping)</span></label></div>`;
  return equipment + impact;
}

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
];

function formFor(page) {
  const d = page.defaults;
  const minutes = (page.minutesOptions ?? []).map((value) => ({ value, label: `${value} minutes` }));

  if (page.tool === "generator") {
    const days = [2, 3, 4, 5, 6].map((value) => ({ value, label: `${value} days a week` }));
    return `<form class="rb-form" method="get" action="${esc(page.path)}"><div class="rb-field-grid">${select("Experience level", "level", LEVEL_OPTIONS, d.level)}${select("Time available", "minutes", minutes, d.minutes)}${select(page.focusLabel ?? "Focus", "focus", page.focusOptions, d.focus)}${select("Training days (for your week)", "days", days, d.days)}</div>${equipmentFields(d, page.showEquipment)}<button class="rb-btn-outline" type="submit">Generate workout</button></form>`;
  }
  if (page.tool === "challenge") {
    const days = (page.daysOptions ?? [3, 4, 5]).map((value) => ({ value, label: `${value} days a week` }));
    return `<form class="rb-form" method="get" action="${esc(page.path)}"><div class="rb-field-grid">${select("Experience level", "level", LEVEL_OPTIONS, d.level)}${select("Training days", "days", days, d.days)}${select("Time per session", "minutes", minutes, d.minutes)}</div>${equipmentFields(d, page.showEquipment)}<p class="rb-hint">Beginner plans are capped at 4 training days a week.</p><button class="rb-btn-outline" type="submit">Build my 30 days</button></form>`;
  }
  const days = [3, 4].map((value) => ({ value, label: `${value} days a week` }));
  if (page.tool === "pushups") {
    return `<form class="rb-form" method="get" action="${esc(page.path)}"><div class="rb-field-grid">${number("Most strict push-ups in one set", "max", d.max, 100, "Full range of motion, stop when form slips. Enter 0 if you cannot do one yet.")}${select("Training days", "days", days, d.days)}</div><button class="rb-btn-outline" type="submit">Calculate my plan</button></form>`;
  }
  return `<form class="rb-form" method="get" action="${esc(page.path)}"><div class="rb-field-grid">${number("Push-ups in one set", "pushups", d.pushups, 200)}${number("Sit-ups in one set", "situps", d.situps, 200)}${number("Squats in one set", "squats", d.squats, 300)}${number("Minutes you can walk or jog comfortably", "minutes", d.minutes, 180)}${select("Training days", "days", days, d.days)}</div><button class="rb-btn-outline" type="submit">Scale the routine</button></form>`;
}

function actions(page) {
  const reroll = page.tool === "generator" || page.tool === "challenge" ? `<button class="rb-btn-outline" type="button" data-action="reroll">New variation</button>` : "";
  return `<div class="rb-actions">${reroll}<button class="rb-btn-outline" type="button" data-action="copy">Copy</button><button class="rb-btn-outline" type="button" data-action="share" hidden>Share</button><button class="rb-btn-outline" type="button" data-action="print">Print</button></div><p class="rb-note" data-status role="status"></p>`;
}

function resultFor(page) {
  const d = page.defaults;
  if (page.tool === "generator") {
    const quest = generateWorkout(d);
    const plan = weeklyPlan({ ...d, days: d.days });
    return `<div data-result-quest>${renderQuest(quest)}</div>${actions(page)}<h3 class="rb-week-heading">Your week</h3><div data-result-week>${renderWeek(plan)}</div>`;
  }
  if (page.tool === "challenge") {
    return `${actions(page)}<div data-result>${renderChallenge(buildChallenge(d))}</div>`;
  }
  if (page.tool === "pushups") {
    return `<div data-result>${renderPushUps(planPushUps(d))}</div>${actions(page)}`;
  }
  return `<div data-result>${renderRoutine(scaleRoutine(d))}</div>${actions(page)}`;
}

function toolSection(page) {
  const heading = { generator: "Build your workout", challenge: "Build your 30 days", pushups: "Calculate your plan", opm: "Scale the routine" }[page.tool];
  const config = JSON.stringify({ tool: page.tool, page: page.campaign });
  return `<section class="rb-section rb-tool" data-rb-tool aria-labelledby="tool-heading">
        <div class="rb-shell">
          <h2 id="tool-heading">${heading}</h2>
          <div class="rb-panel rb-tool-panel">${formFor(page)}</div>
          <noscript><p class="rb-note">The controls need JavaScript. The result below is a ready-made example you can use as it is.</p></noscript>
          <div class="rb-result" aria-live="polite">${resultFor(page)}</div>
          <script type="application/json" id="rb-tool-config">${config}</script>
        </div>
      </section>`;
}

function ctaPanel(page) {
  return `<section class="rb-section rb-cta-section" aria-labelledby="cta-heading">
        <div class="rb-shell">
          <div class="rb-panel rb-cta-panel">
            <p class="rb-kicker">Optional next step</p>
            <h2 id="cta-heading">Turn this into a daily quest</h2>
            <p>${esc(page.ctaLine)}</p>
            <div class="rb-cta-group">${ctaLink(page, "result", "Download Free on the App Store", "rb-button")}<p class="rb-cta-note">${CTA_NOTE}</p></div>
          </div>
        </div>
      </section>`;
}

function proseSections(page) {
  return page.sections
    .map(
      (section) => `<section class="rb-section rb-prose">
        <div class="rb-shell">
          <h2>${esc(section.h2)}</h2>
${section.body.map((paragraph) => `          <p>${esc(paragraph)}</p>`).join("\n")}
        </div>
      </section>`
    )
    .join("\n      ");
}

function samplesSection(page) {
  if (page.samples) {
    const cards = page.samples.map((sample) => renderQuest(generateWorkout(sample.options), { heading: "h3", kicker: sample.label })).join("");
    return `<section class="rb-section" aria-labelledby="samples-heading">
        <div class="rb-shell">
          <h2 id="samples-heading">${esc(page.samplesHeading)}</h2>
          <p class="rb-section-lead">${esc(page.samplesIntro)}</p>
          <div class="rb-samples">${cards}</div>
        </div>
      </section>`;
  }
  if (page.sampleMaxes) {
    const rows = page.sampleMaxes
      .map((max) => {
        const plan = planPushUps({ max, days: 3 });
        const last = plan.weeks[plan.weeks.length - 1];
        return `<tr><th scope="row">${max}</th><td>${esc(plan.variation.name)}</td><td>${plan.weeks[0].sets} × ${plan.weeks[0].reps}</td><td>${last.sets} × ${last.reps}</td></tr>`;
      })
      .join("");
    return `<section class="rb-section" aria-labelledby="samples-heading">
        <div class="rb-shell">
          <h2 id="samples-heading">${esc(page.samplesHeading)}</h2>
          <p class="rb-section-lead">${esc(page.samplesIntro)}</p>
          <div class="rb-table-wrap"><table class="rb-ranks"><caption class="rb-sr-only">Example push-up plans by best set</caption><thead><tr><th scope="col">Best set</th><th scope="col">Train with</th><th scope="col">Week 1</th><th scope="col">Week 4</th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>
      </section>`;
  }
  return "";
}

function faqSection(page) {
  return `<section class="rb-section rb-faq" aria-labelledby="faq-heading">
        <div class="rb-shell">
          <h2 id="faq-heading">Frequently Asked Questions</h2>
${page.faqs
  .map(
    (faq) => `          <details class="rb-faq-item">
            <summary>${esc(faq.question)}</summary>
            <p>${esc(faq.answer)}</p>
          </details>`
  )
  .join("\n")}
        </div>
      </section>`;
}

function sourcesSection(page) {
  const items = page.sources.map((key) => `<li><a href="${esc(SOURCES[key].url)}" target="_blank" rel="noopener noreferrer">${esc(SOURCES[key].name)}<span class="rb-sr-only"> (opens in a new tab)</span></a></li>`).join("");
  return `<section class="rb-section rb-sources" aria-labelledby="sources-heading">
        <div class="rb-shell">
          <h2 id="sources-heading">Sources and notes</h2>
          <ul>${items}</ul>
          <p class="rb-note">This tool is a general, rule-based guide and not medical advice or personal training. Talk to a doctor before starting a new exercise program, and stop if anything causes pain. Last updated ${UPDATED_LABEL}.</p>
        </div>
      </section>`;
}

function relatedSection(page) {
  const cards = page.related
    .map((slug) => PAGES_BY_SLUG.get(slug))
    .filter(Boolean)
    .map((other) => `<li><a class="rb-panel rb-related-card" href="${esc(other.path)}"><strong>${esc(other.cardLabel ?? other.navLabel)}</strong><span>${esc(other.teaser)}</span></a></li>`)
    .join("");
  return `<section class="rb-section" aria-labelledby="related-heading">
        <div class="rb-shell">
          <h2 id="related-heading">More free tools</h2>
          <ul class="rb-related">${cards}</ul>
        </div>
      </section>`;
}

function finalCta(page) {
  return `<section class="rb-section rb-final" aria-labelledby="final-heading">
        <div class="rb-shell">
          <img class="rb-final-icon" src="/assets/rankbound/icon.png" alt="" width="512" height="512" loading="lazy">
          <h2 id="final-heading">Turn your training into an RPG.</h2>
          <p class="rb-section-lead rb-centered">Track your quests, earn XP and level up from Rank F toward Rank S. Rankbound is free on iPhone.</p>
          <div class="rb-cta-group">${ctaLink(page, "final", "Download Free on the App Store", "rb-button")}<p class="rb-cta-note">${CTA_NOTE}</p></div>
        </div>
      </section>`;
}

export function renderPage(page) {
  return `<!doctype html>
<html lang="en">
  ${head(page)}
  <body class="rb-body">
    <a class="rb-skip" href="#main">Skip to content</a>
    <header class="rb-header">
      <div class="rb-shell rb-header-inner">
        <a class="rb-brand" href="/rankbound/" aria-label="Rankbound home">
          <img src="/assets/rankbound/icon.png" alt="" width="512" height="512">
          <span>Rankbound</span>
        </a>
        <div class="rb-header-actions">
          ${toolsMenuHtml(page.path)}
          ${ctaLink(page, "header", "Download Free", "rb-header-cta")}
        </div>
      </div>
    </header>

    <main id="main">
      <div class="rb-hero rb-tool-hero">
        <div class="rb-shell">
          <nav class="rb-crumbs" aria-label="Breadcrumb"><ol><li><a href="/rankbound/">Rankbound</a></li><li aria-current="page">${esc(page.navLabel)}</li></ol></nav>
          <p class="rb-eyebrow">${esc(page.eyebrow)}</p>
          <h1>${esc(page.h1)}</h1>
          <p class="rb-lead">${esc(page.lead)}</p>
          <p class="rb-cta-note">No account needed. Works in your browser.</p>${page.notice ? `\n          <p class="rb-notice">${esc(page.notice)}</p>` : ""}
        </div>
      </div>

      ${toolSection(page)}

      ${ctaPanel(page)}

      ${proseSections(page)}

      ${samplesSection(page)}

      ${faqSection(page)}

      ${sourcesSection(page)}

      ${relatedSection(page)}

      ${finalCta(page)}
    </main>

    <footer class="rb-footer">
      <div class="rb-shell">
        <nav aria-label="Rankbound links">
          <a href="/rankbound/">Rankbound app</a>
          <a href="/rankbound/terms.html">Terms</a>
          <a href="/rankbound/privacy.html">Privacy</a>
          <a href="/support.html">Support</a>
          <a href="/index.html">All Elevix Apps</a>
        </nav>
        <p>
          These tools are general information, not medical advice. Talk to a doctor before starting a new
          exercise program.
        </p>
        <p>&copy; 2026 Elevix Apps</p>
      </div>
    </footer>
  </body>
</html>
`;
}
