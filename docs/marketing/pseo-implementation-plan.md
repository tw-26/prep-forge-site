# Rankbound pSEO implementation plan

Companion to `pseo-research.md`. This documents what was built and how to maintain it.

## Architecture

Plain static HTML, CSS and JavaScript, as the rest of the site. No framework, no backend, no new dependencies, no build step beyond a Node script.

```
assets/rankbound/tools/        shared engine, used by the build AND the browser
  exercises.js                 45-exercise dataset (ids and defaults mirror the app)
  engine.js                    deterministic generator, weekly plan, 30-day challenge
  progression.js               XP, level and rank math mirroring the app
  pushups.js                   push-up calculator
  opm.js                       100/100/100 + run scaler
  render.js                    pure HTML and plain-text renderers (escape everything)
  ui.js                        progressive enhancement: inputs, new variation, copy, share, print
scripts/rankbound/
  pages.mjs                    per-page config: titles, copy, FAQ, samples, sources
  templates.mjs                page shell, forms, CTAs, JSON-LD (reuses scripts/site/html.mjs)
  build-tools.mjs              writes the 7 pages (npm run build:rankbound)
tests/rankbound/               node:test suites
rankbound/{workout-generator,push-up-calculator}/, rankbound/workouts/*, rankbound/guides/*
                               GENERATED. Never hand-edit; change pages.mjs / templates.mjs and rebuild
```

Design decisions:

- **Plain JavaScript with JSDoc and `// @ts-check`, not TypeScript.** The site has no TypeScript toolchain, and adding one would be new complexity for a solo developer. The modules are type-checked with `tsc --checkJs` without adding a dependency (see Testing).
- **Files end in `.js`, not `.mjs`**, because browsers reject module scripts served with a non-JavaScript MIME type and some hosts do not map `.mjs`. The root `package.json` already sets `"type": "module"`.
- **Static rendering**: the build imports the same engine and renders each page's default result into the HTML. Pages are useful with JavaScript off; the controls need JavaScript and say so in a `<noscript>` note. Action buttons stay hidden until the script runs.
- **Deterministic engine**: a seeded PRNG (mulberry32). The same options and seed always give the same workout, which makes the static result reproducible, tests exact, and shared links faithful.
- **No storage, no network** in `ui.js`. Enforced by a test.

## Datasets

`exercises.js` carries the 45 exercises of the app (`rankbound/src/constants/exercise-library.ts`) with the same ids, names, categories, units and default sets and targets. A test cross-checks them against the app repo when it sits next to this one. Web-only fields written for these tools: equipment (none, bar, bench, rope, bike, pool), movement pattern, tier (1 to 3), impact, seconds per rep, easier and harder progressions, an original one-line technique cue, and a long-duration flag.

The app library has no provenance note. It contains generic exercise names with hand-set defaults, and the cues, tiers and progressions on the web side are original text.

## Generator rules (`engine.js`)

- Eligibility: tier within the level's cap, equipment owned (or none needed), no jumping moves when low impact is on, no long-duration cardio. Knee and incline push-ups are beginner-only and appear to other levels as "Easier" options.
- Slots per focus (push, pull, squat, lunge, bridge, core, cardio patterns) fill the session. If a slot has no candidates (for example pulling without a bar), it falls back to the focus's categories.
- Targets: app defaults scaled by level (0.7, 1.0, 1.3), rounded (whole reps, 5-second steps, whole minutes).
- Time fit: sets are added or removed until the estimate, including 2 to 4 minutes of warm-up and cool-down, is within 85 to 115 percent of the requested time. Verified across all 3,600 combinations of the UI inputs.
- Safety caps per level:

| Level | Rest | Max sets per exercise | Max total sets | Max jumping moves |
|---|---:|---:|---:|---:|
| Beginner | 60 s | 3 | 18 | 2 |
| Intermediate | 50 s | 4 | 26 | 4 |
| Advanced | 45 s | 4 | 32 | 5 |

  At 10 minutes, intermediate and advanced rests shorten to 30 s. Beginners are capped at 4 training days a week.
- Weekly plan: 2 to 6 training days with rest days between, focus rotating so consecutive days differ.
- 30-day challenge: weekly layout repeated, targets rising 5 percent per week, an XP projection from the app's real curve.

## Calculators

- **Push-ups** (`pushups.js`): variation from your best strict set (0 to 2 incline, 3 to 5 knee, 6 or more full), four sets at about 60 percent of best (flat 6 for the easier variations), about 10 percent (at least one rep) more per week, capped near 85 percent of best, 90 seconds of rest, 3 or 4 days a week, retest after week 4.
- **One Punch Man scaler** (`opm.js`): three sets starting at 60 percent of your best set, total reps rising about 10 percent (at least 3) a week to 100; walk or jog minutes rising about 10 percent (at least 2) a week to 70 (about 10 km at 7 min/km), 3 or 4 days a week instead of daily. All of it is labeled a rule of thumb.

## Page routes

