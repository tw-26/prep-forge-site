// @ts-check
// Scaler for the fictional "100 push-ups, 100 sit-ups, 100 squats and a 10 km run" routine.
// It starts from what you can do now and ramps about 10% a week (at least 3 reps, at least 2 minutes)
// on 3 or 4 training days a week, instead of starting at the full fictional volume.

export const TARGET_REPS = 100;
/** About 10 km at a steady 7 min/km walk-jog pace. Your pace will differ. */
export const TARGET_RUN_MINUTES = 70;
export const SETS = 3;
export const MAX_WEEKS = 52;

/** @param {unknown} value @param {number} max */
function clampInt(value, max) {
  const number = Math.round(Number(value));
  return Number.isFinite(number) ? Math.min(max, Math.max(0, number)) : 0;
}

/**
 * @param {number} start
 * @param {number} goal
 * @param {number} minStep
 * @returns {number[]} value per week, week 1 first, ending at goal (or after MAX_WEEKS)
 */
export function ramp(start, goal, minStep) {
  const values = [Math.min(start, goal)];
  while (values[values.length - 1] < goal && values.length < MAX_WEEKS) {
    const previous = values[values.length - 1];
    values.push(Math.min(goal, previous + Math.max(minStep, Math.ceil(previous * 0.1))));
  }
  return values;
}

/**
 * @param {{ pushups?: unknown, situps?: unknown, squats?: unknown, minutes?: unknown, days?: unknown }} [input]
 */
export function scaleRoutine(input = {}) {
  const maxes = {
    pushups: clampInt(input.pushups, 200),
    situps: clampInt(input.situps, 200),
    squats: clampInt(input.squats, 300)
  };
  const days = Number(input.days) === 4 ? 4 : 3;
  const comfortableMinutes = clampInt(input.minutes, 180);

  /** @param {number} max */
  const startTotal = (max) => Math.max(SETS, SETS * Math.max(1, Math.round(max * 0.6)));
  const tracks = {
    pushups: ramp(startTotal(maxes.pushups), TARGET_REPS, 3),
    situps: ramp(startTotal(maxes.situps), TARGET_REPS, 3),
    squats: ramp(startTotal(maxes.squats), TARGET_REPS, 3),
    run: ramp(Math.max(5, comfortableMinutes), TARGET_RUN_MINUTES, 2)
  };

  const longest = Math.max(tracks.pushups.length, tracks.situps.length, tracks.squats.length, tracks.run.length);
  const reached = (/** @type {number[]} */ track, /** @type {number} */ goal) => (track[track.length - 1] >= goal ? track.length : null);
  const weeksToGoal = {
    pushups: reached(tracks.pushups, TARGET_REPS),
    situps: reached(tracks.situps, TARGET_REPS),
    squats: reached(tracks.squats, TARGET_REPS),
    run: reached(tracks.run, TARGET_RUN_MINUTES)
  };
  const allReached = Object.values(weeksToGoal).every((weeks) => weeks !== null);

  const at = (/** @type {number[]} */ track, /** @type {number} */ index) => track[Math.min(index, track.length - 1)];
  const shown = new Set([0, 1, 2, 3, 5, 7, 9, 11, longest - 1].filter((index) => index >= 0 && index < longest));
  const rows = [...shown]
    .sort((a, b) => a - b)
    .map((index) => ({
      week: index + 1,
      pushups: at(tracks.pushups, index),
      situps: at(tracks.situps, index),
      squats: at(tracks.squats, index),
      run: at(tracks.run, index)
    }));

  return {
    maxes,
    days,
    comfortableMinutes,
    sets: SETS,
    weeksToGoal,
    totalWeeks: allReached ? longest : null,
    capped: !allReached,
    start: {
      pushups: { sets: SETS, reps: Math.max(1, Math.round(maxes.pushups * 0.6)) },
      situps: { sets: SETS, reps: Math.max(1, Math.round(maxes.situps * 0.6)) },
      squats: { sets: SETS, reps: Math.max(1, Math.round(maxes.squats * 0.6)) },
      runMinutes: Math.max(5, comfortableMinutes)
    },
    rows
  };
}
