// @ts-check
// Push-up calculator: turns "how many strict push-ups can I do in one set?" into a conservative
// 4-week plan. These are rules of thumb, not a prescription: work well below your maximum, rest
// between sessions, and stop if something hurts.
import { EXERCISES_BY_ID } from "./exercises.js";

export const MAX_INPUT_REPS = 100;
export const SET_COUNT = 4;
export const REST_SECONDS = 90;
export const WEEKS = 4;

/** @param {unknown} value */
function toReps(value) {
  const number = Math.round(Number(value));
  return Number.isFinite(number) ? Math.min(MAX_INPUT_REPS, Math.max(0, number)) : 0;
}

/**
 * Pick the variation to train with, from the user's best strict set.
 * @param {number} max
 */
export function variationFor(max) {
  if (max <= 2) return "incline-push-ups";
  if (max <= 5) return "knee-push-ups";
  return "push-ups";
}

/**
 * @param {{ max?: unknown, days?: unknown }} [input]
 */
export function planPushUps(input = {}) {
  const max = toReps(input.max);
  const days = Number(input.days) === 4 ? 4 : 3;
  const variationId = variationFor(max);
  const variation = /** @type {import("./exercises.js").Exercise} */ (EXERCISES_BY_ID.get(variationId));

  // Training sets sit at about 60% of your best set; for the easier variations that is a flat start.
  const start = max <= 5 ? 6 : Math.max(1, Math.round(max * 0.6));
  const step = Math.max(1, Math.ceil(start * 0.1));
  const ceiling = max <= 5 ? start + step * (WEEKS - 1) : Math.max(start, Math.floor(max * 0.85));
  const weeks = Array.from({ length: WEEKS }, (_, index) => {
    const reps = Math.min(start + step * index, ceiling);
    return { week: index + 1, sets: SET_COUNT, reps, totalReps: SET_COUNT * reps };
  });

  const next = variationId === "incline-push-ups" ? "knee-push-ups" : variationId === "knee-push-ups" ? "push-ups" : max >= 30 ? "decline-push-ups" : null;
  const nextName = next ? EXERCISES_BY_ID.get(next)?.name ?? null : null;

  return {
    max,
    days,
    variation: { id: variation.id, name: variation.name, cue: variation.cue },
    restSeconds: REST_SECONDS,
    weeks,
    next: nextName,
    graduateAt: variationId === "push-ups" ? null : variationId === "knee-push-ups" ? 15 : 10,
    testDay: `After week ${WEEKS}, rest two days, then do one strict set with good form and stop when your form slips. Enter that number to build your next plan.`
  };
}
