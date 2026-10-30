// Citizen Ready web practice: the full practice test plus the "try it yourself" check on question pages.
// Nothing is saved between visits on purpose; saved progress is what the app is for.
(function () {
  "use strict";

  function track(event, properties) {
    if (window.crTrack) {
      window.crTrack(event, properties);
    }
  }

  function fmt(template, values) {
    return template.replace(/\{(\w+)\}/g, function (match, key) {
      return key in values ? values[key] : match;
    });
  }

  function el(tag, attributes, children) {
    var node = document.createElement(tag);

    Object.keys(attributes || {}).forEach(function (key) {
      var value = attributes[key];

      if (value === null || value === undefined || value === false) {
        return;
      }

      if (key === "text") {
        node.textContent = value;
      } else if (key === "html") {
        node.innerHTML = value;
      } else if (key.slice(0, 2) === "on") {
        node.addEventListener(key.slice(2), value);
      } else {
        node.setAttribute(key, value === true ? "" : value);
      }
    });

    (children || []).forEach(function (child) {
      if (child) {
        node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
      }
    });

    return node;
  }

  function shuffle(items) {
    var copy = items.slice();

    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }

    return copy;
  }

  function isPressed(button) {
    return button.getAttribute("aria-pressed") === "true";
  }

  // ---------- PDF downloads on the question list ----------

  Array.prototype.forEach.call(document.querySelectorAll("[data-pdf]"), function (link) {
    link.addEventListener("click", function () {
      track("question_list_pdf_downloaded", { page: location.pathname });
    });
  });

  // ---------- "Try it yourself" on question pages ----------

  Array.prototype.forEach.call(document.querySelectorAll("[data-check]"), function (section) {
    var count = Number(section.getAttribute("data-count")) || 1;
    var buttons = Array.prototype.slice.call(section.querySelectorAll(".cr-choice"));
    var submit = section.querySelector("[data-check-submit]");
    var feedback = section.querySelector("[data-feedback]");
    var done = false;

    function selected() {
      return buttons.filter(isPressed);
    }

    function reveal() {
      var picks = selected();
      var correct =
        picks.length === count &&
        picks.every(function (button) {
          return button.getAttribute("data-correct") === "1";
        });

      done = true;
      buttons.forEach(function (button) {
        button.disabled = true;

        if (button.getAttribute("data-correct") === "1") {
          button.classList.add("is-correct");
        } else if (isPressed(button)) {
          button.classList.add("is-wrong");
        }
      });

      if (submit) {
        submit.disabled = true;
      }

      feedback.textContent = section.getAttribute(correct ? "data-correct-text" : "data-incorrect-text");
      feedback.className = "cr-feedback " + (correct ? "is-correct" : "is-wrong");
      track("question_check_answered", { correct: correct, page: location.pathname });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (done) {
          return;
        }

        if (count === 1) {
          button.setAttribute("aria-pressed", "true");
          reveal();
          return;
        }

        if (!isPressed(button) && selected().length >= count) {
          return;
        }

        button.setAttribute("aria-pressed", String(!isPressed(button)));
        submit.disabled = selected().length !== count;
      });
    });

    if (submit) {
      submit.addEventListener("click", reveal);
    }
  });

  // ---------- Full practice test ----------

  var root = document.querySelector("[data-quiz]");
  var configNode = document.getElementById("cr-quiz-config");

  if (!root || !configNode) {
    return;
  }

  var config = JSON.parse(configNode.textContent);
  var t = config.ui;
  var lang = config.lang;
  var params = new URLSearchParams(location.search);
  var settings = {
    mode: ["practice", "flashcards", "mock"].indexOf(params.get("mode")) >= 0 ? params.get("mode") : "practice",
    topic: params.get("topic") || "all",
    length: "10",
    state: "",
    district: ""
  };
  var bank = null;
  var stateCache = {};
  var session = null;

  function setView(nodes, focusTarget) {
    root.innerHTML = "";
    nodes.forEach(function (node) {
      root.appendChild(node);
    });

    if (focusTarget) {
      focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
      var top = root.getBoundingClientRect().top + window.scrollY - 90;

      if (window.scrollY > top) {
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    }
  }

  function jurisdiction(code) {
    return config.jurisdictions.filter(function (place) {
      return place.code === code;
    })[0];
  }

  function loadState(code) {
    if (!code) {
      return Promise.resolve(null);
    }

    if (stateCache[code]) {
      return Promise.resolve(stateCache[code]);
    }

    return fetch(config.statesUrl + code + ".json")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        stateCache[code] = data;
        return data;
      });
  }

  // Returns a question ready to play (with choices), or null when it can't be asked.
  function playable(question, stateData) {
    if (question.kind !== "jurisdiction") {
      return question[lang].choices ? question : null;
    }

    if (!stateData) {
      return null;
    }

    var choices = stateData.choices[question.number];

    if (stateData.districtChoices[question.number]) {
      choices = settings.district ? stateData.districtChoices[question.number][settings.district] : null;
    }

    if (!choices || !choices[lang]) {
      return null;
    }

    var suffix = " (" + jurisdiction(settings.state).name + ")";
    var localized = {
      en: Object.assign({}, question.en, { prompt: question.en.prompt + suffix, choices: choices.en })
    };

    if (lang !== "en") {
      localized[lang] = Object.assign({}, question[lang], { prompt: question[lang].prompt + suffix, choices: choices[lang] });
    }

    return Object.assign({}, question, localized);
  }

  // What to show as the right answer: the official list, or the person's own answer for dynamic questions.
  function answerLabels(question) {
    if (question.kind === "static") {
      return question[lang].answers;
    }

    return question[lang].choices
      .filter(function (choice) {
        return choice.correct;
      })
      .map(function (choice) {
        return choice.label;
      });
  }

  // ---------- Setup ----------

  function renderSetup() {
    var form = el("form", { class: "cr-quiz-setup" });
    var modeHelp = el("p", { class: "cr-muted cr-mode-help", text: t.modeHelp[settings.mode] });
    var modes = el("fieldset", { class: "cr-modes" }, [el("legend", { text: t.modesLabel })]);

    ["practice", "flashcards", "mock"].forEach(function (mode) {
      var input = el("input", {
        type: "radio",
        name: "mode",
        value: mode,
        checked: settings.mode === mode,
        onchange: function () {
          settings.mode = mode;
          modeHelp.textContent = t.modeHelp[mode];
          topicField.hidden = mode === "mock";
          lengthField.hidden = mode !== "practice";
        }
      });
      modes.appendChild(el("label", { class: "cr-mode" }, [input, el("span", { text: t.modes[mode] })]));
    });

    var topicSelect = el("select", {
      id: "cr-topic",
      onchange: function () {
        settings.topic = topicSelect.value;
      }
    }, [el("option", { value: "all", text: t.allTopics })]);

    bank.topics.forEach(function (topic) {
      topicSelect.appendChild(el("option", { value: topic.id, text: topic[lang], selected: settings.topic === topic.id }));
    });

    var topicField = el("div", { class: "cr-field" }, [el("label", { for: "cr-topic", text: t.topic }), topicSelect]);
    topicField.hidden = settings.mode === "mock";

    var lengthSelect = el("select", {
      id: "cr-length",
      onchange: function () {
        settings.length = lengthSelect.value;
      }
    });

    ["10", "20", "all"].forEach(function (value) {
      lengthSelect.appendChild(
        el("option", { value: value, text: value === "all" ? t.lengthAll : value, selected: settings.length === value })
      );
    });

    var lengthField = el("div", { class: "cr-field" }, [el("label", { for: "cr-length", text: t.length }), lengthSelect]);
    lengthField.hidden = settings.mode !== "practice";

    var districtSelect = el("select", {
      id: "cr-district",
      onchange: function () {
        settings.district = districtSelect.value;
      }
    });
    var districtField = el("div", { class: "cr-field" }, [el("label", { for: "cr-district", text: t.district }), districtSelect]);

    function fillDistricts() {
      var place = jurisdiction(settings.state);
      districtSelect.innerHTML = "";
      districtField.hidden = !place || place.districts.length <= 1;

      if (!place) {
        settings.district = "";
        return;
      }

      if (place.districts.length === 1) {
        settings.district = String(place.districts[0]);
        return;
      }

      districtSelect.appendChild(el("option", { value: "", text: t.districtPlaceholder }));
      place.districts.forEach(function (district) {
        districtSelect.appendChild(
          el("option", {
            value: String(district),
            text: fmt(t.districtLabel, { n: district }),
            selected: settings.district === String(district)
          })
        );
      });

      if (place.districts.map(String).indexOf(settings.district) < 0) {
        settings.district = "";
      }
    }

    var stateSelect = el("select", {
      id: "cr-state",
      onchange: function () {
        settings.state = stateSelect.value;
        settings.district = "";
        fillDistricts();
      }
    }, [el("option", { value: "", text: t.statePlaceholder })]);

    config.jurisdictions.forEach(function (place) {
      stateSelect.appendChild(el("option", { value: place.code, text: place.name, selected: settings.state === place.code }));
    });

    fillDistricts();

    var stateField = el("div", { class: "cr-field cr-field-wide" }, [
      el("label", { for: "cr-state", text: t.state }),
      stateSelect,
      el("p", { class: "cr-muted", text: t.stateHelp })
    ]);

    form.appendChild(modes);
    form.appendChild(modeHelp);
    form.appendChild(el("div", { class: "cr-fields" }, [topicField, lengthField, stateField, districtField]));
    form.appendChild(el("button", { type: "submit", class: "button button-primary cr-start", text: t.start }));
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      start();
    });

    setView([form]);
  }

  function start(fromQuestions) {
    loadState(settings.state)
      .then(function (stateData) {
        var pool = (fromQuestions || bank.questions)
          .map(function (question) {
            return playable(question, stateData);
          })
          .filter(Boolean);

        if (!fromQuestions && settings.mode !== "mock" && settings.topic !== "all") {
          pool = pool.filter(function (question) {
            return question.topic === settings.topic;
          });
        }

        var deck = shuffle(pool);

        if (settings.mode === "mock") {
          deck = deck.slice(0, config.mockQuestionCount);
        } else if (settings.mode === "practice" && settings.length !== "all" && !fromQuestions) {
          deck = deck.slice(0, Number(settings.length));
        }

        session = { mode: settings.mode, deck: deck, index: 0, results: [] };
        track("quiz_started", {
          mode: session.mode,
          topic: settings.topic,
          questions: deck.length,
          with_state: Boolean(settings.state),
          review: Boolean(fromQuestions)
        });
        renderQuestion();
      })
      .catch(function (error) {
        console.error(error);
        setView([el("p", { class: "cr-feedback is-wrong", text: t.loadError })]);
      });
  }

  // ---------- Question ----------

  function questionHeader(question) {
    var topic = bank.topics.filter(function (item) {
      return item.id === question.topic;
    })[0];
    var progress = el("div", { class: "cr-progress", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": session.deck.length, "aria-valuenow": session.index + 1 }, [
      el("span", { style: "width:" + ((session.index + 1) / session.deck.length) * 100 + "%" })
    ]);

    return el("div", { class: "cr-quiz-top" }, [
      el("div", { class: "cr-quiz-meta" }, [
        el("span", { text: fmt(t.questionOf, { i: session.index + 1, n: session.deck.length }) }),
        el("button", { type: "button", class: "cr-link-button", text: t.quit, onclick: renderSetup })
      ]),
      progress,
      el("p", { class: "cr-kicker", text: topic ? topic[lang] : "" })
    ]);
  }

  function promptNodes(question) {
    var heading = el("h2", { class: "cr-quiz-prompt", text: question[lang].prompt });
    var nodes = [heading];

    if (lang !== "en") {
      nodes.push(el("p", { class: "cr-english", lang: "en" }, [el("span", { text: t.inEnglish + " " }), question.en.prompt]));
    }

    return { heading: heading, nodes: nodes };
  }

  function nextButton() {
    var isLast = session.index === session.deck.length - 1;

    return el("button", {
      type: "button",
      class: "button button-primary cr-next",
      text: isLast ? t.finish : t.next,
      onclick: function () {
        session.index += 1;

        if (session.index >= session.deck.length) {
          renderResults();
        } else {
          renderQuestion();
        }
      }
    });
  }

  function renderQuestion() {
    var question = session.deck[session.index];

    if (session.mode === "flashcards") {
      renderFlashcard(question);
      return;
    }

    var prompt = promptNodes(question);
    var count = question.count;
    var choices = shuffle(question[lang].choices);
    var buttons = [];
    var actions = el("div", { class: "cr-quiz-actions" });
    var feedback = el("div", { class: "cr-quiz-feedback", "aria-live": "polite" });
    var answered = false;

    function picks() {
      return buttons.filter(isPressed);
    }

    function isCorrect() {
      var chosen = picks();
      return (
        chosen.length === count &&
        chosen.every(function (button) {
          return button.getAttribute("data-correct") === "1";
        })
      );
    }

    function record() {
      answered = true;
      session.results.push({ question: question, correct: isCorrect() });
    }

    function revealPractice() {
      record();
      var correct = isCorrect();
      buttons.forEach(function (button) {
        button.disabled = true;

        if (button.getAttribute("data-correct") === "1") {
          button.classList.add("is-correct");
        } else if (isPressed(button)) {
          button.classList.add("is-wrong");
        }
      });

      feedback.innerHTML = "";
      feedback.appendChild(el("p", { class: "cr-feedback " + (correct ? "is-correct" : "is-wrong"), text: correct ? t.correct : t.incorrect }));
      feedback.appendChild(el("p", { class: "cr-accepted" }, [el("strong", { text: t.acceptedAnswers + " " }), answerLabels(question).join(" · ")]));
      feedback.appendChild(el("p", { class: "cr-muted", text: question[lang].explanation }));
      actions.innerHTML = "";
      actions.appendChild(nextButton());
    }

    var submit = el("button", {
      type: "button",
      class: "button button-primary",
      text: session.mode === "mock" ? (session.index === session.deck.length - 1 ? t.finish : t.next) : t.check,
      disabled: true,
      onclick: function () {
        if (session.mode === "mock") {
          record();
          session.index += 1;

          if (session.index >= session.deck.length) {
            renderResults();
          } else {
            renderQuestion();
          }
        } else {
          revealPractice();
        }
      }
    });

    var list = el("div", { class: "cr-choices", role: "group", "aria-label": count > 1 ? fmt(t.chooseN, { n: count }) : null });

    choices.forEach(function (choice) {
      var button = el("button", {
        type: "button",
        class: "cr-choice",
        "data-correct": choice.correct ? "1" : "0",
        "aria-pressed": "false",
        text: choice.label,
        onclick: function () {
          if (answered) {
            return;
          }

          if (count === 1) {
            buttons.forEach(function (other) {
              other.setAttribute("aria-pressed", "false");
            });
            button.setAttribute("aria-pressed", "true");

            if (session.mode === "practice") {
              revealPractice();
              return;
            }
          } else {
            if (!isPressed(button) && picks().length >= count) {
              return;
            }

            button.setAttribute("aria-pressed", String(!isPressed(button)));
          }

          submit.disabled = picks().length !== count;
        }
      });
      buttons.push(button);
      list.appendChild(button);
    });

    if (count > 1 || session.mode === "mock") {
      actions.appendChild(submit);
    }

    var nodes = [questionHeader(question)].concat(prompt.nodes);

    if (count > 1) {
      nodes.push(el("p", { class: "cr-muted", text: fmt(t.chooseN, { n: count }) }));
    }

    setView(nodes.concat([list, feedback, actions]), prompt.heading);
  }

  function renderFlashcard(question) {
    var prompt = promptNodes(question);
    var back = el("div", { class: "cr-flashcard-back", hidden: true }, [
      el("ul", { class: "cr-answers" }, answerLabels(question).map(function (label) {
        return el("li", { text: label });
      })),
      el("p", { class: "cr-muted", text: question[lang].explanation })
    ]);
    var actions = el("div", { class: "cr-quiz-actions" });

    function rate(knewIt) {
      session.results.push({ question: question, correct: knewIt });
      session.index += 1;

      if (session.index >= session.deck.length) {
        renderResults();
      } else {
        renderQuestion();
      }
    }

    actions.appendChild(
      el("button", {
        type: "button",
        class: "button button-primary",
        text: t.showAnswer,
        onclick: function () {
          back.hidden = false;
          actions.innerHTML = "";
          actions.appendChild(el("button", { type: "button", class: "button button-primary", text: t.knewIt, onclick: function () { rate(true); } }));
          actions.appendChild(el("button", { type: "button", class: "button button-secondary", text: t.stillLearning, onclick: function () { rate(false); } }));
        }
      })
    );

    var card = el("div", { class: "cr-flashcard" }, prompt.nodes.concat([back]));
    setView([questionHeader(question), card, actions], prompt.heading);
  }

  // ---------- Results ----------

  function renderResults() {
    var correct = session.results.filter(function (result) {
      return result.correct;
    }).length;
    var total = session.results.length;
    var missed = session.results
      .filter(function (result) {
        return !result.correct;
      })
      .map(function (result) {
        return result.question;
      });
    var passed = session.mode === "mock" ? correct >= config.mockPassingCount : null;
    var heading = el("h2", { class: "cr-quiz-prompt", text: t.resultsTitle });
    var nodes = [heading];

    nodes.push(
      el("p", {
        class: "cr-score",
        text: session.mode === "flashcards" ? fmt(t.flashcardScore, { k: correct, n: total }) : fmt(t.score, { c: correct, n: total })
      })
    );

    if (session.mode === "mock") {
      nodes.push(
        el("p", {
          class: "cr-feedback " + (passed ? "is-correct" : "is-wrong"),
          text: passed ? t.passed : fmt(t.notPassed, { needed: config.mockPassingCount })
        })
      );
    }

    nodes.push(el("h3", { class: "cr-h3", text: missed.length ? t.missedTitle : t.noneMissed }));

    if (missed.length) {
      nodes.push(
        el("ul", { class: "cr-missed" }, missed.map(function (question) {
          return el("li", {}, [
            el("strong", { text: question[lang].prompt }),
            el("span", { text: answerLabels(question).join(" · ") }),
            el("a", { href: config.links[question.number], text: t.learnMore })
          ]);
        }))
      );
    }

    var actions = el("div", { class: "cr-quiz-actions" });

    if (missed.length) {
      actions.appendChild(
        el("button", {
          type: "button",
          class: "button button-primary",
          text: t.practiceMissed,
          onclick: function () {
            var numbers = missed.map(function (question) {
              return question.number;
            });
            settings.mode = "practice";
            start(bank.questions.filter(function (question) {
              return numbers.indexOf(question.number) >= 0;
            }));
          }
        })
      );
    }

    actions.appendChild(el("button", { type: "button", class: "button button-secondary", text: t.retry, onclick: renderSetup }));
    nodes.push(actions);

    nodes.push(
      el("aside", { class: "cr-quiz-cta" }, [
        el("h3", { class: "cr-h3", text: t.ctaTitle }),
        el("p", { text: t.ctaBody }),
        el("a", { class: "store-button cr-store", href: config.appStoreUrl, "data-cta": config.campaign }, [
          el("img", { src: "/assets/appstore.svg", alt: "App Store", width: "156", height: "52" })
        ]),
        el("p", { class: "cr-cta-note", text: t.ctaAndroid })
      ])
    );

    track("quiz_completed", { mode: session.mode, correct: correct, total: total, passed: passed });
    setView(nodes, heading);
  }

  fetch(config.dataUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      bank = data;
      renderSetup();
    })
    .catch(function () {
      setView([el("p", { class: "cr-feedback is-wrong", text: t.loadError })]);
    });
})();
