# CLAUDE.md

Marketing and legal site for **Elevix Apps** at https://elevixapps.com. Plain static HTML/CSS/JS served by GitHub Pages from `main` (path `/`, custom domain in `CNAME`). There is no deploy step and no framework: whatever is on `main` is live a minute or two after push.

## Git workflow

- **Always work directly on `main`.** Do not create feature branches or PRs. Commit to `main` and push when asked.
- End commit messages with the attribution line from the session's system reminder.

## Apps and their pages

| App | Path | How it's built | App Store |
|---|---|---|---|
| Citizen Ready: USCIS Prep | `uscis/` | **Generated** by `scripts/build-site.mjs`, except `uscis/terms.html` and `uscis/privacy.html` | id `6778953719` |
| Sierra Math (California K-5 math) | `sierra-math/` | Hand-written (`index.html`, `terms.html`, `privacy.html`) | id `6797675240` |
| Rankbound: Workout RPG | `rankbound/` | Hand-written (`index.html`, `terms.html`, `privacy.html`) | **Not live yet.** Links use placeholder `id0000000000` / `app-id=0000000000` in `rankbound/index.html`; replace all of them with the real Apple ID |

Shared pages: `index.html` (hub with one `app-card` per app), `support.html` (Tally form; never put an email address on the site), `privacy.html` / `terms.html` at the root are legacy redirects to the USCIS versions.

Adding a new app: create `<app>/index.html`, `terms.html`, `privacy.html`, put images in `assets/<app>/`, add an `app-card` to `index.html`, mention it in the hub and support page meta, and add its pages to `staticPages` in `scripts/build-site.mjs` and to `sitemap.xml`.

## Generated USCIS pages

Never hand-edit generated HTML under `uscis/` (`practice-test/`, `civics-questions/`, `questions/`, `citizenship-test-guide/`, `es/`, `index.html`). Change the templates in `scripts/site/` and rebuild. See `README.md` for the data export flow.

```sh
npm run serve          # local preview at http://localhost:8080 (node scripts/serve.mjs [port])
npm run build          # regenerates all USCIS pages AND sitemap.xml
npm run render:assets  # headless Chrome: OG images and the two USCIS PDFs
```

- `npm run build` rewrites every generated page with a new build date, so it produces a large diff. Only run it when USCIS content or templates change. For hand-written pages, add sitemap entries by hand **and** register them in `staticPages` so the next build keeps them.
- `npm run render:assets` also regenerates the PDFs. To re-render a single OG image, run Chrome directly: `chrome --headless=new --window-size=1200,630 --screenshot=assets/og/<app>.png file:///.../scripts/assets/og-<app>.html` (OG templates use relative asset paths so this works).
- App Store links on generated pages go through `appStoreUrl(campaign)` in `scripts/site/html.mjs` (`pt=129018838&ct=<campaign>` shows up in App Store Connect analytics). Use the same pattern for other apps once their IDs exist.

## Styling

- One stylesheet: `styles.css`. Light cream/navy theme by default (tokens on `:root`).
- Section prefixes: `cr-` for Citizen Ready generated pages, `rb-` for the Rankbound landing page. The Rankbound page is dark and mirrors the app theme (`#050a14` background, `#41e6f5` cyan accent, corner-bracket panels). Rankbound terms and privacy use the shared light layout.
- Sierra Math and the legal pages use the shared classes (`home-hero`, `feature`, `faq-item`, `content-card`, `bottom-nav`).
- Check layouts at 390px with a real browser viewport (Playwright). `chrome --headless --window-size` cannot go below ~500px wide and gives misleading mobile screenshots.

## Analytics

`assets/js/analytics.js` is cookieless PostHog (`persistence: "memory"`, no autocapture, no session recording) and only reports on `elevixapps.com`. `site_section` comes from the first path segment. Any link with `data-cta="<campaign>"` fires `app_store_cta_clicked`. Included on USCIS generated pages and `rankbound/index.html`; not on Sierra Math.

## SEO conventions

- Every page: unique `<title>` and meta description, canonical URL (absolute, `https://elevixapps.com/...`), Open Graph and Twitter tags, `BreadcrumbList` JSON-LD. App landing pages also get `SoftwareApplication`/`MobileApplication` and `FAQPage` JSON-LD, with FAQ text matching the visible FAQ exactly.
- Screenshots: descriptive alt text based on what the screen actually shows, explicit `width`/`height`, `loading="lazy"` below the fold. Web images are resized to ~860px wide JPEG; keep them small (under ~120 KB each).
- Keyword research is done with the Ahrefs MCP tools, US market. Validate volume and difficulty before targeting a term.

## Copy rules

- **Rankbound:** never use "Solo Leveling" (or its characters) in Rankbound's branding, taglines, landing page, or App Store metadata, and never imply an official association. The franchise may be referenced only in separate editorial articles targeting those searches. Positioning leads with RPG progression over fitness tracking; one CTA, "Download Free on the App Store", with "No account. No subscription required. Just train and level up." No fitness outcome claims ("build muscle", "lose weight"). The player is the character (there is no avatar). Free with no ads or IAP at launch; paid features may come in v1.1+, so update its privacy policy and terms before they ship.
- **Privacy policies** must match what the app really does. Rankbound collects no data (no analytics, network calls, or permissions); Sierra Math only processes purchase data via Apple/RevenueCat. Verify against the app's code before changing a policy.
- App source repos live next to this one: `../prep-forge/apps/uscis`, `../prep-forge/apps/california-math`, `../rankbound` (its `marketing/` folder has App Store screenshots and `docs/` has the PRD and release checklist).
