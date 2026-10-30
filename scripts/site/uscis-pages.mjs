// Page builders for the Citizen Ready (USCIS) section of elevixapps.com.
import {
  APP_NAME,
  SITE_URL,
  appStoreUrl,
  breadcrumbJsonLd,
  breadcrumbs,
  esc,
  faqJsonLd,
  faqList,
  jsonLd,
  slugify,
  truncate,
  uscisPage
} from "./html.mjs";
import { guidePage, landingPage, paths, practicePage, quizUi, topicSlugs, ui } from "./uscis-copy.mjs";

const other = (lang) => (lang === "en" ? "es" : "en");
const campaign = (lang, placement) => (lang === "en" ? `web-${placement}` : `web-es-${placement}`);

export function formatDate(isoDate, lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

function answerNote(question, lang) {
  const notes = ui[lang].questionPage.officialAnswersNote;

  if (question.count === 1) {
    return notes.any1;
  }

  return question.strategy === "all" ? notes.allN(question.count) : notes.anyN(question.count);
}

function currentOfficeName(question, meta) {
  const officeKeys = {
    "chief-justice": "chiefJustice",
    president: "president",
    "speaker-of-the-house": "speakerOfTheHouse",
    "vice-president": "vicePresident"
  };

  return meta.federalOffices[officeKeys[question.office]];
}

function appCta(lang, placement, headingId = "app-cta") {
  const copy = ui[lang].cta;
  const ct = campaign(lang, placement);

  return `
      <section class="cr-cta" aria-labelledby="${headingId}">
        <div class="cr-cta-copy">
          <p class="cr-eyebrow">${esc(copy.eyebrow)}</p>
          <h2 id="${headingId}" class="cr-h2">${esc(copy.title)}</h2>
          <p>${esc(copy.body)}</p>
          <ul class="cr-checklist">
${copy.bullets.map((bullet) => `            <li>${esc(bullet)}</li>`).join("\n")}
          </ul>
          <a class="store-button cr-store" href="${appStoreUrl(ct)}" data-cta="${ct}">
            <img src="/assets/appstore.svg" alt="${esc(copy.badgeAlt)}" width="156" height="52">
          </a>
          <p class="cr-cta-note">${esc(copy.android)}</p>
        </div>
        <img class="cr-cta-phone" src="/assets/mock-exam.png" alt="" width="471" height="1024" loading="lazy" decoding="async">
      </section>`;
}

function topicPillList(model, lang, currentTopic) {
  return `
        <ul class="cr-pills">
${model.topics
  .filter((topic) => topic.id !== currentTopic)
  .map((topic) => `          <li><a href="${topic.path[lang]}">${esc(topic[lang])}</a></li>`)
  .join("\n")}
        </ul>`;
}

function questionLinkItem(question, lang) {
  return `<li><a href="${question.path[lang]}"><span class="cr-qnum">${question.number}.</span> ${esc(question[lang].prompt)}</a></li>`;
}

// ---------- Question pages ----------

function byStateTable(question, model, lang) {
  const copy = ui[lang].questionPage;
  const answers = question[lang].answers;
  const rows = model.jurisdictions.map((place) => {
    let value;

    if (question.office === "state-us-senator") {
      value = place.isState ? place.senators.join(", ") : answers[1];
    } else if (question.office === "state-governor") {
      value = place.code === "DC" ? answers[1] : place.governor ?? copy.none;
    } else if (question.office === "state-capital") {
      value = place.capital ?? answers[1];
    }

    return `            <tr><th scope="row">${esc(place.name)}</th><td>${esc(value)}</td></tr>`;
  });

  return `
        <section class="cr-section" aria-labelledby="by-state">
          <h2 id="by-state" class="cr-h2">${esc(copy.byState)}</h2>
          <p class="cr-muted">${esc(copy.currentAsOf(formatDate(model.meta.stateOfficesUpdated, lang)))}</p>
          <div class="cr-table-wrap">
            <table class="cr-table">
              <thead><tr><th scope="col">${esc(copy.stateColumn)}</th><th scope="col">${esc(copy.currentAnswer)}</th></tr></thead>
              <tbody>
${rows.join("\n")}
              </tbody>
            </table>
          </div>
        </section>`;
}

function representativesByState(question, model, lang) {
  const copy = ui[lang].questionPage;
  const answers = question[lang].answers;
  const items = model.jurisdictions.map((place) => {
    const districts = Object.entries(place.representatives)
      .map(([district, name]) => [Number(district), name])
      .concat(place.vacantDistricts.map((district) => [district, null]))
      .sort((left, right) => left[0] - right[0]);

    if (!place.isState) {
      const delegate = districts[0]?.[1];
      return `            <li><strong>${esc(place.name)}:</strong> ${esc(answers[1])}${delegate ? ` (${esc(delegate)})` : ""}</li>`;
    }

    if (districts.length === 1) {
      return `            <li><strong>${esc(place.name)}</strong> (${esc(copy.atLarge)}): ${esc(districts[0][1] ?? copy.vacant)}</li>`;
    }

    return `            <li>
              <details>
                <summary><strong>${esc(place.name)}</strong> · ${esc(copy.districtsSummary(districts.length))}</summary>
                <ol class="cr-districts">
${districts
  .map(([district, name]) => `                  <li value="${district}">${esc(name ?? copy.vacant)}</li>`)
  .join("\n")}
                </ol>
              </details>
            </li>`;
  });

  return `
        <section class="cr-section" aria-labelledby="by-state">
          <h2 id="by-state" class="cr-h2">${esc(copy.byState)}</h2>
          <p class="cr-muted">${esc(copy.currentAsOf(formatDate(model.meta.stateOfficesUpdated, lang)))} ${copy.findRep}</p>
          <ul class="cr-state-list">
${items.join("\n")}
          </ul>
        </section>`;
}

function tryItSection(question, lang) {
  const copy = ui[lang].questionPage;
  const quiz = quizUi[lang];
  const choices = question[lang].choices;

  if (!choices) {
    return "";
  }

  const isMulti = question.count > 1;

  return `
        <section class="cr-section cr-check" data-check data-count="${question.count}" data-correct-text="${esc(quiz.correct)}" data-incorrect-text="${esc(quiz.incorrect)}" aria-labelledby="try-it">
          <h2 id="try-it" class="cr-h2">${esc(copy.tryIt)}</h2>
          <p class="cr-muted">${esc(isMulti ? copy.tryItMulti(question.count) : copy.tryItSingle)}</p>
          <div class="cr-choices">
${choices
  .map(
    (choice) =>
      `            <button type="button" class="cr-choice" data-correct="${choice.correct ? 1 : 0}" aria-pressed="false">${esc(choice.label)}</button>`
  )
  .join("\n")}
          </div>
${isMulti ? `          <button type="button" class="button button-primary cr-check-button" data-check-submit disabled>${esc(copy.check)}</button>\n` : ""}          <p class="cr-feedback" data-feedback aria-live="polite"></p>
        </section>`;
}

function questionPage(question, model, lang) {
  const copy = ui[lang].questionPage;
  const topic = model.topicsById[question.topic];
  const text = question[lang];
  const index = model.questions.indexOf(question);
  const previous = model.questions[index - 1];
  const next = model.questions[index + 1];
  const sameTopic = model.questions.filter((item) => item.topic === question.topic && item !== question);
  const position = sameTopic.findIndex((item) => item.number > question.number);
  const start = Math.max(0, Math.min((position === -1 ? sameTopic.length : position) - 3, sameTopic.length - 6));
  const related = sameTopic.slice(start, start + 6);
  const path = question.path[lang];
  const crumbs = [
    { name: ui[lang].home, path: paths[lang].home },
    { name: ui[lang].nav.questions, path: paths[lang].questions },
    { name: topic[lang], path: topic.path[lang] },
    { name: lang === "en" ? `Question ${question.number}` : `Pregunta ${question.number}`, path }
  ];
  const wrongAnswers = (text.choices ?? []).filter((choice) => !choice.correct);
  const currentName = question.kind === "current-office" ? currentOfficeName(question, model.meta) : null;
  const answersList = text.answers
    .map((answer, answerIndex) => {
      const english = question.en.answers[answerIndex];
      return lang === "es" && english !== answer
        ? `            <li>${esc(answer)} <span class="cr-english" lang="en">${esc(english)}</span></li>`
        : `            <li>${esc(answer)}</li>`;
    })
    .join("\n");

  let stateSection = "";

  if (question.kind === "jurisdiction") {
    stateSection =
      question.office === "us-representative"
        ? representativesByState(question, model, lang)
        : byStateTable(question, model, lang);
  }

  const leadAnswer = currentName ?? text.answers.slice(0, Math.max(question.count, 1)).join(", ");
  const description = truncate(
    lang === "en"
      ? `Answer: ${leadAnswer}. ${text.explanation} Question ${question.number} of the 128 official USCIS civics questions (2025 test).`
      : `Respuesta: ${leadAnswer}. ${text.explanation} Pregunta ${question.number} de las 128 preguntas oficiales de USCIS (2025).`,
    160
  );
  const title =
    lang === "en"
      ? `${text.prompt} | U.S. Citizenship Test`
      : `${text.prompt} | Examen de ciudadanía`;

  const body = `${breadcrumbs(crumbs, ui[lang].breadcrumbLabel)}
      <article class="cr-page cr-question">
        <p class="cr-kicker">${esc(copy.kicker(question.number))} · <a href="${topic.path[lang]}">${esc(topic[lang])}</a></p>
        <h1>${esc(text.prompt)}</h1>
${lang === "es" ? `        <p class="cr-english cr-english-lead" lang="en"><span>${esc(copy.inEnglish)}:</span> ${esc(question.en.prompt)}</p>\n` : ""}
        <section class="cr-answer-card" aria-labelledby="official-answers">
          <h2 id="official-answers">${esc(copy.officialAnswers)}</h2>
          <p class="cr-muted">${esc(answerNote(question, lang))}</p>
          <ul class="cr-answers">
${answersList}
          </ul>
${
  currentName
    ? `          <p class="cr-current"><strong>${esc(copy.currentAnswer)}:</strong> ${esc(currentName)}</p>
          <p class="cr-muted">${esc(copy.currentAsOf(formatDate(model.meta.federalOfficesUpdated, lang)))}</p>\n`
    : ""
}        </section>

        <section class="cr-section" aria-labelledby="explanation">
          <h2 id="explanation" class="cr-h2">${esc(copy.explanation)}</h2>
          <p>${esc(text.explanation)}</p>
        </section>
${stateSection}${tryItSection(question, lang)}
${
  wrongAnswers.length
    ? `
        <section class="cr-section" aria-labelledby="not-correct">
          <h2 id="not-correct" class="cr-h2">${esc(copy.notCorrect)}</h2>
          <p class="cr-muted">${esc(copy.notCorrectNote)}</p>
          <ul class="cr-wrong">
${wrongAnswers.map((choice) => `            <li>${esc(choice.label)}</li>`).join("\n")}
          </ul>
        </section>`
    : ""
}

        <nav class="cr-prev-next" aria-label="${esc(lang === "en" ? "Question navigation" : "Navegación de preguntas")}">
${previous ? `          <a href="${previous.path[lang]}" rel="prev"><span>${esc(copy.previous)}</span>${esc(previous[lang].prompt)}</a>` : "          <span></span>"}
${next ? `          <a href="${next.path[lang]}" rel="next"><span>${esc(copy.next)}</span>${esc(next[lang].prompt)}</a>` : "          <span></span>"}
        </nav>

        <section class="cr-section" aria-labelledby="related">
          <h2 id="related" class="cr-h2">${esc(copy.related)}</h2>
          <ul class="cr-qlist">
${related.map((item) => `            ${questionLinkItem(item, lang)}`).join("\n")}
          </ul>
          <p class="cr-actions">
            <a class="button button-primary" href="${paths[lang].practice}?topic=${question.topic}">${esc(copy.practiceTopic(topic[lang]))}</a>
            <a class="button button-secondary" href="${question.path[other(lang)]}" hreflang="${other(lang)}">${esc(lang === "en" ? copy.spanishLink : copy.englishLink)}</a>
          </p>
        </section>
${appCta(lang, "question")}
      </article>`;

  return {
    path,
    html: uscisPage({
      lang,
      path,
      title,
      description,
      alternates: question.path,
      ui: ui[lang],
      body,
      head: breadcrumbJsonLd(crumbs),
      scripts: ["/assets/js/uscis-quiz.js"],
      ogType: "article"
    })
  };
}

// ---------- Question list and topic pages ----------

function listAnswers(question, model, lang) {
  const copy = ui[lang].listPage;
  const text = question[lang];

  if (question.kind === "jurisdiction") {
    return `<p class="cr-list-answer"><a href="${question.path[lang]}#by-state">${esc(copy.variesByState)}</a></p>`;
  }

  const current =
    question.kind === "current-office"
      ? ` <strong>${esc(copy.currentNote(currentOfficeName(question, model.meta), formatDate(model.meta.federalOfficesUpdated, lang)))}</strong>`
      : "";

  return `<ul class="cr-list-answers">${text.answers.map((answer) => `<li>${esc(answer)}</li>`).join("")}</ul>${current ? `<p class="cr-list-answer">${current}</p>` : ""}`;
}

function questionListItem(question, model, lang) {
  return `
            <li class="cr-list-item" id="q${question.number}">
              <h3><a href="${question.path[lang]}"><span class="cr-qnum">${question.number}.</span> ${esc(question[lang].prompt)}</a></h3>
${lang === "es" ? `              <p class="cr-english" lang="en">${esc(question.en.prompt)}</p>\n` : ""}              ${listAnswers(question, model, lang)}
            </li>`;
}

function listPage(model, lang) {
  const copy = ui[lang].listPage;
  const path = paths[lang].questions;
  const crumbs = [
    { name: ui[lang].home, path: paths[lang].home },
    { name: ui[lang].nav.questions, path }
  ];

  const sections = model.topics
    .map((topic) => {
      const questions = model.questions.filter((question) => question.topic === topic.id);
      return `
        <section class="cr-section cr-topic-block" id="${topic.slug[lang]}" aria-labelledby="h-${topic.slug[lang]}">
          <h2 id="h-${topic.slug[lang]}" class="cr-h2"><a href="${topic.path[lang]}">${esc(topic[lang])}</a> <span class="cr-count">${esc(copy.questionsInTopic(questions.length))}</span></h2>
          <ol class="cr-list">
${questions.map((question) => questionListItem(question, model, lang)).join("\n")}
          </ol>
        </section>`;
    })
    .join("\n");

  const body = `${breadcrumbs(crumbs, ui[lang].breadcrumbLabel)}
      <article class="cr-page">
        <header class="cr-page-header">
          <h1>${esc(copy.title)}</h1>
          <p class="lead">${esc(copy.intro)}</p>
          <p class="cr-actions cr-no-print">
            <a class="button button-primary" href="${paths[lang].practice}">${esc(copy.practiceCta)}</a>
            <a class="button button-secondary" href="${copy.pdfPath}" data-pdf>${esc(copy.pdf)}</a>
          </p>
        </header>
        <nav class="cr-toc cr-no-print" aria-label="${esc(copy.jump)}">
          <h2 class="cr-toc-title">${esc(copy.jump)}</h2>
          <ul class="cr-pills">
${model.topics.map((topic) => `            <li><a href="#${topic.slug[lang]}">${esc(topic[lang])}</a></li>`).join("\n")}
          </ul>
        </nav>
${sections}
${appCta(lang, "list")}
      </article>`;

  return {
    path,
    html: uscisPage({
      lang,
      path,
      title: copy.metaTitle,
      description: copy.description,
      alternates: { en: paths.en.questions, es: paths.es.questions },
      ui: ui[lang],
      body,
      head: breadcrumbJsonLd(crumbs),
      scripts: ["/assets/js/uscis-quiz.js"]
    })
  };
}

function topicPage(topic, model, lang) {
  const copy = ui[lang].topicPage;
  const questions = model.questions.filter((question) => question.topic === topic.id);
  const path = topic.path[lang];
  const crumbs = [
    { name: ui[lang].home, path: paths[lang].home },
    { name: ui[lang].nav.questions, path: paths[lang].questions },
    { name: topic[lang], path }
  ];

  const body = `${breadcrumbs(crumbs, ui[lang].breadcrumbLabel)}
      <article class="cr-page">
        <header class="cr-page-header">
          <h1>${esc(copy.title(topic[lang]))}</h1>
          <p class="lead">${esc(copy.intro(topic[lang], questions.length, questions[0].number, questions[questions.length - 1].number))}</p>
          <p class="cr-actions">
            <a class="button button-primary" href="${paths[lang].practice}?topic=${topic.id}">${esc(copy.practice(topic[lang]))}</a>
            <a class="button button-secondary" href="${paths[lang].questions}">${esc(copy.allQuestions)}</a>
          </p>
        </header>
        <section class="cr-section" aria-label="${esc(topic[lang])}">
          <ol class="cr-list">
${questions.map((question) => questionListItem(question, model, lang)).join("\n")}
          </ol>
        </section>
        <nav class="cr-section" aria-labelledby="other-topics">
          <h2 id="other-topics" class="cr-h2">${esc(copy.otherTopics)}</h2>
${topicPillList(model, lang, topic.id)}
        </nav>
${appCta(lang, "topic")}
      </article>`;

  return {
    path,
    html: uscisPage({
      lang,
      path,
      title: copy.metaTitle(topic[lang]),
      description: copy.description(topic[lang], questions.length),
      alternates: topic.path,
      ui: ui[lang],
      body,
      head: breadcrumbJsonLd(crumbs)
    })
  };
}

// ---------- Practice test ----------

function practiceTestPage(model, lang) {
  const copy = practicePage[lang];
  const path = paths[lang].practice;
  const crumbs = [
    { name: ui[lang].home, path: paths[lang].home },
    { name: ui[lang].nav.practice, path }
  ];
  // A fixed, varied sample so the page has indexable questions and answers.
  const sampleNumbers = [2, 7, 16, 21, 47, 65, 79, 83, 100, 123];
  const samples = sampleNumbers.map((number) => model.questions.find((question) => question.number === number));
  const config = {
    lang,
    ui: quizUi[lang],
    dataUrl: "/data/uscis-questions.json",
    statesUrl: "/data/uscis-states/",
    jurisdictions: model.jurisdictions.map((place) => ({
      code: place.code,
      name: place.name,
      districts: place.districts
    })),
    links: Object.fromEntries(model.questions.map((question) => [question.number, question.path[lang]])),
    appStoreUrl: appStoreUrl(campaign(lang, "quiz-results")),
    campaign: campaign(lang, "quiz-results"),
    mockQuestionCount: 20,
    mockPassingCount: 12
  };

  const body = `${breadcrumbs(crumbs, ui[lang].breadcrumbLabel)}
      <article class="cr-page">
        <header class="cr-page-header">
          <h1>${esc(copy.h1)}</h1>
          <p class="lead">${esc(copy.lead)}</p>
        </header>

        <section class="cr-quiz" id="quiz" data-quiz aria-live="polite">
          <p class="cr-muted">${esc(quizUi[lang].loading)}</p>
          <noscript><p>${copy.noscript}</p></noscript>
        </section>
        <script type="application/json" id="cr-quiz-config">${JSON.stringify(config).replace(/</g, "\\u003c")}</script>

        <section class="cr-section" aria-labelledby="how-it-works">
          <h2 id="how-it-works" class="cr-h2">${esc(copy.howTitle)}</h2>
          <ul class="cr-bullets">
${copy.how.map((item) => `            <li>${item}</li>`).join("\n")}
          </ul>
          <p class="cr-muted">${esc(copy.stateNote)}</p>
        </section>

        <section class="cr-section" aria-labelledby="samples">
          <h2 id="samples" class="cr-h2">${esc(copy.sampleTitle)}</h2>
          <p>${esc(copy.sampleIntro)}</p>
          <div class="cr-samples">
${samples
  .map(
    (question) => `            <details class="faq-item">
              <summary>${question.number}. ${esc(question[lang].prompt)}</summary>
              <p>${esc(question[lang].answers.join(" · "))} · <a href="${question.path[lang]}">${esc(quizUi[lang].learnMore)}</a></p>
            </details>`
  )
  .join("\n")}
          </div>
          <p class="cr-actions"><a class="button button-secondary" href="${paths[lang].questions}">${esc(copy.sampleMore)}</a></p>
        </section>
${faqList(copy.faqs, copy.faqTitle)}
${appCta(lang, "practice")}
      </article>`;

  return {
    path,
    html: uscisPage({
      lang,
      path,
      title: copy.metaTitle,
      description: copy.description,
      alternates: { en: paths.en.practice, es: paths.es.practice },
      ui: ui[lang],
      body,
      head: [
        breadcrumbJsonLd(crumbs),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Quiz",
          name: copy.h1,
          description: copy.description,
          inLanguage: lang,
          url: `${SITE_URL}${path}`,
          isAccessibleForFree: true,
          educationalLevel: "Adult",
          about: { "@type": "Thing", name: "U.S. naturalization civics test" },
          provider: { "@type": "Organization", name: "Elevix Apps", url: SITE_URL }
        }),
        faqJsonLd(copy.faqs)
      ].join("\n    "),
      scripts: ["/assets/js/uscis-quiz.js"]
    })
  };
}

