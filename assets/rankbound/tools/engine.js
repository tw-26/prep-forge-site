// @ts-check
// Deterministic, rule-based workout generator. No network, no AI: the same options and seed always
// produce the same workout, so the build can render the default result into static HTML and the
// browser can reproduce it exactly.
import { GENERATOR_POOL, EXERCISES_BY_ID } from "./exercises.js";
import { projectQuests } from "./progression.js";

/** @typedef {"beginner"|"intermediate"|"advanced"} Level */
/** @typedef {"full"|"upper"|"lower"|"core"|"cardio"} Focus */
/**
 * @typedef {{
 *   level: Level, minutes: number, equipment: string[], focus: Focus,
 *   lowImpact: boolean, seed: number, bump: number
 * }} Options
 */

export const LEVELS = /** @type {const} */ (["beginner", "intermediate", "advanced"]);
export const MINUTE_OPTIONS = [10, 15, 20, 30];
export const FOCUSES = /** @type {const} */ (["full", "upper", "lower", "core", "cardio"]);
export const EQUIPMENT_OPTIONS = /** @type {const} */ (["bar", "bench", "rope"]);
export const MAX_EXERCISES = 8;

/** Safety rails per level. Beginners get fewer sets, lighter targets and more rest. */
export const LEVEL_RULES = {
  beginner: { tier: 1, baseSets: 2, maxSets: 3, totalSetCap: 18, rest: 60, factor: 0.7, maxHighImpact: 2 },
  intermediate: { tier: 2, baseSets: 3, maxSets: 4, totalSetCap: 26, rest: 50, factor: 1, maxHighImpact: 4 },
  advanced: { tier: 3, baseSets: 3, maxSets: 4, totalSetCap: 32, rest: 45, factor: 1.3, maxHighImpact: 5 }
};

/** Which movement patterns each slot of a focus accepts, in order. */
const SLOTS = {
  full: [["push"], ["squat", "lunge"], ["pull", "bridge"], ["core"], ["cardio"], ["push", "pull"], ["lunge", "bridge"], ["core"]],
  upper: [["push"], ["pull", "push"], ["push"], ["core"], ["pull", "push"], ["push"], ["core"], ["push"]],
  lower: [["squat"], ["lunge"], ["bridge"], ["squat", "lunge"], ["core"], ["bridge", "lunge"], ["squat"], ["core"]],
  core: [["core"], ["core"], ["core"], ["core"], ["bridge"], ["core"], ["core"], ["cardio"]],
  cardio: [["cardio"], ["squat", "lunge"], ["cardio"], ["core"], ["cardio"], ["lunge", "bridge"], ["cardio"], ["squat"]]
};

const FOCUS_CATEGORIES = {
  full: ["upper", "lower", "core", "cardio"],
  upper: ["upper", "core"],
  lower: ["lower", "core"],
  core: ["core", "lower"],
  cardio: ["cardio", "lower", "core"]
};

/** Regressions that appear as "Easier" options, but are not scheduled above beginner level. */
const BEGINNER_ONLY = new Set(["knee-push-ups", "incline-push-ups"]);

const START_COUNT = { 10: 3, 15: 4, 20: 5, 30: 6 };
const ADJECTIVES = ["Ember", "Iron", "Silent", "Rising", "Crimson", "Hollow", "Steel", "Storm", "Azure", "Verdant", "Gilded", "Lunar"];
const NOUNS = ["Trial", "Vigil", "Gauntlet", "Ascent", "Rite", "Circuit", "Oath", "Run", "Forge", "Crossing"];

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Training-day positions within a week (0 = first day), spaced so rest days fall between sessions. */
export const WEEK_LAYOUTS = { 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5] };
/** Focus per training day. Consecutive training days never repeat a focus. */
export const WEEK_FOCUS = {
  2: ["full", "full"],
  3: ["full", "full", "full"],
  4: ["upper", "lower", "upper", "lower"],
  5: ["upper", "lower", "full", "upper", "lower"],
  6: ["upper", "lower", "core", "upper", "lower", "cardio"]
};

/** @param {number} seed */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Coerce anything (URL params, form values) into valid options.
 * @param {Record<string, any>} [input]
 * @returns {Options}
 */
