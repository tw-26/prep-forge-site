// English and Spanish copy for the Citizen Ready web pages.
// Facts about the 2025 civics test follow uscis.gov; re-check them when USCIS updates the test.

export const paths = {
  en: {
    home: "/uscis/",
    practice: "/uscis/practice-test/",
    questions: "/uscis/civics-questions/",
    topic: (slug) => `/uscis/civics-questions/${slug}/`,
    question: (slug) => `/uscis/questions/${slug}/`,
    guide: "/uscis/citizenship-test-guide/"
  },
  es: {
    home: "/uscis/es/",
    practice: "/uscis/es/examen-de-ciudadania/",
    questions: "/uscis/es/preguntas-de-ciudadania/",
    topic: (slug) => `/uscis/es/preguntas-de-ciudadania/${slug}/`,
    question: (slug) => `/uscis/es/preguntas/${slug}/`,
    guide: "/uscis/es/guia-examen-de-ciudadania/"
  }
};

// Shorter, keyword-friendly slugs than the full topic names.
export const topicSlugs = {
  "principles-of-american-government": { en: "principles-of-american-government", es: "principios-del-gobierno" },
  "system-of-government": { en: "system-of-government", es: "sistema-de-gobierno" },
  "rights-and-responsibilities": { en: "rights-and-responsibilities", es: "derechos-y-responsabilidades" },
  "colonial-period-and-independence": { en: "colonial-period-and-independence", es: "periodo-colonial-e-independencia" },
  "1800s": { en: "1800s", es: "siglo-xix" },
  "recent-american-history-and-other-important-historical-information": { en: "recent-american-history", es: "historia-reciente" },
  symbols: { en: "symbols", es: "simbolos" },
  holidays: { en: "holidays", es: "dias-festivos" }
};

const navFor = (lang) => ({
  homePath: { en: paths.en.home, es: paths.es.home },
  practicePath: paths[lang].practice,
  questionsPath: paths[lang].questions,
  guidePath: paths[lang].guide
});