// ---------- Guide ----------

function guideArticle(model, lang) {
  const copy = guidePage[lang];
  const path = paths[lang].guide;
  const crumbs = [
    { name: ui[lang].home, path: paths[lang].home },
    { name: ui[lang].nav.guide, path }
  ];

  const sections = copy.sections
    .map((section, index) => {
      const id = `s${index + 1}`;
      const paragraphs = (section.body ?? []).map((paragraph) => `          <p>${paragraph}</p>`).join("\n");
      const list = section.list
        ? `          <ol class="cr-bullets">\n${section.list.map((item) => `            <li>${item}</li>`).join("\n")}\n          </ol>`
        : "";
      const topics = section.topicList
        ? `          <ul class="cr-pills">\n${model.topics
            .map(
              (topic) =>
                `            <li><a href="${topic.path[lang]}">${esc(topic[lang])} (${model.questions.filter((q) => q.topic === topic.id).length})</a></li>`
            )
            .join("\n")}\n          </ul>`
        : "";
      return `
        <section class="cr-section" aria-labelledby="${id}">
          <h2 id="${id}" class="cr-h2">${esc(section.heading)}</h2>
${[paragraphs, list, topics].filter(Boolean).join("\n")}
        </section>`;
    })
    .join("\n");

  const body = `${breadcrumbs(crumbs, ui[lang].breadcrumbLabel)}
      <article class="cr-page cr-prose">
        <header class="cr-page-header">
          <h1>${esc(copy.h1)}</h1>
          <p class="lead">${esc(copy.lead)}</p>
          <p class="cr-actions">
            <a class="button button-primary" href="${paths[lang].practice}">${esc(ui[lang].nav.practice)}</a>
            <a class="button button-secondary" href="${paths[lang].questions}">${esc(ui[lang].nav.questions)}</a>
          </p>
        </header>
${sections}
${faqList(copy.faqs, copy.faqTitle)}
${appCta(lang, "guide")}
      </article>`;

  return {
    path,
    html: uscisPage({
      lang,
      path,
      title: copy.metaTitle,
      description: copy.description,
      alternates: { en: paths.en.guide, es: paths.es.guide },
      ui: ui[lang],
      body,
      head: [
        breadcrumbJsonLd(crumbs),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: copy.h1,
          description: copy.description,
          inLanguage: lang,
          dateModified: model.buildDate,
          author: { "@type": "Organization", name: "Elevix Apps", url: SITE_URL },
          publisher: { "@type": "Organization", name: "Elevix Apps", url: SITE_URL }
        }),
        faqJsonLd(copy.faqs)
      ].join("\n    "),
      ogType: "article"
    })
  };
}

