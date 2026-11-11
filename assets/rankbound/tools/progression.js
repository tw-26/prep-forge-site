// @ts-check
// Mirrors Rankbound's XP, level and rank math (rankbound/src/constants/progression.ts and
// src/lib/progression.ts) so projections on the website match the app. Clearing a daily quest
// is worth +100 XP, once per local day.

export const QUEST_REWARD_XP = 100;

const EARLY_LEVEL_XP = [0, 100, 200, 300, 400, 600, 700, 900, 1100, 1400];

/** Ranks and the level at which each begins. */
export const RANKS = [
  { rank: "F", level: 1 },
  { rank: "E", level: 5 },
  { rank: "D", level: 10 },
  { rank: "C", level: 20 },
  { rank: "B", level: 35 },
  { rank: "A", level: 50 },
  { rank: "S", level: 75 }
];

/**
 * Total XP needed to reach `level` (level 1 is 0 XP).
 * @param {number} level
 */
export function xpToReachLevel(level) {
  if (level <= 1) return 0;
  if (level <= EARLY_LEVEL_XP.length) return EARLY_LEVEL_XP[level - 1];
  const n = level - 1;
  return Math.round((50 * n * Math.sqrt(n)) / 100) * 100;
}

/** @param {number} xp */
export function levelForXp(xp) {
  let level = 1;
  while (xpToReachLevel(level + 1) <= xp) level += 1;
  return level;
}

/** @param {number} level */
export function rankForLevel(level) {
  let current = RANKS[0].rank;
  for (const entry of RANKS) {
    if (level >= entry.level) current = entry.rank;
  }
  return current;
}

/**
 * What clearing `quests` daily quests would be worth in the app.
 * @param {number} quests
 */
export function projectQuests(quests) {
  const count = Math.max(0, Math.floor(quests));
  const xp = count * QUEST_REWARD_XP;
  const level = levelForXp(xp);
  return { quests: count, xp, level, rank: rankForLevel(level) };
}
