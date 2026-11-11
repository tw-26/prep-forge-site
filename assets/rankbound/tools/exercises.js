// @ts-check
// Web exercise dataset for the free Rankbound tools.
//
// The ids, names, categories, units and default sets/targets are copied from the app's library
// (rankbound/src/constants/exercise-library.ts) so "build a similar workout in Rankbound" is literally
// possible. Equipment, movement pattern, tier, impact, pacing, progressions and cues are web-only
// additions written for these tools. Never rename an id; the app persists them.

/**
 * @typedef {"upper"|"lower"|"core"|"cardio"} Category
 * @typedef {"reps"|"seconds"|"minutes"} Unit
 * @typedef {"none"|"bar"|"bench"|"rope"|"bike"|"pool"} Equipment
 * @typedef {"push"|"pull"|"squat"|"lunge"|"bridge"|"core"|"cardio"} Pattern
 * @typedef {{
 *   id: string, name: string, category: Category, unit: Unit, defaultSets: number, defaultTarget: number,
 *   equipment: Equipment, pattern: Pattern, tier: 1|2|3, impact: "low"|"high", secPerRep: number,
 *   easier: string|null, harder: string|null, cue: string, long: boolean
 * }} Exercise
 */

// id, name, category, unit, sets, target, equipment, pattern, tier, impact, secPerRep, easier, harder, cue
/** @type {Array<[string,string,Category,Unit,number,number,Equipment,Pattern,1|2|3,"low"|"high",number,string|null,string|null,string]>} */
const ROWS = [
  // Upper body
  ["push-ups", "Push-ups", "upper", "reps", 3, 10, "none", "push", 1, "low", 3.5, "knee-push-ups", "decline-push-ups", "Hands under shoulders, body in one line, chest toward the floor."],
  ["knee-push-ups", "Knee Push-ups", "upper", "reps", 3, 10, "none", "push", 1, "low", 3.5, "incline-push-ups", "push-ups", "Knees down, hips in line with shoulders, lower with control."],
  ["incline-push-ups", "Incline Push-ups", "upper", "reps", 3, 10, "none", "push", 1, "low", 3, null, "knee-push-ups", "Hands on a sturdy counter, table or stairs; the higher the surface, the easier."],
  ["decline-push-ups", "Decline Push-ups", "upper", "reps", 3, 8, "bench", "push", 3, "low", 3.5, "push-ups", null, "Feet on a stable bench or chair; keep your core tight and hips level."],
  ["wide-push-ups", "Wide Push-ups", "upper", "reps", 3, 10, "none", "push", 2, "low", 3.5, "knee-push-ups", "decline-push-ups", "Hands a little wider than shoulders, elbows angled back, not flared."],
  ["diamond-push-ups", "Diamond Push-ups", "upper", "reps", 3, 8, "none", "push", 2, "low", 3.5, "push-ups", null, "Hands close under your chest; lower slowly and keep elbows near your ribs."],
  ["pike-push-ups", "Pike Push-ups", "upper", "reps", 3, 8, "none", "push", 2, "low", 3.5, "push-ups", null, "Hips high in an upside-down V; bend elbows and lower the top of your head toward the floor."],
  ["pull-ups", "Pull-ups", "upper", "reps", 3, 5, "bar", "pull", 3, "low", 4, "chin-ups", null, "Start from a full hang, pull your chest toward the bar, lower under control."],
  ["chin-ups", "Chin-ups", "upper", "reps", 3, 5, "bar", "pull", 2, "low", 4, "inverted-rows", "pull-ups", "Palms toward you, shoulders away from your ears, pull until your chin clears the bar."],
  ["inverted-rows", "Inverted Rows", "upper", "reps", 3, 8, "bar", "pull", 1, "low", 3.5, null, "chin-ups", "Hang under a sturdy low bar, body straight, pull your chest to the bar."],
  ["bench-dips", "Bench Dips", "upper", "reps", 3, 10, "bench", "push", 2, "low", 3, null, null, "Hands on a stable bench, lower until elbows reach about 90 degrees. Skip if your shoulders feel pinched."],

  // Lower body
  ["squats", "Squats", "lower", "reps", 3, 15, "none", "squat", 1, "low", 3, null, "bulgarian-split-squats", "Feet about shoulder width, sit back and down, knees track over toes."],
  ["jump-squats", "Jump Squats", "lower", "reps", 3, 10, "none", "squat", 2, "high", 2.5, "squats", null, "Squat down, jump, and land softly with bent knees."],
  ["sumo-squats", "Sumo Squats", "lower", "reps", 3, 15, "none", "squat", 1, "low", 3, null, null, "Wide stance with toes turned out; keep your chest tall as you lower."],
  ["lunges", "Lunges", "lower", "reps", 3, 10, "none", "lunge", 1, "low", 3.5, "reverse-lunges", "bulgarian-split-squats", "Long step forward, lower your back knee toward the floor, push back up."],
  ["reverse-lunges", "Reverse Lunges", "lower", "reps", 3, 10, "none", "lunge", 1, "low", 3.5, "squats", "lunges", "Step back and lower; most of your weight stays on the front leg."],
  ["side-lunges", "Side Lunges", "lower", "reps", 3, 10, "none", "lunge", 2, "low", 3.5, "reverse-lunges", null, "Step wide, sit into one hip with the other leg straight, push back to center."],
  ["bulgarian-split-squats", "Bulgarian Split Squats", "lower", "reps", 3, 8, "bench", "lunge", 3, "low", 4, "reverse-lunges", null, "Rear foot on a bench, lower straight down, keep most weight on the front leg."],
  ["step-ups", "Step-ups", "lower", "reps", 3, 10, "bench", "lunge", 1, "low", 3.5, null, "bulgarian-split-squats", "Place your whole foot on a stable step, drive up through that heel, step down slowly."],
  ["glute-bridges", "Glute Bridges", "lower", "reps", 3, 15, "none", "bridge", 1, "low", 3, null, null, "Lie on your back, feet flat, press through your heels to lift your hips."],
  ["calf-raises", "Calf Raises", "lower", "reps", 3, 20, "none", "bridge", 1, "low", 2.5, null, null, "Rise onto the balls of your feet, pause at the top, lower slowly."],
  ["wall-sit", "Wall Sit", "lower", "seconds", 3, 30, "none", "squat", 1, "low", 1, null, null, "Back flat on the wall, knees at about 90 degrees, breathe steadily."],

  // Core
  ["plank", "Plank", "core", "seconds", 3, 30, "none", "core", 1, "low", 1, null, null, "Forearms down, body in a straight line; do not let your hips sag."],
  ["side-plank", "Side Plank", "core", "seconds", 2, 20, "none", "core", 2, "low", 1, "plank", null, "Stack your feet, lift your hips, keep your body in one line."],
  ["hollow-hold", "Hollow Hold", "core", "seconds", 3, 20, "none", "core", 3, "low", 1, "dead-bugs", null, "Press your lower back into the floor, lift shoulders and legs slightly."],
  ["sit-ups", "Sit-ups", "core", "reps", 3, 15, "none", "core", 1, "low", 3, "crunches", null, "Rise with your core, not by pulling on your neck."],
  ["crunches", "Crunches", "core", "reps", 3, 15, "none", "core", 1, "low", 2.5, null, "sit-ups", "Lift your shoulder blades only; keep your chin off your chest."],
  ["bicycle-crunches", "Bicycle Crunches", "core", "reps", 3, 20, "none", "core", 1, "low", 2, "crunches", null, "Slow, alternating elbow-to-knee; avoid yanking your head."],
  ["leg-raises", "Leg Raises", "core", "reps", 3, 10, "none", "core", 2, "low", 3.5, "dead-bugs", null, "Press your lower back down and lower your legs only as far as you can control."],
  ["flutter-kicks", "Flutter Kicks", "core", "seconds", 3, 30, "none", "core", 2, "low", 1, "dead-bugs", null, "Small, quick alternating kicks with your lower back pressed down."],
  ["russian-twists", "Russian Twists", "core", "reps", 3, 20, "none", "core", 2, "low", 2, "bicycle-crunches", null, "Lean back slightly, rotate your ribs, not just your arms."],
  ["mountain-climbers", "Mountain Climbers", "core", "reps", 3, 20, "none", "core", 2, "high", 1.5, "plank", null, "High plank, drive knees toward your chest in a steady rhythm."],
  ["dead-bugs", "Dead Bugs", "core", "reps", 3, 10, "none", "core", 1, "low", 3, null, "hollow-hold", "Opposite arm and leg lower slowly while your lower back stays flat."],
  ["supermans", "Supermans", "core", "reps", 3, 12, "none", "core", 1, "low", 3, null, null, "Lift arms and legs a few inches, pause, and lower with control."],

  // Cardio
  ["jumping-jacks", "Jumping Jacks", "cardio", "reps", 3, 30, "none", "cardio", 1, "high", 1.2, null, null, "Land softly and keep a steady rhythm."],
  ["burpees", "Burpees", "cardio", "reps", 3, 8, "none", "cardio", 3, "high", 5, "squats", null, "Drop to the floor, press back up, and stand. Step instead of jumping to ease it."],
  ["high-knees", "High Knees", "cardio", "seconds", 3, 30, "none", "cardio", 1, "high", 1, "jumping-jacks", null, "Drive your knees up and stay tall, pumping your arms."],
  ["butt-kicks", "Butt Kicks", "cardio", "seconds", 3, 30, "none", "cardio", 1, "high", 1, null, null, "Quick jog in place, heels toward your glutes."],
  ["skaters", "Skaters", "cardio", "reps", 3, 20, "none", "cardio", 2, "high", 2.5, "side-lunges", null, "Bound side to side, landing softly on one leg at a time."],
  ["jump-rope", "Jump Rope", "cardio", "minutes", 3, 2, "rope", "cardio", 2, "high", 60, null, null, "Small hops on the balls of your feet, wrists doing the turning."],
  ["walking", "Walking", "cardio", "minutes", 1, 30, "none", "cardio", 1, "low", 60, null, "running", "Brisk, comfortable pace on a flat route."],
  ["running", "Running", "cardio", "minutes", 1, 20, "none", "cardio", 2, "high", 60, "walking", null, "Easy pace where you could still speak in short sentences."],
  ["cycling", "Cycling", "cardio", "minutes", 1, 30, "bike", "cardio", 1, "low", 60, null, null, "Steady pace, seat height set so your knee is slightly bent at the bottom."],
  ["swimming", "Swimming", "cardio", "minutes", 1, 20, "pool", "cardio", 2, "low", 60, null, null, "Steady laps with rests whenever you need them."],
  ["stair-climbing", "Stair Climbing", "cardio", "minutes", 1, 10, "none", "cardio", 2, "high", 60, null, null, "Whole foot on each step; use the rail if you need it."]
];

const LONG_IDS = new Set(["walking", "running", "cycling", "swimming", "stair-climbing"]);

/** @type {readonly Exercise[]} */
export const EXERCISES = Object.freeze(
  ROWS.map(([id, name, category, unit, defaultSets, defaultTarget, equipment, pattern, tier, impact, secPerRep, easier, harder, cue]) =>
    Object.freeze({ id, name, category, unit, defaultSets, defaultTarget, equipment, pattern, tier, impact, secPerRep, easier, harder, cue, long: LONG_IDS.has(id) })
  )
);

/** @type {ReadonlyMap<string, Exercise>} */
export const EXERCISES_BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

/** Exercises the generator may schedule as sets (excludes long steady-state cardio). */
export const GENERATOR_POOL = EXERCISES.filter((exercise) => !exercise.long);

/** @param {string} id */
export function exerciseName(id) {
  return EXERCISES_BY_ID.get(id)?.name ?? id;
}
