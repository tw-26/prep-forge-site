// @ts-check
// Progressive enhancement for the Rankbound tool pages. The server-rendered default result is already
// in the HTML; this module re-renders it when inputs change, and adds reroll, copy, share and print.
// Nothing is stored or sent except coarse analytics events (see track()).
import { generateWorkout, weeklyPlan, buildChallenge, normalizeOptions } from "./engine.js";
import { planPushUps } from "./pushups.js";
import { scaleRoutine } from "./opm.js";
import { renderQuest, renderWeek, renderChallenge, renderPushUps, renderRoutine, questText, weekText, challengeText, pushUpText, routineText } from "./render.js";

const root = /** @type {HTMLElement|null} */ (document.querySelector("[data-rb-tool]"));
const configElement = document.getElementById("rb-tool-config");

if (root && configElement) init(root, JSON.parse(configElement.textContent || "{}"));

/** @param {string} event @param {Record<string, any>} [properties] */
function track(event, properties) {
  try {
    // @ts-ignore crTrack is defined by /assets/js/analytics.js and is a no-op off elevixapps.com.
    if (typeof window.crTrack === "function") window.crTrack(event, properties || {});
  } catch {
    // Analytics must never break the tool.
  }
}

/** @param {HTMLElement} container @param {{tool: string, page: string}} config */
function init(container, config) {
  const form = /** @type {HTMLFormElement} */ (container.querySelector("form"));
  const status = container.querySelector("[data-status]");
  let seed = 1;
  let started = false;
  let text = "";
  container.classList.add("rb-js");

  /** Read the form into plain values. Only coarse, non-sensitive values are ever tracked. */
  function read() {
    /** @type {Record<string, any>} */
    const values = { equipment: [] };
    new FormData(form).forEach((value, key) => {
      if (key === "equipment") values.equipment.push(String(value));
      else values[key] = String(value);
    });
    const impact = /** @type {HTMLInputElement|null} */ (form.elements.namedItem("lowImpact"));
    values.lowImpact = Boolean(impact && impact.checked);
    return values;
  }

  /** @param {string} selector @param {string} html */
  function put(selector, html) {
    const target = container.querySelector(selector);
    if (target) target.innerHTML = html;
  }

  function render() {
    const values = read();
    if (config.tool === "generator") {
      const options = { ...values, seed };
      const quest = generateWorkout(options);
      const plan = weeklyPlan({ ...options, days: values.days });
      put("[data-result-quest]", renderQuest(quest, { heading: "h3" }));
      put("[data-result-week]", renderWeek(plan));
      text = `${questText(quest)}\n\nYour week:\n${weekText(plan)}`;
      const normalized = normalizeOptions(options);
      return { tool: config.page, level: normalized.level, minutes: normalized.minutes, focus: normalized.focus, equipment: normalized.equipment.join(",") || "none", low_impact: normalized.lowImpact, days: plan.days };
    }
    if (config.tool === "challenge") {
      const challenge = buildChallenge({ ...values, seed });
      put("[data-result]", renderChallenge(challenge));
      text = challengeText(challenge);
      return { tool: config.page, level: challenge.options.level, minutes: challenge.options.minutes, equipment: challenge.options.equipment.join(",") || "none", low_impact: challenge.options.lowImpact, days: challenge.days };
    }
    if (config.tool === "pushups") {
      const plan = planPushUps(values);
      put("[data-result]", renderPushUps(plan));
      text = pushUpText(plan);
      return { tool: config.page, days: plan.days };
    }
    const result = scaleRoutine(values);
    put("[data-result]", renderRoutine(result));
    text = routineText(result);
    return { tool: config.page, days: result.days };
  }

  /** @param {string} event */
  function generate(event) {
    if (!started) {
      started = true;
      track("rb_tool_started", { tool: config.page });
    }
    const properties = render();
    track(event, properties);
    syncUrl();
  }

  function syncUrl() {
    // Sharing a link reproduces the same workout. The canonical URL stays the clean page URL.
    if (config.tool === "pushups" || config.tool === "opm") return;
    const params = new URLSearchParams();
    const values = read();
    for (const [key, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        if (value.length) params.set(key, value.join(","));
      } else if (value === true) {
        params.set(key, "1");
      } else if (value !== false && value !== "") {
        params.set(key, String(value));
      }
    }
    params.set("seed", String(seed));
    history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
  }

  /** @param {string} message */
  function say(message) {
    if (status) status.textContent = message;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generate("rb_tool_generated");
  });
  form.addEventListener("change", () => generate("rb_tool_generated"));

  container.querySelector('[data-action="reroll"]')?.addEventListener("click", () => {
    seed += 1;
    generate("rb_tool_rerolled");
  });

  container.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
    const link = location.href;
    try {
      await navigator.clipboard.writeText(`${text}\n\n${link}`);
      say("Copied to clipboard.");
      track("rb_tool_copied", { tool: config.page });
    } catch {
      say("Copy is not available in this browser. Select the workout text instead.");
    }
  });

  const shareButton = /** @type {HTMLButtonElement|null} */ (container.querySelector('[data-action="share"]'));
  if (shareButton && typeof navigator.share === "function") {
    shareButton.hidden = false;
    shareButton.addEventListener("click", async () => {
      try {
        await navigator.share({ title: document.title, text, url: location.href });
        track("rb_tool_shared", { tool: config.page });
      } catch {
        // The share sheet was dismissed.
      }
    });
  }

  container.querySelector('[data-action="print"]')?.addEventListener("click", () => {
    track("rb_tool_printed", { tool: config.page });
    window.print();
  });

  // Restore a shared workout from the URL, then render it. Without params the static result stays.
  const params = new URLSearchParams(location.search);
  if ([...params.keys()].length > 0) {
    seed = Math.max(1, Math.trunc(Number(params.get("seed"))) || 1);
    for (const element of Array.from(form.elements)) {
      const field = /** @type {HTMLInputElement} */ (element);
      if (!field.name || field.name === "seed") continue;
      const value = params.get(field.name);
      if (field.name === "equipment") {
        field.checked = (params.get("equipment") || "").split(",").includes(field.value);
      } else if (field.type === "checkbox") {
        field.checked = value === "1" || value === "true";
      } else if (value !== null) {
        field.value = value;
      }
    }
    render();
  }
}