// ---------- App landing ----------

function landing(model, lang) {
  const copy = landingPage[lang];
  const path = paths[lang].home;
  const ct = campaign(lang, "home");

  const features = copy.features
    .map(
      (feature) => `
        <article class="feature">
          <div class="feature-media">
            <img src="/assets/${feature.image}" alt="${esc(feature.alt)}" width="471" height="1024" loading="lazy" decoding="async">
          </div>
          <div class="feature-copy">
            <h2>${esc(feature.title)}</h2>
            <p>${feature.body}</p>
          </div>
        </article>`
    )
    .join("\n");

  const body = `
      <section class="home-hero">
        <div class="site-shell hero-stack">
          <div class="brand-line">
            <img src="/assets/icon.png" alt="" width="500" height="500">
            <span>${APP_NAME}</span>
          </div>
          <div class="hero-content">
            <h1>${esc(copy.h1)}</h1>
            <p class="lead">${esc(copy.lead)}</p>
            <div class="store-buttons">
              <a class="store-button" href="${appStoreUrl(ct)}" data-cta="${ct}">
                <img src="/assets/appstore.svg" alt="${esc(ui[lang].cta.badgeAlt)}" width="156" height="52">
              </a>
            </div>
            <p class="store-note"><a href="${paths[lang].practice}">${esc(copy.freeLink)} &rarr;</a></p>
          </div>
          <img class="hero-phone" src="/assets/${lang === "es" ? "spanish-study.png" : "pass-citizenship-test.png"}" alt="${esc(copy.features[0].alt)}" width="471" height="1024">
        </div>
      </section>

      <section class="site-shell cr-free-band" aria-labelledby="free-online">
        <h2 id="free-online" class="cr-h2">${esc(copy.freeTitle)}</h2>
        <p>${esc(copy.freeBody)}</p>
        <p class="cr-actions">
          <a class="button button-primary" href="${paths[lang].practice}">${esc(copy.freePractice)}</a>
          <a class="button button-secondary" href="${paths[lang].questions}">${esc(copy.freeList)}</a>
        </p>
      </section>

      <section class="site-shell feature-list" aria-label="${esc(APP_NAME)}">
${features}
      </section>

      <div class="site-shell">
${faqList(copy.faqs, copy.faqTitle)}
      </div>`;

  return {
    path,
    html: uscisPage({
      lang,
      path,
      title: copy.metaTitle,
      description: copy.description,
      alternates: { en: paths.en.home, es: paths.es.home },
      ui: ui[lang],
      body,
      head: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: APP_NAME,
          applicationCategory: "EducationalApplication",
          operatingSystem: "iOS",
          inLanguage: ["en-US", "es"],
          description: landingPage.en.description,
          image: `${SITE_URL}/assets/icon.png`,
          screenshot: landingPage.en.features.map((feature) => `${SITE_URL}/assets/${feature.image}`),
          installUrl: `https://apps.apple.com/us/app/citizen-ready-uscis-prep/id6778953719`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "Elevix Apps", url: SITE_URL }
        }),
        breadcrumbJsonLd([
          { name: "Elevix Apps", path: "/" },
          { name: APP_NAME, path }
        ]),
        faqJsonLd(copy.faqs)
      ].join("\n    ")
    })
  };
}

