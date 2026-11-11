# Rankbound pSEO measurement plan

A website CTA click is **not** an install. Clicks measure interest on the website; App Store Connect measures what happens after. Do not report CTA clicks as downloads.

## Setup (once, manual)

1. **Search Console**: confirm the `elevixapps.com` property, submit `https://elevixapps.com/sitemap.xml`, and run URL Inspection on the seven new URLs. Record the submission date as day 0.
2. **PostHog**: confirm events arrive from the live site (`rb_tool_started`, `rb_tool_generated`, `rb_tool_rerolled`, `rb_tool_copied`, `rb_tool_shared`, `rb_tool_printed`, `app_store_cta_clicked`, `$pageview`) with `site_section = rankbound`.
3. **App Store Connect**: Analytics, Sources, Campaigns. The `ct` values are `rankbound-<page>-<placement>`, for example `rankbound-pushups-result`.
4. **PageSpeed Insights** (mobile) for each URL. Targets: LCP under 2.5 s, CLS under 0.1, INP under 200 ms.

## Where each number comes from

| Question | Source | Where |
|---|---|---|
| Organic impressions, clicks, average position per page | Search Console | Performance, filter Page |
| Which queries reach each page | Search Console | Performance, Queries, filter Page |
| Organic landing sessions per page | PostHog | `$pageview` by path, referrer `google` |
| Generator starts and completions | PostHog | `rb_tool_started`, `rb_tool_generated` |
| Engagement beyond one result | PostHog | `rb_tool_rerolled`, `rb_tool_copied`, `rb_tool_shared`, `rb_tool_printed` |
| CTA clicks by page and placement | PostHog | `app_store_cta_clicked` by `campaign` |
| Device category | PostHog or Search Console | Device breakdown |
| Product page views and first-time downloads by campaign | App Store Connect | Sources, Campaigns (`ct`) |

Derived rates: tool completion rate = `rb_tool_generated` sessions / landing sessions; CTA click-through = `app_store_cta_clicked` / landing sessions, per page and per placement (`header`, `result`, `final`).

Limits: analytics are cookieless with memory persistence, so a returning visitor cannot be recognized. PostHog shows only sessions it can attribute; ad blockers will undercount. Search Console data lags by about two days. App Store Connect attribution only covers installs from a tapped link with campaign data.

## Day 30 review

- Are all seven URLs indexed (URL Inspection, Pages report)? Any "Crawled, currently not indexed" or "Duplicate" status is a content-quality signal to act on, not a bug to wait out.
- Impressions and queries per page. Which pages show impressions, and for which queries? Do they match the intended terms?
- Tool health: starts and completions per page, error-free events, mobile share.
- Baseline CTA click-through per page and placement.
- Decision: leave pages alone for another month unless something is broken.

## Day 60 review

- Trend in impressions, clicks and average position per page.
- Compare queries with the target list in `pseo-research.md`. New unexpected queries are candidates for copy changes.
- Compare placement performance (`header` vs `result` vs `final`) and keep the best-performing wording.
- Compare App Store Connect product page views and downloads by campaign with PostHog CTA clicks. A large gap between clicks and page views points to a tracking problem; a large gap between page views and downloads points to the App Store page.
- Improve the weakest page (thin sample results, a confusing control) before adding anything new.

## Day 90 review

- Which pages earn organic clicks, and which have impressions but no clicks (title and description issue) or neither (intent or authority issue)?
- Cost-benefit per page: clicks, tool completions, CTA clicks, and campaign downloads.
- Expansion decision, using the backlog in `pseo-research.md`:
  - Add the 10 or 20-minute pages only if queries and impressions justify them.
  - Revisit the Solo Leveling editorial question only with explicit approval.
  - Consolidate or remove a page that shows no impressions and no distinct queries instead of adding more.
- Re-check Google's spam-policy and helpful-content pages for changes.

## Red flags that should trigger action

- Pages stuck at "Crawled, currently not indexed" after 60 days: improve differentiation or merge pages.
- A sudden drop across all tool pages after a Google update: check the Pages and Performance reports by directory before changing anything.
- CTA clicks with no App Store Connect page views for a campaign: check the link and `ct` value.
- Any report of unsafe or nonsensical workouts: fix the engine rules and add a test.
