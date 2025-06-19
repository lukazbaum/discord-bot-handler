import {
  saveOrUpdateEternityProfile,
  getEternityProfile,
  getDungeonWins,
  getEternalUnsealHistory
} from '/home/ubuntu/ep_bot/extras/functions.js';

import type { EternalProfileData } from './eternalProfile';

// Loads the single global profile for this user.
export async function loadEternalProfile(userId: string): Promise<EternalProfileData | null> {
  const profile = await getEternityProfile(userId);
  if (!profile) return null;

  return {
    userId,
    guildId: profile.guild_id ?? null,
    username: profile.username ?? null,
    currentEternity: profile.current_eternality ?? 0,
    flamesOwned: profile.flames_owned ?? 0,
    lastUnsealTT: profile.last_unseal_tt ?? 0,
    ttsGainedDuringSeal: profile.tts_gained_during_seal ?? 0,
    daysSealed: profile.days_sealed ?? 0,
    targetEternity: profile.target_eternality ?? undefined,
    swordTier: profile.sword_tier ?? undefined,
    swordLevel: profile.sword_level ?? undefined,
    armorTier: profile.armor_tier ?? undefined,
    armorLevel: profile.armor_level ?? undefined,
    pathChoice: profile.path_choice ? JSON.parse(profile.path_choice) : undefined,
    unsealHistory: await getEternalUnsealHistory(userId) ?? [],
    dungeonWins: await getDungeonWins(userId) ?? []
  };
}

// Updates only by userId
export async function updateEternity(userId: string, newEternity: number): Promise<string> {
  return await saveOrUpdateEternityProfile(userId, newEternity);
}

// Ensures a single profile per userId
export async function ensureEternityProfile(userId: string, guildId?: string): Promise<void> {
  const profile = await getEternityProfile(userId);
  if (!profile) {
    console.log(`🆕 Creating new Eternity Profile for user ${userId}`);
    await saveOrUpdateEternityProfile(userId, 0, guildId);
  }
}