export function buildUscisPages(model) {
  const pages = [];

  for (const lang of ["en", "es"]) {
    pages.push(landing(model, lang));
    pages.push(practiceTestPage(model, lang));
    pages.push(listPage(model, lang));
    pages.push(guideArticle(model, lang));

    for (const topic of model.topics) {
      pages.push(topicPage(topic, model, lang));
    }

    for (const question of model.questions) {
      pages.push(questionPage(question, model, lang));
    }
  }

  return pages;
}

export function prepareModel(questionData, jurisdictionData, buildDate) {
  const topics = questionData.topics.map((topic) => {
    const slug = topicSlugs[topic.id];
    return { ...topic, slug, path: { en: paths.en.topic(slug.en), es: paths.es.topic(slug.es) } };
  });
  const usedSlugs = { en: new Set(), es: new Set() };
  const uniqueSlug = (lang, base, number) => {
    const slug = usedSlugs[lang].has(base) ? `${base}-${number}` : base;
    usedSlugs[lang].add(slug);
    return slug;
  };
  const questions = questionData.questions.map((question) => {
    const slug = {
      en: uniqueSlug("en", slugify(question.en.prompt), question.number),
      es: uniqueSlug("es", slugify(question.es.prompt), question.number)
    };
    return { ...question, slug, path: { en: paths.en.question(slug.en), es: paths.es.question(slug.es) } };
  });

  return {
    buildDate,
    meta: questionData.meta,
    topics,
    topicsById: Object.fromEntries(topics.map((topic) => [topic.id, topic])),
    questions,
    jurisdictions: jurisdictionData.jurisdictions
  };
}

