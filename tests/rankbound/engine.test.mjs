import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { generateWorkout, weeklyPlan, buildChallenge, normalizeOptions, targetFor, LEVELS, MINUTE_OPTIONS, FOCUSES, LEVEL_RULES, MAX_EXERCISES, WEEK_LAYOUTS, WEEK_FOCUS } from "../../assets/rankbound/tools/engine.js";
import { EXERCISES, EXERCISES_BY_ID } from "../../assets/rankbound/tools/exercises.js";
import { questText } from "../../assets/rankbound/tools/render.js";

const EQUIPMENT_SETS = [[], ["bar"], ["bench"], ["rope"], ["bar", "bench", "rope"]];

/** Every combination the UI can produce, over a few seeds. */
function* combinations() {
  for (const level of LEVELS)
    for (const minutes of MINUTE_OPTIONS)
      for (const focus of FOCUSES)
        for (const equipment of EQUIPMENT_SETS)
          for (const lowImpact of [false, true])
            for (const seed of [1, 2, 3, 4]) yield { level, minutes, focus, equipment, lowImpact, seed };
}

test("is deterministic: same options and seed give the same workout", () => {
  for (const input of combinations()) {
    assert.deepEqual(generateWorkout(input), generateWorkout({ ...input }));
  }
});

test("different seeds give variety", () => {
  const names = new Set();
  for (let seed = 1; seed <= 20; seed += 1) names.add(questText(generateWorkout({ level: "intermediate", minutes: 20, focus: "full", seed })));
  assert.ok(names.size >= 10, `expected variety, got ${names.size} distinct workouts`);
});

test("exercise ids match the app library and are unique", () => {
  assert.equal(EXERCISES.length, 45);
  assert.equal(new Set(EXERCISES.map((exercise) => exercise.id)).size, 45);
  for (const exercise of EXERCISES) {
    for (const link of [exercise.easier, exercise.harder]) {
      if (link) assert.ok(EXERCISES_BY_ID.has(link), `${exercise.id} links to missing ${link}`);
    }
  }
  // When the app repo sits next to this one, cross-check ids, names, units and defaults.
  const appFile = new URL("../../../rankbound/src/constants/exercise-library.ts", import.meta.url);
  if (existsSync(appFile)) {
    const source = readFileSync(appFile, "utf8");
    const pattern = /\{ id: "([^"]+)", name: "([^"]+)", category: "(\w+)", unit: "(\w+)", defaultSets: (\d+), defaultTarget: (\d+) \}/g;
    let count = 0;
    for (const match of source.matchAll(pattern)) {
      count += 1;
      const exercise = EXERCISES_BY_ID.get(match[1]);
      assert.ok(exercise, `app exercise ${match[1]} missing from web dataset`);
      assert.deepEqual([exercise.name, exercise.category, exercise.unit, exercise.defaultSets, exercise.defaultTarget], [match[2], match[3], match[4], Number(match[5]), Number(match[6])], match[1]);
    }
    assert.equal(count, 45, "expected to parse all 45 app exercises");
  }
});

test("selection respects level, equipment and impact rules", () => {
  for (const input of combinations()) {
    const workout = generateWorkout(input);
    const rules = LEVEL_RULES[input.level];
    const ids = workout.items.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length, "no duplicate exercises");
    assert.ok(ids.length >= 3 && ids.length <= MAX_EXERCISES, `exercise count ${ids.length}`);
    let high = 0;
    for (const item of workout.items) {
      const exercise = EXERCISES_BY_ID.get(item.id);
      assert.ok(exercise.tier <= rules.tier, `${item.id} too advanced for ${input.level}`);
      assert.ok(!exercise.long, `${item.id} is long-duration cardio`);
      assert.ok(exercise.equipment === "none" || input.equipment.includes(exercise.equipment), `${item.id} needs ${exercise.equipment}`);
      if (exercise.impact === "high") high += 1;
      if (input.level !== "beginner") assert.ok(!["knee-push-ups", "incline-push-ups"].includes(item.id), "regressions are beginner only");
      for (const alternative of [item.easier, item.harder]) {
        if (!alternative) continue;
        const other = EXERCISES_BY_ID.get(alternative.id);
        assert.ok(other.equipment === "none" || input.equipment.includes(other.equipment), "alternatives respect equipment");
        if (input.lowImpact) assert.notEqual(other.impact, "high");
      }
    }
    if (input.lowImpact) assert.equal(high, 0, "low impact means no jumping moves");
    assert.ok(high <= rules.maxHighImpact);
  }
});

