import * as functions from '/home/ubuntu/ep_bot/extras/functions'; // Correct way for CommonJS

export interface EternalProfileData {
  userId: string;
  guildId: string;
  username?: string;

  currentEternity: number;
  flamesOwned?: number;
  lastUnsealTT?: number;
  ttsGainedDuringSeal?: number;
  daysSealed?: number;

  swordTier?: number;
  swordLevel?: number;
  armorTier?: number;
  armorLevel?: number;

  targetEternity?: number;

  pathChoice?: {
    chosenPath?: string;
    ttGoal?: number;
    targetEternity?: number;
  };

  unsealHistory?: {
    flamesCost: number;
    bonusTT: number;
    unsealDate: string | Date;
    eternalityAtUnseal?: number;
  }[];

  dungeonWins?: {
    flamesEarned: number;
    winDate: string | Date;
  }[];
}

export async function loadEternalProfile(userId: string, guildId: string): Promise<EternalProfileData | null> {
  const profile = await functions.getEternityProfile(userId, guildId);
  if (!profile) return null;

  const unsealHistory = await functions.getEternalUnsealHistory(userId) ?? [];
  const dungeonWins = await functions.getDungeonWins(userId, guildId) ?? [];

  return {
    userId,
    guildId,
    username: profile.username ?? undefined,
    currentEternity: profile.current_eternality ?? 0,
    flamesOwned: profile.flames_owned ?? 0,
    lastUnsealTT: profile.last_unseal_tt ?? 0,
    ttsGainedDuringSeal: profile.tts_gained_during_seal ?? 0,
    daysSealed: profile.days_sealed ?? 0,
    swordTier: profile.sword_tier ?? 0,
    swordLevel: profile.sword_level ?? 0,
    armorTier: profile.armor_tier ?? 0,
    armorLevel: profile.armor_level ?? 0,
    targetEternity: profile.target_eternality ?? undefined,
    pathChoice: profile.path_choice ? JSON.parse(profile.path_choice) : undefined,
    unsealHistory: unsealHistory.map(u => ({
      flamesCost: u.flamesCost,
      bonusTT: u.bonusTT,
      unsealDate: u.unsealDate,
      eternalityAtUnseal: u.eternityLevel ?? undefined
    })),
    dungeonWins: dungeonWins.map(d => ({
      flamesEarned: d.flamesEarned,
      winDate: d.winDate ?? d.createdAt
    }))
  };
}



export async function ensureEternityProfile(userId: string, guildId: string): Promise<void> {
  await functions.saveOrUpdateEternityProfile(userId, guildId, 0, 0);
}

