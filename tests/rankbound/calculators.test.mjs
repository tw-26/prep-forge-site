import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { xpToReachLevel, levelForXp, rankForLevel, projectQuests, RANKS } from "../../assets/rankbound/tools/progression.js";
import { planPushUps, variationFor, WEEKS } from "../../assets/rankbound/tools/pushups.js";
import { scaleRoutine, ramp, TARGET_REPS, TARGET_RUN_MINUTES, MAX_WEEKS } from "../../assets/rankbound/tools/opm.js";
import { renderPushUps, renderRoutine } from "../../assets/rankbound/tools/render.js";

test("progression matches the app's documented XP per rank", () => {
  const expected = { F: 0, E: 400, D: 1400, C: 4100, B: 9900, A: 17200, S: 31800 };
  for (const { rank, level } of RANKS) assert.equal(xpToReachLevel(level), expected[rank], `rank ${rank}`);
  assert.deepEqual([1, 2, 5, 6, 10].map(xpToReachLevel), [0, 100, 400, 600, 1400]);
  assert.equal(levelForXp(1299), 9);
  assert.equal(levelForXp(1400), 10);
  assert.equal(rankForLevel(4), "F");
  assert.equal(rankForLevel(5), "E");
  assert.equal(rankForLevel(75), "S");
  assert.deepEqual(projectQuests(13), { quests: 13, xp: 1300, level: 9, rank: "E" });
  assert.equal(projectQuests(-3).xp, 0);
});

test("progression agrees with the app source when it is available", () => {
  const file = new URL("../../../rankbound/src/constants/progression.ts", import.meta.url);
  if (!existsSync(file)) return;
  const source = readFileSync(file, "utf8");
  assert.match(source, /QUEST_REWARD_XP\s*=\s*100/);
  assert.match(source, /EARLY_LEVEL_THRESHOLDS[^=]*=\s*\[\s*0,\s*100,\s*200,\s*300,\s*400,\s*600,\s*700,\s*900,\s*1100,\s*1400,?\s*\]/);
  assert.match(source, /XP_CURVE_BASE\s*=\s*50/);
  for (const { rank, level } of RANKS) assert.match(source, new RegExp(`rank: "${rank}", minLevel: ${level}\\b`));
});

test("push-up plan: variation, caps and monotonic, gradual ramps", () => {
  assert.equal(variationFor(0), "incline-push-ups");
  assert.equal(variationFor(2), "incline-push-ups");
  assert.equal(variationFor(3), "knee-push-ups");
  assert.equal(variationFor(6), "push-ups");
  for (const max of [0, 1, 2, 3, 5, 6, 8, 10, 15, 25, 30, 60, 100, 500, -4, "12", "x", null, undefined, 7.6]) {
    const plan = planPushUps({ max, days: 3 });
    assert.equal(plan.weeks.length, WEEKS);
    let previous = 0;
    for (const week of plan.weeks) {
      assert.ok(Number.isInteger(week.reps) && week.reps >= 1);
      assert.ok(week.reps >= previous, "reps never go down");
      assert.ok(week.reps - previous <= Math.max(1, Math.ceil(Math.max(previous, 1) * 0.1)) || previous === 0, "gradual weekly increase");
      assert.equal(week.totalReps, week.sets * week.reps);
      previous = week.reps;
    }
    assert.ok(plan.weeks[0].reps <= Math.max(6, Math.round(plan.max * 0.6)), "starts at or below 60% of max (easier variations start at 6)");
    if (plan.max > 5) assert.ok(plan.weeks[WEEKS - 1].reps <= Math.max(plan.weeks[0].reps, Math.floor(plan.max * 0.85)), "never prescribes near-max sets");
    assert.ok(plan.restSeconds >= 60);
  }
  assert.equal(planPushUps({ days: 4 }).days, 4);
  assert.equal(planPushUps({ days: 7 }).days, 3);
});

test("push-up and routine HTML escape and render without placeholders", () => {
  const html = renderPushUps(planPushUps({ max: 12, days: 3 }));
  assert.doesNotMatch(html, /undefined|NaN|\[object/);
  assert.match(html, /Week 4/);
  const routine = renderRoutine(scaleRoutine({ pushups: 10, situps: 15, squats: 20, minutes: 15 }));
  assert.doesNotMatch(routine, /undefined|NaN|\[object/);
});

test("ramp is gradual, bounded and ends at the goal", () => {
  const values = ramp(18, TARGET_REPS, 3);
  assert.equal(values[0], 18);
  assert.equal(values[values.length - 1], TARGET_REPS);
  for (let i = 1; i < values.length; i += 1) {
    assert.ok(values[i] > values[i - 1]);
    assert.ok(values[i] - values[i - 1] <= Math.max(3, Math.ceil(values[i - 1] * 0.1)));
  }
  assert.ok(ramp(1, 1000, 1).length <= MAX_WEEKS, "never more than a year of rows");
  assert.deepEqual(ramp(200, 100, 3), [100], "already past the goal");
});

test("routine scaler handles zero, extreme and invalid input", () => {
  for (const input of [{}, { pushups: 0, situps: 0, squats: 0, minutes: 0 }, { pushups: 500, situps: 500, squats: 500, minutes: 500 }, { pushups: "a", days: "z" }, { pushups: 10, situps: 20, squats: 30, minutes: 20, days: 4 }]) {
    const result = scaleRoutine(input);
    assert.ok(result.days === 3 || result.days === 4);
    assert.ok(result.rows.length >= 1 && result.rows[0].week === 1);
    for (const track of ["pushups", "situps", "squats"]) {
      assert.ok(result.rows.every((row) => row[track] >= 1 && row[track] <= TARGET_REPS), `${track} stays within 1..${TARGET_REPS}`);
    }
    assert.ok(result.rows.every((row) => row.run >= 5 && row.run <= Math.max(TARGET_RUN_MINUTES, result.start.runMinutes)));
    assert.ok(result.start.pushups.reps >= 1);
    assert.equal(result.capped, result.totalWeeks === null);
  }
  const beginner = scaleRoutine({ pushups: 0, situps: 0, squats: 0, minutes: 0 });
  assert.ok(beginner.start.pushups.reps >= 1 && beginner.start.runMinutes === 5);
  const strong = scaleRoutine({ pushups: 100, situps: 100, squats: 100, minutes: 70 });
  assert.equal(strong.totalWeeks, 1);
});