test("workload stays within safe caps and fits the requested time", () => {
  for (const input of combinations()) {
    const workout = generateWorkout(input);
    const rules = LEVEL_RULES[input.level];
    assert.ok(workout.totalSets <= rules.totalSetCap, `${input.level} sets ${workout.totalSets}`);
    for (const item of workout.items) assert.ok(item.sets >= 1 && item.sets <= rules.maxSets);
    const ratio = workout.estMinutes / input.minutes;
    assert.ok(ratio >= 0.85 && ratio <= 1.15, `${JSON.stringify(input)} estimated ${workout.estMinutes} min`);
    assert.ok(workout.restSeconds >= 30 && workout.restSeconds <= 90);
  }
  // Beginners never get more rest-free or heavier than the documented limits.
  assert.equal(LEVEL_RULES.beginner.totalSetCap, 18);
  assert.equal(LEVEL_RULES.beginner.maxHighImpact, 2);
});

test("targets are whole numbers in sensible ranges", () => {
  for (const input of combinations()) {
    for (const item of generateWorkout(input).items) {
      assert.ok(Number.isInteger(item.target) && item.target > 0, `${item.id} target ${item.target}`);
      if (item.unit === "seconds") assert.ok(item.target >= 10 && item.target <= 90 && item.target % 5 === 0);
      if (item.unit === "reps") assert.ok(item.target <= 60);
      if (item.unit === "minutes") assert.ok(item.target <= 2);
    }
  }
  const pullUps = EXERCISES_BY_ID.get("pull-ups");
  assert.ok(targetFor(pullUps, "beginner") < targetFor(pullUps, "advanced"));
});

test("output formatting is safe and consistent", () => {
  const workout = generateWorkout({ level: "beginner", minutes: 20, focus: "full", seed: 5 });
  const text = questText(workout);
  assert.match(text, /^\S.* \(about \d+ min\)\n1\. .+: \d+ × \d+ (reps|sec|min)/);
  assert.doesNotMatch(text, /undefined|NaN|\[object/);
  assert.match(workout.warmup, /Warm up/);
});

test("edge-case inputs are normalized", () => {
  const options = normalizeOptions({ level: "godlike", minutes: "999", focus: "arms", equipment: "bar,hovercraft", seed: -5, lowImpact: "1" });
  assert.deepEqual([options.level, options.minutes, options.focus, options.equipment, options.lowImpact], ["beginner", 30, "full", ["bar"], true]);
  assert.equal(normalizeOptions({ minutes: "abc" }).minutes, 20);
  assert.ok(Number.isInteger(normalizeOptions({ seed: "NaN" }).seed));
  const empty = generateWorkout();
  assert.ok(empty.items.length >= 3);
  assert.doesNotThrow(() => generateWorkout({ level: null, minutes: null, equipment: null, focus: null, seed: Infinity }));
});

test("weekly plans leave rest days, vary focus, and cap beginners at 4 days", () => {
  for (const level of LEVELS) {
    for (const days of [2, 3, 4, 5, 6, 0, 99, "x"]) {
      const plan = weeklyPlan({ level, days, minutes: 20, seed: 3 });
      assert.ok(plan.sessions.length >= 2 && plan.sessions.length <= 6);
      if (level === "beginner") assert.ok(plan.sessions.length <= 4);
      assert.ok(plan.sessions.length < 7, "at least one rest day");
      const layout = WEEK_LAYOUTS[plan.sessions.length];
      for (let i = 1; i < layout.length; i += 1) {
        if (layout[i] - layout[i - 1] === 1) assert.notEqual(WEEK_FOCUS[plan.sessions.length][i], WEEK_FOCUS[plan.sessions.length][i - 1], "consecutive days differ");
      }
    }
  }
  assert.equal(weeklyPlan({ level: "beginner", days: 6 }).capped, true);
  assert.equal(weeklyPlan({ level: "advanced", days: 6 }).capped, false);
});

test("30-day challenge has rest days, ramps targets, and projects XP like the app", () => {
  for (const level of LEVELS) {
    for (const days of [3, 4, 5]) {
      const challenge = buildChallenge({ level, days, minutes: 15, seed: 1 });
      assert.equal(challenge.calendar.length, 30);
      const training = challenge.calendar.filter((entry) => !entry.rest);
      assert.equal(training.length, challenge.trainingDays);
      assert.equal(challenge.projection.xp, challenge.trainingDays * 100);
      assert.ok(challenge.calendar.some((entry) => entry.rest), "has rest days");
      // No more than 4 consecutive training days.
      let run = 0;
      for (const entry of challenge.calendar) {
        run = entry.rest ? 0 : run + 1;
        assert.ok(run <= 3, "at most 3 training days in a row");
      }
    }
  }
  const beginner = buildChallenge({ level: "beginner", days: 5 });
  assert.equal(beginner.days, 4);
});