export const ui = {
  en: {
    nav: {
      ...navFor("en"),
      label: "Citizen Ready",
      skip: "Skip to content",
      practice: "Practice test",
      questions: "128 questions",
      guide: "Test guide",
      switchLanguage: "Español"
    },
    footer: {
      label: "Footer",
      tagline: "free U.S. citizenship test practice by Elevix Apps.",
      app: "The app",
      terms: "Terms",
      privacy: "Privacy",
      support: "Support",
      allApps: "All Elevix apps",
      disclaimer:
        'Citizen Ready is an independent study tool and is not affiliated with USCIS or the U.S. government. Questions and answers come from the official <a href="https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test" rel="noopener">2025 USCIS civics test</a> list.'
    },
    breadcrumbLabel: "Breadcrumb",
    home: "Citizen Ready",
    cta: {
      eyebrow: "Keep your progress",
      title: "Study on your phone with Citizen Ready",
      body: "The free web practice doesn't save anything. The app remembers what you've mastered, brings back the questions you miss, and gets you ready for your interview date.",
      bullets: [
        "Progress and mastery saved on your phone",
        "Smart review of the questions you miss",
        "Answers for your own state and district",
        "Study offline, anytime"
      ],
      badgeAlt: "Download on the App Store",
      android: "Android version coming soon. Until then, keep practicing free here."
    },
    questionPage: {
      kicker: (number) => `Civics test question ${number} of 128`,
      officialAnswers: "Official USCIS answers",
      officialAnswersNote: {
        any1: "Give any one of these answers.",
        anyN: (count) => `Give any ${count} of these answers.`,
        allN: (count) => `Give all ${count} answers.`
      },
      explanation: "Why this is the answer",
      tryIt: "Try it yourself",
      tryItSingle: "Pick the correct answer.",
      tryItMulti: (count) => `Pick ${count} correct answers, then check.`,
      check: "Check",
      notCorrect: "Answers that are not correct",
      notCorrectNote: "These wrong answers are common mix-ups. They are not accepted at the interview.",
      topic: "Topic",
      related: "More questions on this topic",
      previous: "Previous question",
      next: "Next question",
      practiceTopic: (topic) => `Practice all ${topic} questions`,
      spanishLink: "Read this question in Spanish",
      currentAsOf: (date) => `Current as of ${date}. USCIS asks for the person serving on the day of your interview.`,
      currentAnswer: "Current answer",
      byState: "Answer by state and territory",
      stateColumn: "State or territory",
      districtsSummary: (count) => `${count} districts`,
      atLarge: "At-large",
      vacant: "Vacant",
      none: "None",
      findRep: 'Not sure of your district? Look it up with your ZIP code at <a href="https://www.house.gov/representatives/find-your-representative" rel="noopener">house.gov</a>.'
    },
    listPage: {
      title: "All 128 Civics Questions and Answers (2025 Test)",
      metaTitle: "128 Civics Questions and Answers for the 2025 Citizenship Test (Free)",
      description:
        "All 128 official USCIS civics questions and answers for the 2025 U.S. citizenship test, organized by topic. Free, printable, with a practice test for every topic.",
      intro:
        "These are all 128 civics questions from the official 2025 USCIS list. At your interview, the officer asks up to 20 of them out loud, and you need 12 correct answers to pass. Click any question for an explanation, or test yourself with the free practice test.",
      jump: "Jump to a topic",
      pdf: "Download the PDF",
      pdfPath: "/uscis/128-civics-questions-and-answers.pdf",
      practiceCta: "Take the free practice test",
      variesByState: "Answer depends on where you live. See answers by state.",
      currentNote: (name, date) => `As of ${date}: ${name}.`,
      questionsInTopic: (count) => `${count} questions`
    },
    topicPage: {
      title: (topic) => `${topic}: Citizenship Test Questions and Answers`,
      metaTitle: (topic) => `${topic} Civics Questions and Answers | Citizenship Test 2025`,
      description: (topic, count) =>
        `All ${count} ${topic} questions from the 2025 USCIS civics test, with official answers and explanations. Practice them free online.`,
      intro: (topic, count, first, last) =>
        `The 2025 civics test has ${count} questions about ${topic}, numbers ${first} to ${last} on the official USCIS list. Each one below shows the accepted answers. Open a question for a plain-English explanation.`,
      practice: (topic) => `Practice ${topic} questions`,
      allQuestions: "See all 128 questions",
      otherTopics: "Other topics"
    }
  },
  es: {
    nav: {
      ...navFor("es"),
      label: "Citizen Ready",
      skip: "Ir al contenido",
      practice: "Examen de práctica",
      questions: "128 preguntas",
      guide: "Guía del examen",
      switchLanguage: "English"
    },
    footer: {
      label: "Pie de página",
      tagline: "práctica gratis para el examen de ciudadanía de EE. UU., por Elevix Apps.",
      app: "La app",
      terms: "Términos (inglés)",
      privacy: "Privacidad (inglés)",
      support: "Soporte",
      allApps: "Todas las apps de Elevix",
      disclaimer:
        'Citizen Ready es una herramienta de estudio independiente y no está afiliada con USCIS ni con el gobierno de EE. UU. Las preguntas y respuestas vienen de la lista oficial del <a href="https://www.uscis.gov/es/ciudadania" rel="noopener">examen de educación cívica de USCIS (versión 2025)</a>.'
    },
    breadcrumbLabel: "Ruta de navegación",
    home: "Citizen Ready",
    cta: {
      eyebrow: "Guarde su progreso",
      title: "Estudie en su teléfono con Citizen Ready",
      body: "La práctica gratis en la web no guarda nada. La app recuerda lo que ya domina, le repite las preguntas que falla y le prepara para el día de su entrevista.",
      bullets: [
        "Su progreso guardado en el teléfono",
        "Repaso inteligente de las preguntas que falla",
        "Modo de estudio en español con el texto oficial en inglés",
        "Respuestas de su estado y distrito"
      ],
      badgeAlt: "Descargar en el App Store",
      android: "La versión para Android llegará pronto. Mientras tanto, siga practicando gratis aquí."
    },
    questionPage: {
      kicker: (number) => `Pregunta ${number} de 128 del examen de educación cívica`,
      officialAnswers: "Respuestas oficiales de USCIS",
      officialAnswersNote: {
        any1: "Dé cualquiera de estas respuestas.",
        anyN: (count) => `Dé ${count} de estas respuestas.`,
        allN: (count) => `Dé las ${count} respuestas.`
      },
      inEnglish: "En inglés (así se pregunta en la entrevista)",
      explanation: "Por qué es la respuesta",
      tryIt: "Póngase a prueba",
      tryItSingle: "Elija la respuesta correcta.",
      tryItMulti: (count) => `Elija ${count} respuestas correctas y luego revise.`,
      check: "Revisar",
      notCorrect: "Respuestas que no son correctas",
      notCorrectNote: "Estas respuestas incorrectas se confunden con frecuencia. No se aceptan en la entrevista.",
      topic: "Tema",
      related: "Más preguntas de este tema",
      previous: "Pregunta anterior",
      next: "Pregunta siguiente",
      practiceTopic: (topic) => `Practicar las preguntas de ${topic}`,
      englishLink: "Ver esta pregunta en inglés",
      currentAsOf: (date) => `Vigente al ${date}. USCIS pide el nombre de la persona en el cargo el día de su entrevista.`,
      currentAnswer: "Respuesta actual",
      byState: "Respuesta por estado y territorio",
      stateColumn: "Estado o territorio",
      districtsSummary: (count) => `${count} distritos`,
      atLarge: "Distrito único",
      vacant: "Vacante",
      none: "Ninguno",
      findRep: '¿No sabe cuál es su distrito? Búsquelo con su código postal en <a href="https://www.house.gov/representatives/find-your-representative" rel="noopener">house.gov</a> (en inglés).'
    },
    listPage: {
      title: "Las 128 preguntas de la ciudadanía en español e inglés (2025)",
      metaTitle: "Las 128 preguntas de la ciudadanía 2025 en español e inglés (gratis)",
      description:
        "Las 128 preguntas y respuestas oficiales del examen de ciudadanía de USCIS (versión 2025) en español, con el texto en inglés de la entrevista. Gratis e imprimible.",
      intro:
        "Estas son las 128 preguntas de educación cívica de la lista oficial 2025 de USCIS. En la entrevista, el oficial le hace hasta 20 preguntas en inglés y necesita 12 respuestas correctas para aprobar. Por eso cada pregunta muestra también el texto en inglés.",
      jump: "Ir a un tema",
      pdf: "Descargar el PDF",
      pdfPath: "/uscis/128-preguntas-de-la-ciudadania.pdf",
      practiceCta: "Hacer el examen de práctica gratis",
      variesByState: "La respuesta depende de dónde vive. Vea las respuestas por estado.",
      currentNote: (name, date) => `Al ${date}: ${name}.`,
      questionsInTopic: (count) => `${count} preguntas`
    },
    topicPage: {
      title: (topic) => `${topic}: preguntas y respuestas del examen de ciudadanía`,
      metaTitle: (topic) => `${topic}: preguntas de la ciudadanía 2025 en español`,
      description: (topic, count) =>
        `Las ${count} preguntas de ${topic} del examen de ciudadanía 2025, con respuestas oficiales en español e inglés. Practique gratis en línea.`,
      intro: (topic, count, first, last) =>
        `El examen de educación cívica 2025 tiene ${count} preguntas sobre ${topic}, los números ${first} a ${last} de la lista oficial de USCIS. Cada una muestra las respuestas aceptadas en español y en inglés.`,
      practice: (topic) => `Practicar ${topic}`,
      allQuestions: "Ver las 128 preguntas",
      otherTopics: "Otros temas"
    }
  }
};