| Route | Tool | Campaign slug |
|---|---|---|
| `/rankbound/workout-generator/` | generator | `generator` |
| `/rankbound/push-up-calculator/` | push-ups | `pushups` |
| `/rankbound/workouts/30-day-calisthenics-challenge/` | challenge | `challenge30` |
| `/rankbound/workouts/no-equipment-workout/` | generator, equipment locked | `noequip` |
| `/rankbound/workouts/15-minute-workout/` | generator, 10/15/20 minutes | `min15` |
| `/rankbound/workouts/anime-workout/` | generator, style labels | `anime` |
| `/rankbound/guides/one-punch-man-workout/` | scaler | `opm` |

Each page: unique title and description, one H1, absolute canonical, Open Graph and Twitter tags (shared image `assets/og/rankbound-tools.png`), `WebApplication`, `BreadcrumbList` and `FAQPage` JSON-LD, visible breadcrumb, related tools, sources, a medical disclaimer, and App Store CTAs. All seven are in `sitemap.xml` and in `staticPages` in `scripts/build-site.mjs`. `robots.txt` is unchanged (it already allows everything and lists the sitemap). A root `404.html` (noindex) provides proper not-found behavior on GitHub Pages.

Internal linking: the Rankbound landing page gets a small "Plan a Workout Before You Download" panel and a footer link; every tool page links to three related tools. The One Punch Man page is linked from other pages with a neutral label ("The 100-rep daily routine, scaled") so the franchise name stays on that single editorial page.

## Conversion and analytics

- CTAs use `appStoreUrl(campaign, appId)` from `scripts/site/html.mjs` (extended with an optional app id; the default and USCIS output are unchanged) and carry `data-cta`, which `assets/js/analytics.js` already reports as `app_store_cta_clicked`.
- New events (coarse values only): `rb_tool_started`, `rb_tool_generated`, `rb_tool_rerolled`, `rb_tool_copied`, `rb_tool_shared`, `rb_tool_printed`. Properties are the tool slug and settings such as level, session length, equipment, focus and training days. Push-up and routine numbers (your max reps) are never sent.
- Analytics are cookieless (PostHog, memory persistence, no autocapture, no recording) and only report on `elevixapps.com`. `rankbound/privacy.html` now has a "This Website" section describing this.
- This setup cannot measure returning visitors.

## Testing

Run everything:

```sh
npm test                      # 30 tests (node:test, no dependencies)
npm run build:rankbound       # regenerate the 7 pages; a test fails if they are stale
npm run build                 # full site build (rewrites USCIS pages and sitemap.xml; see below)
```

`npm test` covers: generation rules and determinism; equipment, tier and impact filters; workload caps and the time fit across all UI combinations; edge-case and invalid inputs; output formatting; weekly and 30-day structure; progression math against the app's documented XP per rank (and against the app source when present); calculator caps and monotonic ramps; route inventory and invalid slugs; stale generated files; titles, descriptions, canonicals, robots and Open Graph; heading order; JSON-LD validity and FAQ-text parity; sitemap and `staticPages` entries; internal link resolution and orphans; static result present; form labels and unique ids; CTA structure, ids and campaigns; copy rules (no sync or import claims, no outcome claims, no franchise names outside the editorial page, no "Solo Leveling"); script allow-list and no storage or network in the UI.

There is no lint or TypeScript step in this repo. The browser modules were type-checked with `npx -p typescript tsc --checkJs --noEmit` (non-strict, no repo dependency added), and every script was syntax-checked with `node --check`. Browser checks (Playwright, from the sibling app repo's install) covered 390 px and 1280 px layouts, horizontal overflow, console errors, interactions, shared-link restore and JavaScript-disabled rendering.

`npm run build` regenerates every USCIS page with a new build date, which produces a large diff. To verify the production build without that diff, run it in a throwaway copy and compare the sitemap URL set, as was done for this change.

## Maintenance

- Change copy or layout in `scripts/rankbound/`, then run `npm run build:rankbound` and commit the generated pages.
- Never rename an exercise id. If the app library changes, update `exercises.js`; the cross-check test will flag mismatches.
- If the app's XP curve changes, update `progression.js`; the test compares the documented XP per rank.
- Paid features may come to the app in v1.1 or later. Update the page copy ("free", "no subscription required") and the privacy policy and terms first.
- Bump `UPDATED` in `pages.mjs` when a page's content changes materially.

## Header menu

The header "Free Tools" item is a dropdown (`scripts/rankbound/menu.mjs`, `assets/rankbound/nav.js`, `.rb-menu-*` in `styles.css`) listing all seven tools, grouped, on the landing page and every tool page. It follows the WAI-ARIA disclosure navigation pattern (a button with `aria-expanded` and `aria-controls`, not `role="menu"`). It opens on mouse hover (80 ms in, 350 ms grace out, with an invisible bridge so the pointer can reach the panel), on click or tap, and with Enter or Space. Escape closes it and returns focus; tabbing out or tapping outside closes it. A click on a hover-opened menu keeps it open. Without JavaScript, CSS `:hover` and `:focus-within` still show it. Add a page to `GROUPS` in `menu.mjs` when adding a tool; a test requires every page in the menu.
