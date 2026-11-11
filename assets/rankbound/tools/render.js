// @ts-check
// Pure HTML and plain-text renderers shared by the static build and the browser. Everything that
// reaches the markup goes through esc(); the same function renders the default result into the page
// at build time and re-renders it when the visitor changes an input.
import { formatTarget } from "./engine.js";
import { TARGET_REPS, TARGET_RUN_MINUTES, MAX_WEEKS } from "./opm.js";

export const FOCUS_LABELS = { full: "Full body", upper: "Upper body", lower: "Lower body", core: "Core", cardio: "Cardio" };
export const SITE_ORIGIN = "https://elevixapps.com";

/** @param {unknown} value */
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @param {{sets: number, unit: string, target: number}} item */
export function dose(item) {
  return `${item.sets} × ${formatTarget(item.unit, item.target)}`;
}

/**
 * @param {ReturnType<typeof import("./engine.js").generateWorkout>} quest
 * @param {{ heading?: "h2"|"h3"|"h4", kicker?: string }} [config]
 */
export function renderQuest(quest, config = {}) {
  const heading = config.heading ?? "h3";
  const items = quest.items
    .map((item, index) => {
      const alternatives = [
        item.easier ? `Easier: ${esc(item.easier.name)}` : "",
        item.harder ? `Harder: ${esc(item.harder.name)}` : ""
      ].filter(Boolean);
      return `<li class="rb-quest-item"><span class="rb-quest-num" aria-hidden="true">${index + 1}</span><div><p class="rb-quest-line"><strong>${esc(item.name)}</strong> <span class="rb-quest-dose">${esc(dose(item))}</span></p><p class="rb-quest-cue">${esc(item.cue)}</p>${
        alternatives.length ? `<p class="rb-quest-alt">${alternatives.join(" &middot; ")}</p>` : ""
      }</div></li>`;
    })
    .join("");

  return `<article class="rb-quest"><header class="rb-quest-head"><p class="rb-kicker">${esc(config.kicker ?? "Daily quest")}</p><${heading} class="rb-quest-name">${esc(quest.name)}</${heading}><ul class="rb-quest-meta"><li>About ${quest.estMinutes} min</li><li>${quest.items.length} exercises</li><li>Rest ${quest.restSeconds} sec between sets</li></ul></header><ol class="rb-quest-list">${items}</ol><p class="rb-quest-note">${esc(quest.warmup)} The time estimate includes about ${quest.overheadMinutes} minutes of warm-up and cool-down. Stop any exercise that causes pain.</p></article>`;
}

/** @param {ReturnType<typeof import("./engine.js").weeklyPlan>} plan */
export function renderWeek(plan) {
  const rows = plan.sessions
    .map((session) => {
      const list = session.quest.items.map((item) => `${esc(item.name)} ${esc(dose(item))}`).join("; ");
      return `<tr><th scope="row">${esc(session.day)}</th><td>${esc(FOCUS_LABELS[session.quest.options.focus])}</td><td><strong>${esc(session.quest.name)}</strong> <span class="rb-muted">(about ${session.quest.estMinutes} min)</span><br>${list}</td></tr>`;
    })
    .join("");
  const note = plan.capped ? `<p class="rb-note">Beginner weeks are capped at 4 training days so you get recovery days between sessions.</p>` : "";
  return `<div class="rb-table-wrap"><table class="rb-ranks rb-week"><caption class="rb-sr-only">Weekly training schedule</caption><thead><tr><th scope="col">Day</th><th scope="col">Focus</th><th scope="col">Quest</th></tr></thead><tbody>${rows}</tbody></table></div><p class="rb-note">Rest on the other ${7 - plan.sessions.length} days of the week. Rest days are part of the plan.</p>${note}`;
}

/** @param {ReturnType<typeof import("./engine.js").buildChallenge>} challenge */
export function renderChallenge(challenge) {
  /** @type {string[]} */
  const weeks = [];
  for (let week = 1; week <= 5; week += 1) {
    const days = challenge.calendar.filter((entry) => entry.week === week);
    if (days.length === 0) continue;
    const cells = days
      .map((entry) => {
        if (entry.rest || !entry.quest) {
          return `<li class="rb-day rb-day-rest"><span class="rb-day-num">Day ${entry.day}</span><span>Rest day</span></li>`;
        }
        return `<li class="rb-day"><details${entry.week === 1 ? " open" : ""}><summary><span class="rb-day-num">Day ${entry.day}</span><span><strong>${esc(entry.quest.name)}</strong> <span class="rb-muted">${esc(FOCUS_LABELS[entry.quest.options.focus])} &middot; about ${entry.quest.estMinutes} min</span></span></summary>${renderQuest(entry.quest, { heading: "h4", kicker: `Day ${entry.day} quest` })}</details></li>`;
      })
      .join("");
    weeks.push(`<h3 class="rb-week-heading">Week ${week}</h3><ol class="rb-calendar">${cells}</ol>`);
  }
  const { projection } = challenge;
  return `${weeks.join("")}<p class="rb-note">${challenge.trainingDays} training days in 30. Clear every quest in Rankbound and that is ${projection.xp.toLocaleString("en-US")} XP: Level ${projection.level}, Rank ${projection.rank} (+100 XP per daily quest, once per day).</p>`;
}

