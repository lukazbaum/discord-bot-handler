// src/services/eternalPlannerHelper.ts
import { calculateFullInfo } from './eUtils'; // 

export function calculatePlanner(
  currentEternity: number,
  targetEternity: number,
  ttGoal: number,
  farmingEfficiency: number = 500, // flames per dungeon, default good value
  daysSealed: number = 7
) {
  const unsealCost = 25 * Math.max(targetEternity, 200) + 25;
  const flameDeficit = unsealCost;
  const dungeonsNeeded = Math.ceil(flameDeficit / farmingEfficiency);
  const estTimeCookies = dungeonsNeeded * 50; // Example: 50 TC per dungeon

  const ttGained = Math.max(1, ttGoal); // Safe guard
  const bonusTT = Math.floor(targetEternity * (ttGained + (daysSealed / 15)) * 3 / 2500);

  const powerStats = calculateFullInfo(
    { eternalProgress: currentEternity, lastUnsealTT: 0 }, // Mock profile
    { level: 0, timeTravels: 0 }, // unused in power
    { eternityFlames: 0 }, // unused
    targetEternity,
    50, // tc per dungeon
    ttGoal,
    daysSealed
  );

  return {
    currentEternity,
    targetEternity,
    ttGoal,
    unsealCost,
    flameDeficit,
    dungeonsNeeded,
    estTimeCookies,
    bonusTT,
    powerStats
  };
}