export const practicePage = {
  en: {
    metaTitle: "Free U.S. Citizenship Practice Test 2026: All 128 Civics Questions",
    description:
      "Free U.S. citizenship practice test with all 128 official USCIS civics questions (2025 test). Practice by topic, use flashcards, or take a 20-question mock test. No sign-up.",
    h1: "Free U.S. Citizenship Practice Test",
    lead: "Practice all 128 official civics questions from the 2025 USCIS test. Pick a topic, flip through flashcards, or take a 20-question mock test that uses the real passing score of 12. Free, no sign-up.",
    howTitle: "How this practice test works",
    how: [
      "<strong>Practice</strong> asks multiple-choice questions and explains every answer right away.",
      "<strong>Flashcards</strong> show the question first. Say your answer out loud, then flip the card. This is closest to the real interview, which is spoken, not multiple choice.",
      "<strong>Mock test</strong> asks 20 random questions with no hints. You pass with 12 correct, the same as the real test."
    ],
    stateNote: "Four questions ask about your senators, your representative, your governor and your state capital. Choose your state to include them.",
    sampleTitle: "Sample questions with answers",
    sampleIntro: "Here are 10 questions from the official list. Open each one to see the answer.",
    sampleMore: "See all 128 questions and answers",
    faqTitle: "Practice test FAQ",
    faqs: [
      {
        question: "Is this citizenship practice test really free?",
        answer:
          "Yes. Every question, every mode and the mock test are free, with no account and no sign-up. The website doesn't save your progress. If you want progress tracking and review of missed questions, you can use the Citizen Ready app."
      },
      {
        question: "Is the real citizenship test multiple choice?",
        answer:
          'No. At your interview, a USCIS officer asks the questions out loud and you answer out loud. Use flashcard mode to practice that way. Read more in our <a href="/uscis/citizenship-test-guide/">citizenship test guide</a>.'
      },
      {
        question: "How many questions do I need to get right?",
        answer:
          "On the 2025 civics test, the officer asks up to 20 questions from the list of 128. You pass when you answer 12 correctly. The mock test here uses the same rule."
      },
      {
        question: "Are these the official USCIS questions?",
        answer:
          "Yes. The questions and accepted answers come from the official 2025 USCIS civics test list of 128 questions. Citizen Ready is independent and is not affiliated with USCIS."
      },
      {
        question: "Why do some answers depend on my state?",
        answer:
          'A few questions ask who your U.S. senators, U.S. representative and governor are, and what your state capital is. Choose your state (and district) before you start, or see the answers by state on the <a href="/uscis/civics-questions/">full question list</a>.'
      },
      {
        question: "Can I practice in Spanish?",
        answer:
          'Yes. The <a href="/uscis/es/examen-de-ciudadania/">Spanish practice test</a> shows each question in Spanish with the official English wording. The interview itself is in English for most applicants.'
      }
    ],
    noscript: 'The practice test needs JavaScript. You can still study <a href="/uscis/civics-questions/">all 128 questions and answers</a>.'
  },
  es: {
    metaTitle: "Examen de ciudadanía en español 2026: práctica gratis con las 128 preguntas",
    description:
      "Examen de práctica gratis para la ciudadanía americana con las 128 preguntas oficiales de USCIS en español e inglés. Practique por tema, con tarjetas o con un examen de 20 preguntas.",
    h1: "Examen de ciudadanía en español: práctica gratis",
    lead: "Practique las 128 preguntas oficiales del examen de educación cívica 2025 de USCIS en español, con el texto en inglés que escuchará en la entrevista. Elija un tema, use tarjetas o haga un examen de 20 preguntas con la nota real para aprobar (12). Gratis, sin registro.",
    howTitle: "Cómo funciona este examen de práctica",
    how: [
      "<strong>Práctica</strong>: preguntas de opción múltiple con la explicación de cada respuesta.",
      "<strong>Tarjetas</strong>: primero ve la pregunta, responde en voz alta y luego voltea la tarjeta. Es lo más parecido a la entrevista real, que es oral.",
      "<strong>Examen simulado</strong>: 20 preguntas al azar sin pistas. Aprueba con 12 correctas, igual que en el examen real."
    ],
    stateNote: "Cuatro preguntas son sobre sus senadores, su representante, su gobernador y la capital de su estado. Elija su estado para incluirlas.",
    sampleTitle: "Preguntas de ejemplo con respuestas",
    sampleIntro: "Estas son 10 preguntas de la lista oficial. Abra cada una para ver la respuesta.",
    sampleMore: "Ver las 128 preguntas y respuestas",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        question: "¿Este examen de práctica es gratis?",
        answer:
          "Sí. Todas las preguntas y todos los modos son gratis, sin cuenta y sin registro. La página web no guarda su progreso. Si quiere guardar su avance y repasar las preguntas que falla, puede usar la app Citizen Ready."
      },
      {
        question: "¿El examen de ciudadanía es en inglés o en español?",
        answer:
          "Para la mayoría de las personas, la entrevista y el examen de educación cívica son en inglés. Por eso aquí cada pregunta muestra también el texto oficial en inglés. Algunas personas mayores con muchos años de residencia pueden tomar el examen en su idioma; consulte las reglas en uscis.gov."
      },
      {
        question: "¿Cuántas preguntas tengo que contestar bien?",
        answer:
          "En el examen 2025, el oficial le hace hasta 20 preguntas de la lista de 128. Aprueba cuando contesta 12 correctamente. El examen simulado de esta página usa la misma regla."
      },
      {
        question: "¿El examen real es de opción múltiple?",
        answer:
          'No. El oficial de USCIS hace las preguntas en voz alta y usted responde en voz alta. Use el modo de tarjetas para practicar así. Lea más en nuestra <a href="/uscis/es/guia-examen-de-ciudadania/">guía del examen de ciudadanía</a>.'
      },
      {
        question: "¿Son las preguntas oficiales de USCIS?",
        answer:
          "Sí. Las preguntas y respuestas aceptadas vienen de la lista oficial de 128 preguntas del examen de educación cívica 2025 de USCIS. Citizen Ready es independiente y no está afiliada con USCIS."
      }
    ],
    noscript: 'El examen de práctica necesita JavaScript. Puede estudiar <a href="/uscis/es/preguntas-de-ciudadania/">las 128 preguntas y respuestas</a>.'
  }
};

