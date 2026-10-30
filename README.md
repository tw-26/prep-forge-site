# Elevix Apps Site

Site live at https://elevixapps.com/. Served by GitHub Pages straight from this repo; there is no deploy step.

## Citizen Ready (USCIS) pages

Everything under `uscis/` except `terms.html` and `privacy.html` is generated. Don't edit the generated HTML by hand; change the scripts and rebuild.

| Path | What it is |
|---|---|
| `data/` | Question bank and state data copied out of the app repo (`apps/uscis`). Also served to the browser by the quiz. |
| `scripts/export-uscis-data.mjs` | Copies the app's content into `data/`. Needs the app repo checked out and installed. |
| `scripts/build-site.mjs` | Writes all USCIS pages (English and Spanish) and `sitemap.xml`. |
| `scripts/render-assets.mjs` | Uses Chrome to render the share image and the two question PDFs. |
| `scripts/site/` | Page templates (`uscis-pages.mjs`), copy (`uscis-copy.mjs`) and shared layout (`html.mjs`). |
| `assets/js/uscis-quiz.js` | The free practice test and the per-question check. |
| `assets/js/analytics.js` | Cookieless PostHog (only reports on elevixapps.com). |

### When the app's questions or office holders change

```sh
npm run export:uscis   # defaults to ../prep-forge/apps/uscis; pass another path as an argument
npm run build
npm run render:assets  # regenerates the PDFs
```

Then commit everything, including `data/` and the generated pages.

Office holders (senators, representatives, governors, President, etc.) come from the app's data. After elections, update the app first, then re-export here.