export function normalizeOptions(input = {}) {
  const level = LEVELS.includes(input.level) ? input.level : "beginner";
  const rawMinutes = Number(input.minutes);
  const minutes = MINUTE_OPTIONS.reduce((best, option) =>
    Math.abs(option - (Number.isFinite(rawMinutes) ? rawMinutes : 20)) < Math.abs(best - (Number.isFinite(rawMinutes) ? rawMinutes : 20)) ? option : best
  );
  const equipmentList = Array.isArray(input.equipment)
    ? input.equipment
    : typeof input.equipment === "string"
      ? input.equipment.split(",")
      : [];
  const equipment = EQUIPMENT_OPTIONS.filter((item) => equipmentList.includes(item));
  const focus = FOCUSES.includes(input.focus) ? input.focus : "full";
  const seedNumber = Number(input.seed);
  const seed = Number.isFinite(seedNumber) ? Math.abs(Math.trunc(seedNumber)) >>> 0 : 1;
  const bumpNumber = Number(input.bump);
  const bump = Number.isFinite(bumpNumber) && bumpNumber > 0 ? Math.min(bumpNumber, 2) : 1;
  return { level, minutes, equipment, focus, lowImpact: input.lowImpact === true || input.lowImpact === "1" || input.lowImpact === "true", seed, bump };
}

/**
 * @param {import("./exercises.js").Exercise} exercise
 * @param {string[]} equipment
 */
function hasEquipment(exercise, equipment) {
  return exercise.equipment === "none" || equipment.includes(exercise.equipment);
}

/**
 * Target for one set at a level. Seconds round to 5; minutes stay whole.
 * @param {import("./exercises.js").Exercise} exercise
 * @param {Level} level
 * @param {number} bump
 * @param {number} sessionMinutes
 */
export function targetFor(exercise, level, bump = 1, sessionMinutes = 20) {
  const factor = LEVEL_RULES[level].factor * bump;
  if (exercise.unit === "minutes") return level === "beginner" || sessionMinutes <= 10 ? 1 : 2;
  if (exercise.unit === "seconds") return Math.max(10, Math.round((exercise.defaultTarget * factor) / 5) * 5);
  const reps = Math.max(1, Math.round(exercise.defaultTarget * factor));
  return reps >= 20 ? Math.round(reps / 5) * 5 : reps;
}

/** @param {import("./exercises.js").Exercise} exercise @param {number} target */
function workSeconds(exercise, target) {
  if (exercise.unit === "reps") return target * exercise.secPerRep;
  if (exercise.unit === "seconds") return target;
  return target * 60;
}

/** Warm-up and cool-down time folded into the estimate (not part of the set list). */
export function overheadMinutes(minutes) {
  return minutes >= 15 ? 4 : 2;
}

/** @param {{exercise: import("./exercises.js").Exercise, target: number, sets: number}[]} items */
function estimateMinutes(items, rest, minutes) {
  const seconds = items.reduce((sum, item) => sum + item.sets * (workSeconds(item.exercise, item.target) + rest), 0);
  return seconds / 60 + overheadMinutes(minutes);
}

/** @param {string} unit @param {number} target */
export function formatTarget(unit, target) {
  if (unit === "reps") return `${target} reps`;
  if (unit === "seconds") return `${target} sec`;
  return `${target} min`;
}

/**
 * @param {Record<string, any>} [input]
 */