export const guidePage = {
  en: {
    metaTitle: "U.S. Citizenship Test 2026: How Many Questions, Passing Score and What to Expect",
    description:
      "How the 2025 U.S. citizenship civics test works: 128 questions to study, up to 20 asked, 12 correct to pass. What changed, how the interview works, and how to prepare.",
    h1: "How the U.S. Citizenship Test Works",
    lead: "Everything you need to know about the civics part of the naturalization test: how many questions there are, how many you need to get right, and how to practice.",
    sections: [
      {
        heading: "How many questions are on the citizenship test?",
        body: [
          "The 2025 civics test has a study list of <strong>128 questions</strong>. At your interview, the USCIS officer asks you <strong>up to 20</strong> of them. You need <strong>12 correct answers to pass</strong>.",
          "The officer stops asking once you have answered 12 correctly, or once you have missed 9, since at that point the result is already decided."
        ]
      },
      {
        heading: "What changed with the 2025 civics test?",
        body: [
          "USCIS introduced the 2025 civics test for applicants who file Form N-400 on or after <strong>October 20, 2025</strong>. It replaced the 2008 test, which had 100 questions, asked 10 and required 6 correct answers.",
          'If you filed before that date, you take the 2008 version instead. Check your filing date and the latest rules on <a href="https://www.uscis.gov/citizenship/find-study-materials-and-resources/check-for-test-updates" rel="noopener">uscis.gov</a>.'
        ]
      },
      {
        heading: "Is the citizenship test multiple choice?",
        body: [
          "No. The civics test is an <strong>oral test</strong>. The officer reads each question out loud and you answer out loud in your own words. There are no answer choices to pick from.",
          "Multiple-choice practice is still a good way to learn the material. Before your interview, practice saying the answers out loud. Our flashcard mode is made for this."
        ]
      },
      {
        heading: "What are the topics on the test?",
        body: [
          "The 128 questions cover American government (principles, the system of government, and rights and responsibilities), American history (the colonial period and independence, the 1800s, and recent history), and integrated civics (symbols and holidays)."
        ],
        topicList: true
      },
      {
        heading: "Which answers depend on where I live?",
        body: [
          "A few questions ask about your own U.S. senators, your U.S. representative, your governor and your state capital. Other questions ask who holds an office right now, such as the President, the Vice President, the Speaker of the House and the Chief Justice.",
          "Learn the answers that are true on the day of your interview. Elections can change them."
        ]
      },
      {
        heading: "What else is on the naturalization test?",
        body: [
          "The civics test is one part of the naturalization test. Most applicants also take an English test with reading, writing and speaking. The speaking part is judged during your interview."
        ]
      },
      {
        heading: "What happens if I fail?",
        body: [
          "If you don't pass a part of the test at your first interview, USCIS gives you a second chance. You are retested on the part you failed, usually 60 to 90 days after your first interview."
        ]
      },
      {
        heading: "How to prepare",
        list: [
          'Read through <a href="/uscis/civics-questions/">all 128 questions and answers</a> once, topic by topic.',
          'Practice one topic at a time with the <a href="/uscis/practice-test/">free practice test</a>.',
          "Switch to flashcards and say each answer out loud.",
          "Take the 20-question mock test until you pass comfortably every time.",
          "In the last week, check the current office holders and your own state answers."
        ]
      }
    ],
    faqTitle: "Citizenship test FAQ",
    faqs: [
      {
        question: "How many questions are on the U.S. citizenship test?",
        answer: "There are 128 civics questions to study for the 2025 test. The officer asks up to 20, and you need 12 correct answers to pass."
      },
      {
        question: "Is the citizenship test multiple choice?",
        answer: "No. The officer asks the questions out loud and you answer out loud in your own words."
      },
      {
        question: "Which version of the civics test will I take?",
        answer: "If you filed Form N-400 on or after October 20, 2025, you take the 2025 test with 128 questions. If you filed earlier, you take the 2008 test with 100 questions."
      },
      {
        question: "Can I take the citizenship test online?",
        answer: "No. The official test happens in person at your naturalization interview. You can practice online for free with our practice test."
      }
    ]
  },
  es: {
    metaTitle: "Examen de ciudadanía 2026: cuántas preguntas, nota para aprobar y qué esperar",
    description:
      "Cómo funciona el examen de educación cívica 2025 para la ciudadanía americana: 128 preguntas para estudiar, hasta 20 en la entrevista y 12 correctas para aprobar.",
    h1: "Cómo funciona el examen de ciudadanía",
    lead: "Lo que necesita saber sobre la parte de educación cívica del examen de naturalización: cuántas preguntas hay, cuántas debe contestar bien y cómo practicar.",
    sections: [
      {
        heading: "¿Cuántas preguntas tiene el examen de ciudadanía?",
        body: [
          "El examen de educación cívica 2025 tiene una lista de <strong>128 preguntas</strong> para estudiar. En la entrevista, el oficial de USCIS le hace <strong>hasta 20</strong>. Necesita <strong>12 respuestas correctas para aprobar</strong>.",
          "El oficial deja de preguntar cuando usted contesta 12 bien o cuando falla 9, porque en ese momento el resultado ya está decidido."
        ]
      },
      {
        heading: "¿Qué cambió con el examen 2025?",
        body: [
          "USCIS empezó a usar el examen 2025 para quienes presentan el Formulario N-400 a partir del <strong>20 de octubre de 2025</strong>. Reemplazó el examen de 2008, que tenía 100 preguntas, hacía 10 y pedía 6 correctas.",
          'Si presentó su solicitud antes de esa fecha, tomará la versión de 2008. Revise su fecha y las reglas más recientes en <a href="https://www.uscis.gov/es/ciudadania" rel="noopener">uscis.gov</a>.'
        ]
      },
      {
        heading: "¿El examen es en inglés?",
        body: [
          "Para la mayoría de las personas, sí. La entrevista y el examen de educación cívica son en inglés. Por eso esta página muestra cada pregunta en español y también en inglés.",
          "Algunas personas mayores con muchos años como residentes permanentes pueden tomar el examen de educación cívica en su idioma con un intérprete. Consulte las reglas en uscis.gov."
        ]
      },
      {
        heading: "¿El examen es de opción múltiple?",
        body: [
          "No. Es un <strong>examen oral</strong>. El oficial lee cada pregunta en voz alta y usted responde en voz alta con sus propias palabras.",
          "Practicar con opción múltiple ayuda a aprender, pero antes de la entrevista practique diciendo las respuestas en voz alta. El modo de tarjetas está hecho para eso."
        ]
      },
      {
        heading: "¿Qué temas incluye el examen?",
        body: [
          "Las 128 preguntas cubren el gobierno estadounidense (principios, sistema de gobierno, y derechos y responsabilidades), la historia (periodo colonial e independencia, el siglo XIX e historia reciente) y educación cívica integrada (símbolos y días festivos)."
        ],
        topicList: true
      },
      {
        heading: "¿Qué respuestas dependen de dónde vivo?",
        body: [
          "Algunas preguntas son sobre sus senadores, su representante, su gobernador y la capital de su estado. Otras preguntan quién ocupa un cargo ahora, como el Presidente, el Vicepresidente, el Presidente de la Cámara y el Presidente de la Corte Suprema.",
          "Apréndase las respuestas vigentes el día de su entrevista. Las elecciones pueden cambiarlas."
        ]
      },
      {
        heading: "¿Qué pasa si no apruebo?",
        body: [
          "Si no aprueba una parte del examen en su primera entrevista, USCIS le da una segunda oportunidad. Le vuelven a examinar en la parte que no aprobó, normalmente entre 60 y 90 días después de la primera entrevista."
        ]
      },
      {
        heading: "Cómo prepararse",
        list: [
          'Lea <a href="/uscis/es/preguntas-de-ciudadania/">las 128 preguntas y respuestas</a> una vez, tema por tema.',
          'Practique un tema a la vez con el <a href="/uscis/es/examen-de-ciudadania/">examen de práctica gratis</a>.',
          "Use las tarjetas y diga cada respuesta en voz alta, en inglés.",
          "Haga el examen simulado de 20 preguntas hasta aprobar con facilidad.",
          "La última semana, revise quién ocupa los cargos actuales y las respuestas de su estado."
        ]
      }
    ],
    faqTitle: "Preguntas frecuentes sobre el examen",
    faqs: [
      {
        question: "¿Cuántas preguntas tiene el examen de ciudadanía?",
        answer: "Hay 128 preguntas de educación cívica para estudiar en el examen 2025. El oficial hace hasta 20 y necesita 12 correctas para aprobar."
      },
      {
        question: "¿Puedo hacer el examen de ciudadanía en español?",
        answer: "La mayoría de las personas hacen el examen en inglés. Algunas personas mayores con muchos años de residencia permanente pueden hacerlo en su idioma. Consulte las reglas en uscis.gov."
      },
      {
        question: "¿Qué versión del examen me toca?",
        answer: "Si presentó el Formulario N-400 a partir del 20 de octubre de 2025, le toca el examen 2025 de 128 preguntas. Si lo presentó antes, le toca el examen de 2008 de 100 preguntas."
      },
      {
        question: "¿Puedo hacer el examen de ciudadanía en línea?",
        answer: "No. El examen oficial es en persona, en su entrevista de naturalización. Puede practicar gratis en línea con nuestro examen de práctica."
      }
    ]
  }
};