/** @param {ReturnType<typeof import("./pushups.js").planPushUps>} plan */
export function renderPushUps(plan) {
  const first = plan.weeks[0];
  const rows = plan.weeks
    .map((week) => `<tr><th scope="row">Week ${week.week}</th><td>${week.sets} × ${week.reps}</td><td>${week.totalReps}</td></tr>`)
    .join("");
  const graduate = plan.graduateAt
    ? `<li>When you can do ${plan.graduateAt} clean reps of ${esc(plan.variation.name.toLowerCase())} in one set, move up to ${esc(plan.next ?? "the next variation")}.</li>`
    : plan.next
      ? `<li>When these feel easy, you can add ${esc(plan.next)} for variety.</li>`
      : "";
  return `<div class="rb-result-summary"><p class="rb-kicker">Your starting set</p><p class="rb-big">${first.sets} × ${first.reps} ${esc(plan.variation.name)}</p><p class="rb-muted">${plan.days} days a week, ${plan.restSeconds} seconds of rest between sets, and at least one rest day between sessions.</p><p>${esc(plan.variation.cue)}</p></div><div class="rb-table-wrap"><table class="rb-ranks"><caption class="rb-sr-only">Four-week push-up plan</caption><thead><tr><th scope="col">Week</th><th scope="col">Sets × reps</th><th scope="col">Reps per session</th></tr></thead><tbody>${rows}</tbody></table></div><ul class="rb-checks rb-plain"><li>Stop each set 2 or more reps before your form breaks down. These are not max-effort sets.</li>${graduate}<li>${esc(plan.testDay)}</li></ul>`;
}

/** @param {ReturnType<typeof import("./opm.js").scaleRoutine>} result */
export function renderRoutine(result) {
  const rows = result.rows
    .map((row) => `<tr><th scope="row">Week ${row.week}</th><td>${row.pushups}</td><td>${row.situps}</td><td>${row.squats}</td><td>${row.run} min</td></tr>`)
    .join("");
  const { start } = result;
  const headline = result.capped
    ? `At this pace the full routine is more than ${MAX_WEEKS} weeks away. That is fine: the table shows where you would be after a year.`
    : `Following the ramp, you would reach the full ${TARGET_REPS} / ${TARGET_REPS} / ${TARGET_REPS} / ${TARGET_RUN_MINUTES}-minute session in about ${result.totalWeeks} weeks.`;
  return `<div class="rb-result-summary"><p class="rb-kicker">Your starting session</p><p class="rb-big">${start.pushups.sets} × ${start.pushups.reps} push-ups, ${start.situps.sets} × ${start.situps.reps} sit-ups, ${start.squats.sets} × ${start.squats.reps} squats</p><p>Plus ${start.runMinutes} minutes of easy walking or jogging, ${result.days} days a week.</p><p class="rb-muted">${esc(headline)}</p></div><div class="rb-table-wrap"><table class="rb-ranks"><caption class="rb-sr-only">Weekly totals per session</caption><thead><tr><th scope="col">Week</th><th scope="col">Push-ups</th><th scope="col">Sit-ups</th><th scope="col">Squats</th><th scope="col">Walk or jog</th></tr></thead><tbody>${rows}</tbody></table></div><p class="rb-note">Push-up, sit-up and squat numbers are total reps per session, split into ${result.sets} sets. The walk or jog target is about 10 km at a steady 7 min/km pace; yours will differ.</p>`;
}

// ---- Plain text for copy and share ----

/** @param {ReturnType<typeof import("./engine.js").generateWorkout>} quest */
export function questText(quest) {
  const lines = quest.items.map((item, index) => `${index + 1}. ${item.name}: ${dose(item)}`);
  return [`${quest.name} (about ${quest.estMinutes} min)`, ...lines, `Rest ${quest.restSeconds} sec between sets. ${quest.warmup}`].join("\n");
}

/** @param {ReturnType<typeof import("./engine.js").weeklyPlan>} plan */
export function weekText(plan) {
  return plan.sessions.map((session) => `${session.day} (${FOCUS_LABELS[session.quest.options.focus]}) – ${session.quest.name}: ${session.quest.items.map((item) => `${item.name} ${dose(item)}`).join(", ")}`).join("\n");
}

/** @param {ReturnType<typeof import("./pushups.js").planPushUps>} plan */
export function pushUpText(plan) {
  return [`Push-up plan (${plan.days} days a week, ${plan.variation.name})`, ...plan.weeks.map((week) => `Week ${week.week}: ${week.sets} × ${week.reps}`), `Rest ${plan.restSeconds} sec between sets.`].join("\n");
}

/** @param {ReturnType<typeof import("./opm.js").scaleRoutine>} result */
export function routineText(result) {
  return [`Scaled routine (${result.days} days a week)`, ...result.rows.map((row) => `Week ${row.week}: ${row.pushups} push-ups, ${row.situps} sit-ups, ${row.squats} squats, ${row.run} min walk or jog`)].join("\n");
}

/** @param {ReturnType<typeof import("./engine.js").buildChallenge>} challenge */
export function challengeText(challenge) {
  return challenge.calendar
    .map((entry) => (entry.rest || !entry.quest ? `Day ${entry.day}: Rest` : `Day ${entry.day}: ${entry.quest.name}\n${questText(entry.quest).split("\n").slice(1, -1).join("\n")}`))
    .join("\n");
}