export function generateWorkout(input = {}) {
  const options = normalizeOptions(input);
  const rules = LEVEL_RULES[options.level];
  const random = mulberry32(options.seed);
  const maxHigh = options.lowImpact ? 0 : rules.maxHighImpact;
  // Short sessions use shorter rests so intermediate and advanced quests still fit in 10 minutes.
  const rest = options.minutes === 10 && options.level !== "beginner" ? 30 : rules.rest;

  const eligible = GENERATOR_POOL.filter(
    (exercise) => exercise.tier <= rules.tier && !(options.level !== "beginner" && BEGINNER_ONLY.has(exercise.id)) && hasEquipment(exercise, options.equipment) && !(options.lowImpact && exercise.impact === "high")
  );
  const slots = SLOTS[options.focus];
  const categories = FOCUS_CATEGORIES[options.focus];

  /** @type {{exercise: import("./exercises.js").Exercise, target: number, sets: number}[]} */
  const items = [];
  const used = new Set();
  let highImpact = 0;

  /** @param {import("./exercises.js").Exercise[]} list */
  const choose = (list) => list[Math.floor(random() * list.length)];

  function addNext() {
    const slot = slots[items.length % slots.length];
    const open = eligible.filter((exercise) => !used.has(exercise.id) && (exercise.impact !== "high" || highImpact < maxHigh));
    let candidates = open.filter((exercise) => slot.includes(exercise.pattern));
    if (candidates.length === 0) candidates = open.filter((exercise) => categories.includes(exercise.category));
    if (candidates.length === 0) candidates = open;
    if (candidates.length === 0) return false;
    const exercise = choose(candidates);
    used.add(exercise.id);
    if (exercise.impact === "high") highImpact += 1;
    items.push({ exercise, target: targetFor(exercise, options.level, options.bump, options.minutes), sets: rules.baseSets });
    return true;
  }

  for (let i = 0; i < START_COUNT[/** @type {10|15|20|30} */ (options.minutes)]; i += 1) addNext();

  const totalSets = () => items.reduce((sum, item) => sum + item.sets, 0);
  const estimate = () => estimateMinutes(items, rest, options.minutes);

  // Grow toward the requested time without exceeding the per-level workload caps.
  for (let guard = 0; estimate() < options.minutes * 0.92 && guard < 200; guard += 1) {
    const room = items.filter((item) => item.sets < rules.maxSets).sort((a, b) => a.sets - b.sets)[0];
    if (room && totalSets() < rules.totalSetCap) {
      room.sets += 1;
    } else if (items.length < MAX_EXERCISES && totalSets() + rules.baseSets <= rules.totalSetCap && addNext()) {
      continue;
    } else {
      break;
    }
  }

  // Trim if we overshoot.
  for (let guard = 0; estimate() > options.minutes * 1.1 && guard < 200; guard += 1) {
    const heavy = items.filter((item) => item.sets > 2).sort((a, b) => b.sets - a.sets)[0];
    if (heavy) {
      heavy.sets -= 1;
    } else if (items.length > 3) {
      const removed = items.pop();
      if (removed?.exercise.impact === "high") highImpact -= 1;
    } else {
      break;
    }
  }

  const available = (/** @type {string|null} */ id) => {
    const exercise = id ? EXERCISES_BY_ID.get(id) : undefined;
    return exercise && hasEquipment(exercise, options.equipment) && !(options.lowImpact && exercise.impact === "high")
      ? { id: exercise.id, name: exercise.name }
      : null;
  };

  const estMinutes = Math.round(estimate());
  const name = `${ADJECTIVES[Math.floor(random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(random() * NOUNS.length)]}`;

  return {
    options,
    name,
    items: items.map((item) => ({
      id: item.exercise.id,
      name: item.exercise.name,
      category: item.exercise.category,
      unit: item.exercise.unit,
      sets: item.sets,
      target: item.target,
      cue: item.exercise.cue,
      easier: available(item.exercise.easier),
      harder: available(item.exercise.harder)
    })),
    totalSets: totalSets(),
    restSeconds: rest,
    estMinutes,
    overheadMinutes: overheadMinutes(options.minutes),
    warmup:
      options.minutes >= 15
        ? "Warm up for 2 to 3 minutes first: march in place, circle your arms, and do a few easy bodyweight squats."
        : "Warm up for 1 to 2 minutes first: march in place and circle your arms and hips."
  };
}

/**
 * @param {Level} level
 * @param {number} days
 */
export function clampDays(level, days) {
  const number = Math.round(Number(days));
  const value = Number.isFinite(number) ? Math.min(6, Math.max(2, number)) : 3;
  return level === "beginner" ? Math.min(value, 4) : value;
}

/**
 * One quest per training day, spread across the week with rest days between.
 * @param {Record<string, any>} [input]
 */
export function weeklyPlan(input = {}) {
  const options = normalizeOptions(input);
  const requested = clampDays("advanced", input.days);
  const days = clampDays(options.level, input.days);
  const layout = WEEK_LAYOUTS[/** @type {2|3|4|5|6} */ (days)];
  const focuses = WEEK_FOCUS[/** @type {2|3|4|5|6} */ (days)];
  const sessions = layout.map((position, index) => ({
    day: DAY_LABELS[position],
    quest: generateWorkout({ ...options, focus: focuses[index], seed: options.seed + (index + 1) * 7919 })
  }));
  return { days, capped: days < requested, sessions };
}

/**
 * A 30-day quest line: training days follow the weekly layout, targets ramp gently by week.
 * @param {Record<string, any>} [input]
 */
export function buildChallenge(input = {}) {
  const options = normalizeOptions(input);
  const days = Math.max(3, clampDays(options.level, input.days));
  const layout = WEEK_LAYOUTS[/** @type {2|3|4|5|6} */ (days)];
  const focuses = WEEK_FOCUS[/** @type {2|3|4|5|6} */ (days)];
  /** @type {Array<{day: number, week: number, rest: boolean, quest?: ReturnType<typeof generateWorkout>}>} */
  const calendar = [];
  let trainingDays = 0;

  for (let index = 0; index < 30; index += 1) {
    const week = Math.floor(index / 7);
    const slot = layout.indexOf(index % 7);
    if (slot < 0) {
      calendar.push({ day: index + 1, week: week + 1, rest: true });
      continue;
    }
    trainingDays += 1;
    calendar.push({
      day: index + 1,
      week: week + 1,
      rest: false,
      quest: generateWorkout({ ...options, focus: focuses[slot], bump: 1 + 0.05 * week, seed: options.seed + (index + 1) * 104729 })
    });
  }

  return { options, days, calendar, trainingDays, projection: projectQuests(trainingDays) };
}