export const landingPage = {
  en: {
    metaTitle: "Citizen Ready: USCIS Citizenship Test Prep App (2025 Civics Test)",
    description:
      "Citizen Ready helps you pass the U.S. citizenship test: all 128 official USCIS civics questions, Spanish study mode, answers for your state, and mock tests that use the real passing score.",
    h1: "Pass the U.S. citizenship test with clear, steady practice.",
    lead: "Citizen Ready covers all 128 official civics questions, reviews the ones you miss, lets you study in Spanish, and prepares you with mock tests that use the real pass rules.",
    freeLink: "Or practice free online",
    freeTitle: "Practice free online, right now",
    freeBody: "No download needed to get started. Take the free practice test or read all 128 questions and answers.",
    freePractice: "Free practice test",
    freeList: "All 128 questions",
    features: [
      {
        image: "pass-citizenship-test.png",
        alt: "Citizen Ready practice screen showing a civics question with the correct answer selected.",
        title: "Pass Your U.S. Citizenship Test",
        body: "Practice with clear, exam-style questions based on the official USCIS civics test. Build confidence one question at a time with instant feedback and plain-English explanations."
      },
      {
        image: "official-questions.png",
        alt: "Citizen Ready topics screen showing USCIS civics question categories and progress.",
        title: "All 128 Official Questions",
        body: "Study the full 2025 USCIS civics question bank in organized topics. Track what you have answered, what still needs work, and which topics you are ready to move past."
      },
      {
        image: "state-specific.png",
        alt: "Citizen Ready practice screen showing a question about the U.S. representative for California district 12.",
        title: "Personalized To Your State",
        body: "Get practice questions that reflect your state, district or territory, with current answers for your U.S. representative, governor, senators and capital."
      },
      {
        image: "spanish-study.png",
        alt: "Citizen Ready Spanish study screen showing a civics question in Spanish with the English wording below.",
        title: "Study In Spanish*",
        body: "Learn in Spanish while still seeing the official English test wording, so you understand each question without losing sight of what the officer will ask.<br>*Requires an in-app purchase."
      },
      {
        image: "mock-exam.png",
        alt: "Citizen Ready mock exam results screen showing a passing score and missed questions to review.",
        title: "Mock Exam With Real Pass Rules",
        body: "Take a realistic mock exam that uses USCIS-style scoring. See whether you would pass, review missed questions, and focus your next session where it matters."
      },
      {
        image: "mastery-progress.png",
        alt: "Citizen Ready progress screen showing mastery, accuracy, session history and question coverage.",
        title: "Master Every Question",
        body: "Track mastery, accuracy and session history. A question counts as mastered after repeated correct answers, so your progress reflects what you really remember."
      }
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is Citizen Ready free to download?",
        answer: "Yes. The app is free to download and includes a free preview. An optional in-app purchase unlocks Full Access, including Spanish study mode."
      },
      {
        question: "Is there a free online version?",
        answer: 'Yes. You can take the <a href="/uscis/practice-test/">free practice test</a> and read <a href="/uscis/civics-questions/">all 128 questions and answers</a> on this website. The website doesn\'t save progress; the app does.'
      },
      {
        question: "Does the app cover all 128 official USCIS civics questions?",
        answer: "Yes. The app includes the full 2025 USCIS civics question bank, organized into topics so you can track what you have answered and what still needs work."
      },
      {
        question: "Can I study in Spanish?",
        answer: "Yes. Spanish study mode lets you learn in Spanish while still seeing the official English test wording. This feature requires an in-app purchase."
      },
      {
        question: "Does the app give state-specific civics answers?",
        answer: "Yes. Practice questions reflect your state, district or territory, including your current U.S. representative, governor, senators and capital."
      },
      {
        question: "Is Citizen Ready affiliated with USCIS or the U.S. government?",
        answer: "No. Citizen Ready is published by an independent company, Elevix Apps, and is not affiliated with USCIS or the U.S. government."
      },
      {
        question: "What is the Pass Guarantee?",
        answer: "If you purchased the app, studied with it, and did not pass the civics portion of your interview, you can contact support with proof of purchase and your test result. Eligible pass guarantee requests are reviewed within 7 business days."
      },
      {
        question: "Is Citizen Ready available on Android?",
        answer: 'Not yet. The app is available on iPhone and iPad. On Android, you can use the <a href="/uscis/practice-test/">free online practice test</a>.'
      }
    ]
  },
  es: {
    metaTitle: "Citizen Ready: app para el examen de ciudadanía americana en español",
    description:
      "Citizen Ready le ayuda a aprobar el examen de ciudadanía: las 128 preguntas oficiales de USCIS, modo de estudio en español, respuestas de su estado y exámenes simulados con la nota real.",
    h1: "Apruebe el examen de ciudadanía con práctica clara y constante.",
    lead: "Citizen Ready incluye las 128 preguntas oficiales de educación cívica, repasa las que falla, le permite estudiar en español y le prepara con exámenes simulados que usan las reglas reales.",
    freeLink: "O practique gratis en línea",
    freeTitle: "Practique gratis en línea, ahora mismo",
    freeBody: "No necesita descargar nada para empezar. Haga el examen de práctica gratis o lea las 128 preguntas y respuestas.",
    freePractice: "Examen de práctica gratis",
    freeList: "Las 128 preguntas",
    features: [
      {
        image: "spanish-study.png",
        alt: "Pantalla de estudio en español de Citizen Ready con una pregunta en español y el texto en inglés debajo.",
        title: "Estudie en español*",
        body: "Aprenda en español mientras ve el texto oficial en inglés, para entender cada pregunta sin perder de vista lo que el oficial le preguntará.<br>*Requiere una compra dentro de la app."
      },
      {
        image: "official-questions.png",
        alt: "Pantalla de temas de Citizen Ready con las categorías de preguntas de USCIS y el progreso.",
        title: "Las 128 preguntas oficiales",
        body: "Estudie todo el banco de preguntas 2025 de USCIS organizado por temas. Vea qué ha contestado, qué le falta y qué temas ya domina."
      },
      {
        image: "state-specific.png",
        alt: "Pantalla de Citizen Ready con una pregunta sobre el representante del distrito 12 de California.",
        title: "Respuestas de su estado",
        body: "Practique con las respuestas de su estado, distrito o territorio: su representante, su gobernador, sus senadores y su capital."
      },
      {
        image: "mock-exam.png",
        alt: "Pantalla de resultados del examen simulado de Citizen Ready con una nota aprobatoria.",
        title: "Examen simulado con reglas reales",
        body: "Haga un examen simulado con la calificación de USCIS. Vea si aprobaría, repase las preguntas que falló y enfoque su próxima sesión."
      },
      {
        image: "mastery-progress.png",
        alt: "Pantalla de progreso de Citizen Ready con dominio, precisión e historial de sesiones.",
        title: "Domine cada pregunta",
        body: "Siga su dominio, precisión e historial. Una pregunta cuenta como dominada después de varias respuestas correctas, así su progreso refleja lo que de verdad recuerda."
      }
    ],
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        question: "¿Citizen Ready es gratis?",
        answer: "Sí. La app es gratis para descargar e incluye una vista previa gratis. Una compra opcional dentro de la app desbloquea el acceso completo, incluido el modo de estudio en español."
      },
      {
        question: "¿Hay una versión gratis en línea?",
        answer: 'Sí. Puede hacer el <a href="/uscis/es/examen-de-ciudadania/">examen de práctica gratis</a> y leer <a href="/uscis/es/preguntas-de-ciudadania/">las 128 preguntas y respuestas</a> en esta página. La web no guarda su progreso; la app sí.'
      },
      {
        question: "¿La app está en español?",
        answer: "La app tiene un modo de estudio en español que muestra cada pregunta y respuesta en español junto con el texto oficial en inglés. Requiere una compra dentro de la app."
      },
      {
        question: "¿Citizen Ready está afiliada con USCIS o el gobierno?",
        answer: "No. Citizen Ready es publicada por una empresa independiente, Elevix Apps, y no está afiliada con USCIS ni con el gobierno de EE. UU."
      },
      {
        question: "¿Citizen Ready está disponible en Android?",
        answer: 'Todavía no. La app está disponible para iPhone y iPad. En Android, puede usar el <a href="/uscis/es/examen-de-ciudadania/">examen de práctica gratis en línea</a>.'
      }
    ]
  }
};

