// Page definitions for the Rankbound tool pages. Each page has a distinct search intent, its own
// copy, FAQ and sample results. The shared engine (assets/rankbound/tools/) produces the workouts.
export const RANKBOUND_APP_ID = "6827804631";
export const UPDATED = "2026-11-10";
export const UPDATED_LABEL = "November 10, 2026";

export const SOURCES = {
  hhs: {
    name: "U.S. Department of Health and Human Services: Physical Activity Guidelines for Americans, 2nd edition",
    url: "https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines"
  },
  acsm: {
    name: "American College of Sports Medicine position stand: Progression models in resistance training for healthy adults",
    url: "https://pubmed.ncbi.nlm.nih.gov/19204579/"
  },
  nhs: {
    name: "NHS: Strength and flexibility exercises",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/"
  },
  ace: {
    name: "American Council on Exercise: Exercise library",
    url: "https://www.acefitness.org/resources/everyone/exercise-library/"
  }
};

const ALL_FOCUS = [
  { value: "full", label: "Full body" },
  { value: "upper", label: "Upper body" },
  { value: "lower", label: "Lower body" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" }
];

/** @type {Array<Record<string, any>>} */
export const PAGES = [
  // ------------------------------------------------------------------ generator
  {
    slug: "workout-generator",
    path: "/rankbound/workout-generator/",
    campaign: "generator",
    tool: "generator",
    navLabel: "Workout generator",
    teaser: "Pick your level, time and equipment and get a ready-to-do workout plus a weekly schedule.",
    title: "Free Workout Generator: Build a Daily Quest | Rankbound",
    description:
      "Free workout generator for bodyweight training. Pick your level, time, equipment and focus to get a daily workout and a weekly plan. No sign-up.",
    h1: "Free Workout Generator",
    eyebrow: "Free tool",
    lead:
      "Choose your level, time and equipment and get a workout you can start right now, plus a weekly schedule with rest days built in. No sign-up, nothing to download.",
    defaults: { level: "beginner", minutes: 20, focus: "full", days: 3, equipment: [], lowImpact: false, seed: 1 },
    minutesOptions: [10, 15, 20, 30],
    focusOptions: ALL_FOCUS,
    showEquipment: true,
    ctaLine:
      "Rankbound is a free iPhone app that turns training into an RPG. It does not import this workout, so pick the same exercises when you build your own daily quest from its 45-exercise library.",
    sections: [
      {
        h2: "How the generator builds your workout",
        body: [
          "There is no AI and no server behind this tool. It is a set of rules applied to a curated list of 45 bodyweight and cardio exercises, so the same choices always give the same workout. That also means you can see exactly why you got what you got.",
          "First it removes anything your level or equipment does not allow. Then it fills the session with a balance of pushing, pulling or hinging, leg work, core and a little cardio, depending on the focus you pick. Targets start from sensible defaults and are scaled down for beginners and up for advanced lifters, and the number of sets is adjusted until the session lands close to the time you asked for.",
          "Every exercise lists an easier and a harder option when one is available, so you can adjust on the spot instead of skipping the move."
        ]
      },
      {
        h2: "Built-in limits",
        body: [
          "Beginner workouts are capped at 18 working sets, never include more than two jumping exercises, and use 60 seconds of rest. Beginner weeks are capped at four training days. Switch on low impact to remove every jumping move.",
          "A short session can still be hard. If any exercise hurts, stop and skip it. This tool cannot see you, your history or your injuries, so treat the result as a starting point, not a prescription."
        ]
      },
      {
        h2: "Using your workout",
        body: [
          "Warm up first, do the exercises in order, and rest as listed. When a target feels easy for every set, try the harder version or add a rep or two next time. The U.S. Physical Activity Guidelines recommend muscle-strengthening activity on at least 2 days a week for adults, and the weekly plan is built around that."
        ]
      }
    ],
    samplesHeading: "Example workouts",
    samplesIntro: "Here are three results from the generator, one per level, so you can see what to expect before you change anything.",
    samples: [
      { label: "Beginner, 15 minutes, full body", options: { level: "beginner", minutes: 15, focus: "full", seed: 11 } },
      { label: "Intermediate, 20 minutes, upper body", options: { level: "intermediate", minutes: 20, focus: "upper", seed: 12 } },
      { label: "Advanced, 20 minutes, lower body", options: { level: "advanced", minutes: 20, focus: "lower", seed: 13 } }
    ],
    faqs: [
      {
        question: "Is the workout generator really free?",
        answer: "Yes. There is no sign-up, no paywall and no limit on how many workouts you generate."
      },
      {
        question: "Do I need any equipment?",
        answer:
          "No. With nothing selected, every exercise is bodyweight only. You can optionally tick a pull-up bar or sturdy low bar, a bench, chair or step, or a jump rope to unlock more exercises."
      },
      {
        question: "How long should I rest between sets?",
        answer:
          "Each workout lists its rest time. Beginners get 60 seconds, intermediate workouts 50 seconds and advanced workouts 45 seconds. Rest a little longer if your form starts to slip."
      },
      {
        question: "How often should I train?",
        answer:
          "The U.S. Physical Activity Guidelines recommend muscle-strengthening activity on at least 2 days a week for adults. The weekly plan lets you pick 2 to 6 days and always leaves rest days, with beginners capped at 4."
      },
      {
        question: "Is this medical or professional training advice?",
        answer:
          "No. It is a general, rule-based tool. Talk to a doctor before starting a new exercise program, especially if you have a health condition or injury, and stop if anything causes pain."
      }
    ],
    sources: ["hhs", "acsm", "ace"],
    related: ["no-equipment-workout", "15-minute-workout", "30-day-calisthenics-challenge"]
  },

  // ------------------------------------------------------------------ push-up calculator
  {
    slug: "push-up-calculator",
    path: "/rankbound/push-up-calculator/",
    campaign: "pushups",
    tool: "pushups",
    navLabel: "Push-up calculator",
    teaser: "Enter your best set and get a conservative 4-week push-up plan with the right variation.",
    title: "Push-Up Calculator: How Many a Day? | Rankbound",
    description:
      "Enter your max push-ups and get a safe 4-week plan: starting sets, weekly progressions, rest days and the right variation. Free, no sign-up.",
    h1: "Push-Up Calculator: How Many Should You Do?",
    eyebrow: "Free tool",
    lead:
      "Tell us the most strict push-ups you can do in one set. You get a starting set, a four-week progression and the variation that fits you, with rest days included.",
    defaults: { max: 8, days: 3 },
    ctaLine:
      "Rankbound is a free iPhone app that turns training into an RPG. It does not import this plan, but push-ups, knee push-ups and incline push-ups are all in its exercise library, so you can build a similar quest and earn XP when you clear it.",
    sections: [
      {
        h2: "How many push-ups should you do a day?",
        body: [
          "There is no single right number. It depends on how many strict push-ups you can do in one set today. A useful rule of thumb is to train well below that number for several sets, rest between sessions, and add a little at a time.",
          "This calculator plans three or four sessions a week with a rest day between most of them. If you enjoy doing a small number every day, that can be fine as long as you feel recovered, but there is no evidence-based reason to chase a daily total, and nothing here is a promise about results."
        ]
      },
      {
        h2: "How the plan is calculated",
        body: [
          "Your working sets start at about 60 percent of your best set, in four sets with 90 seconds of rest, so every set should feel controlled and you should stop 2 or more reps before your form breaks. Each week adds roughly 10 percent, and at least one rep, up to a cap of about 85 percent of your best set so that sets never become max-effort. Once you reach the cap, retest rather than pushing harder.",
          "If you cannot do a strict push-up yet, or can do only a few, the plan switches to an easier version: incline push-ups with your hands on a counter or stairs, then knee push-ups. Once you can do a clean set of 10 to 15, move up a step. Small, gradual increases in load are the core of standard progression guidance."
        ]
      },
      {
        h2: "What about 100 push-ups a day?",
        body: [
          "The popular challenge is a total spread across many sets, not one set of 100. It is a large amount of volume for most people, and it is a poor starting point. If you want to work toward high totals, build up through the plan above, retest your best set, and increase gradually with rest days. If your shoulders, elbows or wrists hurt, rest and do not push through it."
        ]
      },
      {
        h2: "Push-up form checklist",
        body: [
          "Hands slightly wider than your shoulders, wrists under your hands. Body in one line from head to heels, with your core braced so your hips do not sag or pike. Lower until your chest is close to the floor with elbows at roughly 45 degrees from your sides, then press back up. Count only reps with that full range of motion."
        ]
      }
    ],
    samplesHeading: "Example starting points",
    samplesIntro: "Typical results for different starting levels. Your own numbers update when you use the calculator above.",
    sampleMaxes: [0, 3, 8, 15, 30],
    faqs: [
      {
        question: "How many push-ups should a beginner do?",
        answer:
          "It depends on how many strict push-ups you can do in one set. Beginners who can do only a few usually start with incline or knee push-ups, around 4 sets of about 6 reps, 3 days a week, and increase slowly."
      },
      {
        question: "Is it OK to do push-ups every day?",
        answer:
          "Some people do a small, easy number daily. The U.S. Physical Activity Guidelines recommend muscle-strengthening activity on at least 2 days a week, and this plan uses 3 or 4 sessions with rest days so you can recover. Rest more if you are sore or something hurts."
      },
      {
        question: "How do I find my max push-ups?",
        answer:
          "Do one set of strict push-ups with full range of motion and stop when your form slips, not when you collapse. If you are unsure, enter a slightly lower number. You can retest every four weeks."
      },
      {
        question: "How long does it take to do 100 push-ups?",
        answer:
          "That varies a lot between people and no calculator can promise a date. Follow a gradual plan, retest your best set, and let your results set the pace."
      }
    ],
    sources: ["hhs", "acsm", "nhs", "ace"],
    related: ["workout-generator", "30-day-calisthenics-challenge", "one-punch-man-workout"]
  },

  // ------------------------------------------------------------------ 30-day challenge
  {
    slug: "30-day-calisthenics-challenge",
    path: "/rankbound/workouts/30-day-calisthenics-challenge/",
    campaign: "challenge30",
    tool: "challenge",
    navLabel: "30-day calisthenics challenge",
    teaser: "A 30-day bodyweight challenge with rest days built in, scaled to your level and schedule.",
    title: "30-Day Calisthenics Challenge for Beginners | Rankbound",
    description:
      "A free 30-day bodyweight challenge with rest days built in. Pick your level and schedule to get every day's workout, then track it as daily quests.",
    h1: "30-Day Calisthenics Challenge",
    eyebrow: "Free challenge",
    lead:
      "Pick your level, how many days you can train and how long each session should be. You get all 30 days laid out, with rest days included and targets that rise gently each week.",
    defaults: { level: "beginner", minutes: 15, days: 3, equipment: [], lowImpact: false, seed: 1 },
    minutesOptions: [10, 15, 20],
    daysOptions: [3, 4, 5],
    showEquipment: true,
    ctaLine:
      "Rankbound is a free iPhone app that turns a challenge like this into a game. It does not import this plan, but you can build a similar daily quest, schedule your training days and earn +100 XP for each day you clear it. Rest days on your schedule never break your streak.",
    sections: [
      {
        h2: "How the 30 days work",
        body: [
          "Training days follow a weekly pattern with rest days between sessions, so a 3-day plan trains days 1, 3 and 5 of each week and a 5-day plan fits the rest around them. Upper and lower body days alternate on 4 to 5 day plans, so the same muscles are not worked on back-to-back days.",
          "Targets rise by about 5 percent each week. Week 5, which is just days 29 and 30, is the highest. If a day is too hard, use the easier version listed under the exercise, shorten the session, or take an extra rest day and carry on."
        ]
      },
      {
        h2: "What the challenge will not do",
        body: [
          "Thirty days is a good length for building a habit, and it is a short time for changing your body. This page does not promise any fitness or appearance outcome. The goal is simpler: show up on the days you planned and finish each session with good form."
        ]
      },
      {
        h2: "Tracking it as daily quests",
        body: [
          "In Rankbound a daily quest is one workout you build from the exercise library and schedule on your training days. Clearing it earns 100 XP once per day, and the XP total above shows what a perfect month would be worth. Your plan on this page is separate: copy the exercises you like and build the quest in the app."
        ]
      }
    ],
    faqs: [
      {
        question: "Is a 30-day calisthenics challenge good for beginners?",
        answer:
          "It can be, when it is scaled. Beginner plans on this page use lighter targets, 60 seconds of rest and at most 4 training days a week, with an easier version of each exercise listed."
      },
      {
        question: "Do I have to train every day for 30 days?",
        answer:
          "No. The plan includes rest days, and they are part of the plan. Most people train 3 to 5 days a week."
      },
      {
        question: "What if I miss a day?",
        answer:
          "Do the next workout on your list and keep going. The calendar is a guide, not a test, and there is no benefit to doubling up."
      },
      {
        question: "Do I need a pull-up bar?",
        answer:
          "No. With no equipment selected, every workout is bodyweight only. If you have a bar, a bench, or a jump rope, tick it to add pulling and step exercises."
      }
    ],
    sources: ["hhs", "acsm", "ace"],
    related: ["workout-generator", "push-up-calculator", "no-equipment-workout"]
  },

  // ------------------------------------------------------------------ no equipment
  {
    slug: "no-equipment-workout",
    path: "/rankbound/workouts/no-equipment-workout/",
    campaign: "noequip",
    tool: "generator",
    navLabel: "No-equipment workout",
    teaser: "A bodyweight-only workout for your level, with easier and harder versions of every move.",
    title: "No-Equipment Workout: Free Bodyweight Routines | Rankbound",
    description:
      "Build a no-equipment workout for your level in one tap. Bodyweight exercises only, with easier and harder versions of every move. Free, no sign-up.",
    h1: "No-Equipment Workout Generator",
    eyebrow: "Free tool",
    lead:
      "A workout you can do in a living room: bodyweight exercises only, matched to your level and time, with an easier and a harder version of each move.",
    defaults: { level: "beginner", minutes: 20, focus: "full", days: 3, equipment: [], lowImpact: false, seed: 21 },
    minutesOptions: [10, 15, 20, 30],
    focusOptions: ALL_FOCUS,
    showEquipment: false,
    ctaLine:
      "Rankbound is a free iPhone app made for bodyweight training, with no equipment tracking to get in the way. It does not import this workout, but every move here is in its library, so you can build a similar daily quest.",
    sections: [
      {
        h2: "What counts as no equipment",
        body: [
          "Everything on this page uses your body, the floor and, for a few easier versions, a wall, a sturdy counter or a staircase. There is nothing to buy and nothing to set up, so the whole workout fits in a small space.",
          "The exercise pool covers pushing (push-up variations), legs (squats, lunges, bridges, calf raises), core (planks, dead bugs, crunches) and cardio (jumping jacks, high knees, skaters). Pulling is the one thing bodyweight training does poorly without a bar, which is why full body sessions here lean on legs, core and pushing."
        ]
      },
      {
        h2: "Small space or sharing a wall?",
        body: [
          "Switch on low impact. Every jumping move is removed, and the session fills in with squats, lunges, bridges and core holds, which are quieter and gentler on your joints. Wall sits and planks are silent and need only a square meter of floor."
        ]
      },
      {
        h2: "Making it a routine",
        body: [
          "Use the weekly plan to rotate focuses, with an upper-body day, a lower-body day and a full-body day. Two or three sessions a week with rest in between is enough to start, in line with the muscle-strengthening guidance for adults. When a workout gets easy, use the harder variation first, then add reps."
        ]
      }
    ],
    samplesHeading: "Example no-equipment workouts",
    samplesIntro: "Three sample results with nothing but a floor, one per level.",
    samples: [
      { label: "Beginner, 15 minutes", options: { level: "beginner", minutes: 15, focus: "full", seed: 31 } },
      { label: "Intermediate, 20 minutes", options: { level: "intermediate", minutes: 20, focus: "full", seed: 32 } },
      { label: "Advanced, 30 minutes", options: { level: "advanced", minutes: 30, focus: "full", seed: 33 } }
    ],
    faqs: [
      {
        question: "Can I get a full-body workout with no equipment?",
        answer:
          "Yes. Bodyweight exercises can work your legs, core and upper body. The generator picks a balance of pushing, leg work, core and cardio for you."
      },
      {
        question: "What if I cannot do a push-up?",
        answer:
          "Use the easier version listed under each exercise: incline push-ups with your hands on a counter, then knee push-ups. Beginner workouts start with these options."
      },
      {
        question: "Is there a quiet version for apartments?",
        answer:
          "Yes. Tick low impact to remove all jumping exercises."
      },
      {
        question: "How many days a week should I do it?",
        answer:
          "Two to four days a week is a good start. The U.S. Physical Activity Guidelines recommend muscle-strengthening activity on at least 2 days a week for adults."
      }
    ],
    sources: ["hhs", "nhs", "ace"],
    related: ["workout-generator", "15-minute-workout", "anime-workout"]
  },

  // ------------------------------------------------------------------ 15 minute
  {
    slug: "15-minute-workout",
    path: "/rankbound/workouts/15-minute-workout/",
    campaign: "min15",
    tool: "generator",
    navLabel: "15-minute workout",
    teaser: "A quick bodyweight routine with the sets, rest and timing worked out. Switch to 10 or 20 minutes.",
    title: "15-Minute Workout: Free Quick Routine Generator | Rankbound",
    description:
      "Get a 15-minute bodyweight workout matched to your level, with sets, reps, rest and timing worked out. Switch to 10 or 20 minutes. Free.",
    h1: "15-Minute Workout Generator",
    eyebrow: "Free tool",
    lead:
      "A short workout with the math done for you: exercises, sets, reps and rest that add up to about 15 minutes, including a short warm-up and cool-down. Need less or more? Switch to 10 or 20.",
    defaults: { level: "beginner", minutes: 15, focus: "full", days: 3, equipment: [], lowImpact: false, seed: 41 },
    minutesOptions: [10, 15, 20],
    focusOptions: ALL_FOCUS,
    showEquipment: true,
    ctaLine:
      "Rankbound is a free iPhone app that turns short, repeatable workouts into daily quests. It does not import this one, but a quest of 3 to 5 exercises is a good fit, and clearing it earns +100 XP.",
    sections: [
      {
        h2: "How 15 minutes adds up",
        body: [
          "The estimate counts every second: the time you spend working each set, the rest between sets, and about 4 minutes of warm-up and cool-down. That leaves around 11 minutes for the sets themselves, which is room for about 8 to 10 sets in total, for example four exercises of two sets each, and a little more for intermediate and advanced workouts.",
          "Beginners get longer rests and fewer sets, so the session still lands near 15 minutes. At 10 minutes, intermediate and advanced workouts shorten rests to 30 seconds so the session stays realistic."
        ]
      },
      {
        h2: "Is 15 minutes enough?",
        body: [
          "The U.S. Physical Activity Guidelines state that some physical activity is better than none, and that activity does not need to be done in long bouts to count. A consistent short workout is easier to keep up than an ambitious one you skip, and the guidelines also recommend muscle-strengthening activity at least 2 days a week."
        ]
      },
      {
        h2: "Getting more from a short session",
        body: [
          "Pick a focus instead of a little of everything: an upper-body day and a lower-body day on alternating days gives each part of your body its own session. Do the exercises in the order listed, keep rests honest, and use the harder version when every set feels easy."
        ]
      }
    ],
    samplesHeading: "Example 10, 15 and 20-minute workouts",
    samplesIntro: "One sample per length so you can see how the same level changes with time.",
    samples: [
      { label: "Beginner, 10 minutes", options: { level: "beginner", minutes: 10, focus: "full", seed: 51 } },
      { label: "Beginner, 15 minutes", options: { level: "beginner", minutes: 15, focus: "full", seed: 52 } },
      { label: "Intermediate, 20 minutes", options: { level: "intermediate", minutes: 20, focus: "full", seed: 53 } }
    ],
    faqs: [
      {
        question: "Can a 15-minute workout be effective?",
        answer:
          "Some activity is better than none, and the U.S. Physical Activity Guidelines say it does not have to come in long sessions. How much you get out of it depends on how consistently you do it."
      },
      {
        question: "What is in the 15 minutes?",
        answer:
          "About 11 minutes of sets and rests plus roughly 4 minutes for a warm-up and cool-down. The estimate on each workout shows the total."
      },
      {
        question: "Can I do it every day?",
        answer:
          "You can train most days with short sessions, but plan rest days and vary the focus so you are not working the same muscles back to back. Rest more if you feel sore or run down."
      },
      {
        question: "Do I need equipment?",
        answer:
          "No. It is bodyweight only unless you tick a bar, bench or jump rope."
      }
    ],
    sources: ["hhs", "acsm"],
    related: ["workout-generator", "no-equipment-workout", "30-day-calisthenics-challenge"]
  },

  // ------------------------------------------------------------------ anime
  {
    slug: "anime-workout",
    path: "/rankbound/workouts/anime-workout/",
    campaign: "anime",
    tool: "generator",
    navLabel: "Anime workout generator",
    teaser: "Four original training styles for RPG fans, each with its own bodyweight workout.",
    title: "Anime Workout Generator: RPG Training Styles | Rankbound",
    description:
      "Pick a training style (Vanguard, Shadow, Ranger or Monk) and get a real anime-inspired bodyweight workout. Original styles, free, no sign-up.",
    h1: "Anime Workout Generator",
    eyebrow: "Free tool",
    lead:
      "Training arcs are better with a plan. Choose an original RPG-style class, set your level and time, and get a real bodyweight workout to go with it.",
    defaults: { level: "beginner", minutes: 20, focus: "upper", days: 4, equipment: [], lowImpact: false, seed: 61 },
    minutesOptions: [10, 15, 20, 30],
    focusOptions: [
      { value: "upper", label: "Vanguard (upper body)" },
      { value: "lower", label: "Shadow (lower body)" },
      { value: "core", label: "Monk (core)" },
      { value: "cardio", label: "Ranger (cardio)" },
      { value: "full", label: "Hero (full body)" }
    ],
    focusLabel: "Training style",
    showEquipment: true,
    ctaLine:
      "Rankbound is a free workout RPG for iPhone: your real workouts are the quest, and XP, levels and ranks from F to S track your progress. It does not import this workout, so build a similar daily quest in the app.",
    sections: [
      {
        h2: "Four original training styles",
        body: [
          "These styles are not based on any series or character. They are four ways to give a session a clear identity, and each one maps to a real training focus.",
          "Vanguard is the front-line style: push-ups, pulling when you have a bar, and a core finisher. Shadow is the lower-body style, built on squats, lunges and bridges. Monk is slow and controlled: planks, holds and anti-rotation core work. Ranger is built around cardio: jumping, running in place and quick footwork, with leg work in between. Hero blends all four."
        ]
      },
      {
        h2: "Why the montage is not enough",
        body: [
          "A training montage compresses months into a minute. Real progress is repeated, modest sessions with rest in between and a gradual increase in difficulty. Every workout from the generator uses level-appropriate targets, listed rest times and easier and harder options, so you can progress the way a game does: a little at a time."
        ]
      },
      {
        h2: "Turn it into a game for real",
        body: [
          "If the appeal is levelling up, put it on a scoreboard. Pick your training days, clear one workout a day on those days, and watch a streak and a rank build. That is exactly the loop Rankbound is built around, with no avatar to manage because you are the character."
        ]
      }
    ],
    samplesHeading: "One quest for every style",
    samplesIntro: "Sample beginner quests, 20 minutes each, for the four training styles.",
    samples: [
      { label: "Vanguard (upper body)", options: { level: "beginner", minutes: 20, focus: "upper", seed: 71 } },
      { label: "Shadow (lower body)", options: { level: "beginner", minutes: 20, focus: "lower", seed: 72 } },
      { label: "Monk (core)", options: { level: "beginner", minutes: 20, focus: "core", seed: 73 } },
      { label: "Ranger (cardio)", options: { level: "beginner", minutes: 20, focus: "cardio", seed: 74 } }
    ],
    faqs: [
      {
        question: "Is this based on a specific anime?",
        answer:
          "No. The training styles are original and are not affiliated with or based on any series."
      },
      {
        question: "Can beginners do an anime-inspired workout?",
        answer:
          "Yes. Start on the beginner level, which uses lighter targets and longer rests, and use the easier version of any exercise that feels too hard."
      },
      {
        question: "Do I need equipment?",
        answer:
          "No. Everything is bodyweight only unless you tick a bar, bench or jump rope."
      },
      {
        question: "How many days a week should I train?",
        answer:
          "Three or four days a week with rest days in between is a sensible start. The U.S. Physical Activity Guidelines recommend muscle-strengthening activity on at least 2 days a week for adults."
      }
    ],
    sources: ["hhs", "ace"],
    related: ["workout-generator", "one-punch-man-workout", "no-equipment-workout"]
  },

  // ------------------------------------------------------------------ OPM
  {
    slug: "one-punch-man-workout",
    path: "/rankbound/guides/one-punch-man-workout/",
    campaign: "opm",
    tool: "opm",
    navLabel: "One Punch Man workout, scaled",
    // Other pages and the landing page link with a neutral label: franchise names stay on this editorial page.
    cardLabel: "The 100-rep daily routine, scaled",
    teaser: "The famous 100/100/100 plus 10 km routine, scaled so you can start where you are.",
    title: "One Punch Man Workout, Scaled to Your Level | Rankbound",
    description:
      "The famous 100 push-ups, sit-ups, squats and 10 km routine, scaled so you can start today. Enter what you can do now and get a week-by-week ramp.",
    h1: "One Punch Man Workout, Scaled to Your Level",
    eyebrow: "Guide and free tool",
    lead:
      "The routine made famous by Saitama is 100 push-ups, 100 sit-ups, 100 squats and a 10 km run. Almost nobody can start there. Enter what you can do today and get a week-by-week ramp to the full routine.",
    notice:
      "One-Punch Man and Saitama are the property of their respective owners. This is an independent guide. It is not affiliated with, sponsored by or endorsed by the creators or publishers of the series, and Rankbound is not associated with them.",
    defaults: { pushups: 10, situps: 15, squats: 20, minutes: 15, days: 3 },
    ctaLine:
      "Rankbound is a free iPhone app that turns your own training into an RPG. It does not import this ramp, but push-ups, sit-ups, squats and running are all in its library, so you can build a similar quest and earn +100 XP when you clear it.",
    sections: [
      {
        h2: "What the One Punch Man workout is",
        body: [
          "In the series, the hero credits a daily routine of 100 push-ups, 100 sit-ups, 100 squats and a 10 km run for his strength. The routine is part of a fictional story. This page treats it as a challenge worth scaling, not as a proven method.",
          "Nothing here claims that doing the routine will give you any particular result. It describes how to build up to the volume safely, if you want to."
        ]
      },
      {
        h2: "Why you should not start at 100 a day",
        body: [
          "Jumping straight to 300 reps and a 10 km run every day is a very large load for someone who is not already trained, and doing it daily leaves no recovery time. Overuse problems are far more likely when training load rises too fast. Progression guidance for strength work is about small, steady increases, and the U.S. Physical Activity Guidelines advise increasing activity gradually.",
          "If you have a health condition, an injury, or you are unsure, talk to a doctor before starting something this demanding."
        ]
      },
      {
        h2: "How the scaler works",
        body: [
          "For each exercise it starts you at three sets of about 60 percent of your best single set, then raises the session total about 10 percent a week, at least 3 reps, until you reach 100. Walking or jogging starts at the time you can do comfortably and rises about 10 percent a week up to 70 minutes, roughly 10 km at a steady 7 min/km pace. Your pace will differ, so adjust the time to your own speed.",
          "It plans 3 or 4 days a week, not every day. That is a deliberate change to the fictional routine. Keep the days between sessions easy or off."
        ]
      },
      {
        h2: "Form notes for each part",
        body: [
          "Push-ups: body in a straight line, chest near the floor. Sit-ups: rise with your core and keep your hands off your neck; use crunches if your lower back complains. Squats: feet shoulder width, sit back and down with your knees tracking over your toes. Running: an easy pace where you can speak in short sentences, and walk breaks are fine."
        ]
      }
    ],
    faqs: [
      {
        question: "What is the One Punch Man workout?",
        answer:
          "It is the routine from the series: 100 push-ups, 100 sit-ups, 100 squats and a 10 km run. The story is fiction, and the routine is far above what most beginners can do right away."
      },
      {
        question: "Does the One Punch Man workout work?",
        answer:
          "No one can promise a result from any routine. This page does not claim that it does. It shows how to build up to the volume gradually and leaves the results up to you."
      },
      {
        question: "Can a beginner do the One Punch Man workout?",
        answer:
          "Not as written. This scaler lets you start from your current ability and build up with rest days between sessions."
      },
      {
        question: "Is it safe to do the full routine every day?",
        answer:
          "It is a high training load with no built-in recovery. The scaler plans 3 or 4 days a week. Check with a doctor first if you have any health concerns, and stop if anything hurts."
      }
    ],
    sources: ["hhs", "acsm", "nhs"],
    related: ["push-up-calculator", "anime-workout", "30-day-calisthenics-challenge"]
  }
];

export const PAGES_BY_SLUG = new Map(PAGES.map((page) => [page.slug, page]));
