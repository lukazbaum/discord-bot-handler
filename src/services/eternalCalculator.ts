/**
 * Calculate the cost in flames to unseal the Eternity at the given Eternality level.
 * Formula: 25 + (25 × eternalProgress)
 */
export function calculateUnsealCost(eternalProgress: number): number {
  return 25 + (25 * Math.max(eternalProgress, 0));
}

/**
 * Estimate bonus Time Travels earned when unsealing.
 * Formula: (Eternality × (TTs Gained During Sealed + (Days Sealed / 15)) × 3) / 2500
 */
export function estimateBonusTT(
  eternalProgress: number,
  ttsGainedDuringSeal: number,
  daysSealed: number
): number {
  const effectiveTT = ttsGainedDuringSeal + (daysSealed / 15);
  const bonusTT = (eternalProgress * effectiveTT * 3) / 2500;
  return Math.floor(bonusTT);
}

/**
 * Estimate the range of flames earned per Eternal Dungeon win.
 * Formula: (0.5 × Eternality) + 5 ~ 10
 */
export function estimateDungeonFlameRewards(eternalProgress: number): { min: number; max: number } {
  const base = 0.5 * eternalProgress;
  return {
    min: Math.floor(base + 5),
    max: Math.floor(base + 10)
  };
}

/**
 * Estimate how many dungeon wins are needed to collect enough Eternity Flames.
 * Uses average flame gain per dungeon.
 */
export function estimateDungeonsNeeded(
  currentFlames: number,
  targetFlames: number,
  averageFlamesPerRun: number
): number {
  const flamesNeeded = Math.max(0, targetFlames - currentFlames);
  if (averageFlamesPerRun <= 0) return Infinity;
  return Math.ceil(flamesNeeded / averageFlamesPerRun);
}

/**
 * Calculate average flames earned per dungeon.
 */
export function averageFlamesPerDungeon(eternalProgress: number): number {
  const reward = estimateDungeonFlameRewards(eternalProgress);
  return (reward.min + reward.max) / 2;
}

/**
 * Estimate total Eternity Flames needed to push from starting Eternity to target Eternity.
 * Uses the "average flames" formula across the span.
 */
export function estimateTotalFlamesToTarget(
  startEternity: number,
  targetEternity: number
): number {
  if (startEternity >= targetEternity) return 0;

  const eternalityCount = targetEternity - startEternity + 1;
  const avgEternality = (startEternity + targetEternity) / 2;

  const avgFlamesPerRun = (0.5 * avgEternality + 7.5) * 2;
  return Math.floor(eternalityCount * avgFlamesPerRun);
}