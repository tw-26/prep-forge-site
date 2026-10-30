// Shared HTML helpers and page shell for generated pages.
export const SITE_URL = "https://elevixapps.com";
export const APP_NAME = "Citizen Ready: USCIS Prep";
export const APP_SHORT_NAME = "Citizen Ready";
export const APP_STORE_ID = "6778953719";
export const OG_IMAGE = "/assets/og/citizen-ready.png";

// `ct` shows up in App Store Connect > Analytics > Sources, so each placement gets its own value.
export function appStoreUrl(campaign) {
  return `https://apps.apple.com/app/apple-store/id${APP_STORE_ID}?pt=129018838&ct=${encodeURIComponent(campaign)}&mt=8`;
}

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function slugify(value, maxLength = 80) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/u\.s\./g, "us")
    .replace(/ee\. ?uu\./g, "eeuu")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length <= maxLength) {
    return slug;
  }

  return slug.slice(0, maxLength).replace(/-[^-]*$/, "");
}

export function jsonLd(data) {
  // Escape "<" so a value can never close the script tag.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

export function breadcrumbJsonLd(crumbs) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`
    }))
  });
}

export function faqJsonLd(faqs) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: stripTags(faq.answer) }
    }))
  });
}

export function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, "");
}

export function truncate(value, maxLength) {
  const text = stripTags(value).replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

export function faqList(faqs, heading) {
  return `
      <section class="cr-section faq-list" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="cr-h2">${esc(heading)}</h2>
${faqs
  .map(
    (faq) => `        <details class="faq-item">
          <summary>${esc(faq.question)}</summary>
          <p>${faq.answer}</p>
        </details>`
  )
  .join("\n")}
      </section>`;
}

export function breadcrumbs(crumbs, label) {
  return `
      <nav class="cr-breadcrumbs" aria-label="${esc(label)}">
        <ol>
${crumbs
  .map((crumb, index) =>
    index === crumbs.length - 1
      ? `          <li aria-current="page">${esc(crumb.name)}</li>`
      : `          <li><a href="${crumb.path}">${esc(crumb.name)}</a></li>`
  )
  .join("\n")}
        </ol>
      </nav>`;
}

/**
 * Wraps page content in the Citizen Ready shell: head tags, header nav and footer.
 * `alternates` maps "en"/"es" to paths of the same page in each language.
 */
export function uscisPage({
  lang,
  path,
  title,
  description,
  alternates,
  ui,
  body,
  head = "",
  scripts = [],
  ogType = "website",
  noindex = false
}) {
  const canonical = `${SITE_URL}${path}`;
  const hreflang = alternates
    ? [
        `<link rel="alternate" hreflang="en" href="${SITE_URL}${alternates.en}">`,
        `<link rel="alternate" hreflang="es" href="${SITE_URL}${alternates.es}">`,
        `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${alternates.en}">`
      ].join("\n    ")
    : "";
  const otherLang = lang === "en" ? "es" : "en";
  const switchPath = alternates?.[otherLang] ?? ui.nav.homePath[otherLang];

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
    <link rel="canonical" href="${canonical}">
    ${hreflang}
    <meta name="apple-itunes-app" content="app-id=${APP_STORE_ID}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="Elevix Apps">
    <meta property="og:locale" content="${lang === "es" ? "es_US" : "en_US"}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE_URL}${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${SITE_URL}${OG_IMAGE}">
    <link rel="icon" href="/assets/icon.png" type="image/png">
    <link rel="apple-touch-icon" href="/assets/icon.png">
    <meta name="theme-color" content="#1e3a5f">
    <link rel="stylesheet" href="/styles.css">
    ${head}
    <script src="/assets/js/analytics.js" defer></script>
${scripts.map((src) => `    <script src="${src}" defer></script>`).join("\n")}
  </head>
  <body class="cr-body">
    <a class="cr-skip" href="#main">${esc(ui.nav.skip)}</a>
    <header class="cr-header">
      <div class="cr-header-inner">
        <a class="cr-brand" href="${ui.nav.homePath[lang]}">
          <img src="/assets/icon.png" alt="" width="40" height="40">
          <span>${APP_SHORT_NAME}</span>
        </a>
        <nav class="cr-nav" aria-label="${esc(ui.nav.label)}">
          <a href="${ui.nav.practicePath}"${path === ui.nav.practicePath ? ' aria-current="page"' : ""}>${esc(ui.nav.practice)}</a>
          <a href="${ui.nav.questionsPath}"${path === ui.nav.questionsPath ? ' aria-current="page"' : ""}>${esc(ui.nav.questions)}</a>
          <a href="${ui.nav.guidePath}"${path === ui.nav.guidePath ? ' aria-current="page"' : ""}>${esc(ui.nav.guide)}</a>
          <a class="cr-nav-lang" href="${switchPath}" hreflang="${otherLang}" lang="${otherLang}">${esc(ui.nav.switchLanguage)}</a>
        </nav>
      </div>
    </header>
    <main id="main" class="cr-main">
${body}
    </main>
    <footer class="cr-footer">
      <div class="cr-footer-inner">
        <p class="cr-footer-brand"><strong>${APP_NAME}</strong> · ${esc(ui.footer.tagline)}</p>
        <nav aria-label="${esc(ui.footer.label)}">
          <a href="${ui.nav.homePath[lang]}">${esc(ui.footer.app)}</a>
          <a href="${ui.nav.practicePath}">${esc(ui.nav.practice)}</a>
          <a href="${ui.nav.questionsPath}">${esc(ui.nav.questions)}</a>
          <a href="${ui.nav.guidePath}">${esc(ui.nav.guide)}</a>
          <a href="/uscis/terms.html">${esc(ui.footer.terms)}</a>
          <a href="/uscis/privacy.html">${esc(ui.footer.privacy)}</a>
          <a href="/support.html">${esc(ui.footer.support)}</a>
          <a href="/">${esc(ui.footer.allApps)}</a>
        </nav>
        <p class="cr-disclaimer">${ui.footer.disclaimer}</p>
      </div>
    </footer>
  </body>
</html>
`;
}