export const quizUi = {
  en: {
    modesLabel: "Choose a mode",
    modes: { practice: "Practice", flashcards: "Flashcards", mock: "Mock test" },
    modeHelp: {
      practice: "Multiple choice with an explanation after every answer.",
      flashcards: "Say the answer out loud, then flip the card.",
      mock: "20 random questions, no hints. 12 correct to pass."
    },
    topic: "Topic",
    allTopics: "All topics",
    length: "Questions",
    lengthAll: "All",
    state: "Your state (optional)",
    statePlaceholder: "Skip state questions",
    district: "Congressional district",
    districtPlaceholder: "Skip representative question",
    districtAtLarge: "At-large",
    districtLabel: "District {n}",
    stateHelp: "Adds the questions about your senators, representative, governor and capital.",
    start: "Start",
    questionOf: "Question {i} of {n}",
    chooseN: "Choose {n} answers",
    check: "Check answer",
    next: "Next question",
    finish: "See results",
    correct: "Correct!",
    incorrect: "Not quite.",
    acceptedAnswers: "Accepted answers:",
    showAnswer: "Show answer",
    knewIt: "I knew it",
    stillLearning: "Still learning",
    resultsTitle: "Your results",
    score: "{c} of {n} correct",
    passed: "You would pass the civics test!",
    notPassed: "Not yet. You need {needed} correct answers to pass.",
    flashcardScore: "You knew {k} of {n}",
    missedTitle: "Review these questions",
    noneMissed: "You didn't miss any questions. Nice work.",
    learnMore: "Learn more",
    retry: "Start over",
    practiceMissed: "Practice missed questions",
    quit: "Quit",
    loading: "Loading questions…",
    loadError: "Couldn't load the questions. Check your connection and try again.",
    inEnglish: "",
    ctaTitle: "Want to keep this progress?",
    ctaBody: "Citizen Ready saves your progress, repeats the questions you miss, and tracks your mastery of all 128 questions.",
    ctaAndroid: "Android version coming soon."
  },
  es: {
    modesLabel: "Elija un modo",
    modes: { practice: "Práctica", flashcards: "Tarjetas", mock: "Examen simulado" },
    modeHelp: {
      practice: "Opción múltiple con explicación después de cada respuesta.",
      flashcards: "Diga la respuesta en voz alta y luego voltee la tarjeta.",
      mock: "20 preguntas al azar, sin pistas. 12 correctas para aprobar."
    },
    topic: "Tema",
    allTopics: "Todos los temas",
    length: "Preguntas",
    lengthAll: "Todas",
    state: "Su estado (opcional)",
    statePlaceholder: "Omitir preguntas del estado",
    district: "Distrito del Congreso",
    districtPlaceholder: "Omitir pregunta del representante",
    districtAtLarge: "Distrito único",
    districtLabel: "Distrito {n}",
    stateHelp: "Agrega las preguntas sobre sus senadores, su representante, su gobernador y su capital.",
    start: "Empezar",
    questionOf: "Pregunta {i} de {n}",
    chooseN: "Elija {n} respuestas",
    check: "Revisar respuesta",
    next: "Siguiente pregunta",
    finish: "Ver resultados",
    correct: "¡Correcto!",
    incorrect: "No es correcto.",
    acceptedAnswers: "Respuestas aceptadas:",
    showAnswer: "Ver respuesta",
    knewIt: "La sabía",
    stillLearning: "Sigo aprendiendo",
    resultsTitle: "Sus resultados",
    score: "{c} de {n} correctas",
    passed: "¡Aprobaría el examen de educación cívica!",
    notPassed: "Todavía no. Necesita {needed} respuestas correctas para aprobar.",
    flashcardScore: "Sabía {k} de {n}",
    missedTitle: "Repase estas preguntas",
    noneMissed: "No falló ninguna pregunta. ¡Muy bien!",
    learnMore: "Ver más",
    retry: "Empezar de nuevo",
    practiceMissed: "Practicar las que fallé",
    quit: "Salir",
    loading: "Cargando preguntas…",
    loadError: "No se pudieron cargar las preguntas. Revise su conexión e intente de nuevo.",
    inEnglish: "En inglés:",
    ctaTitle: "¿Quiere guardar su progreso?",
    ctaBody: "Citizen Ready guarda su avance, le repite las preguntas que falla y le muestra cuánto domina de las 128 preguntas.",
    ctaAndroid: "La versión para Android llegará pronto."
  }
};
