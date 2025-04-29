import * as functions from '/home/ubuntu/ep_bot/extras/functions'; // Correct way for CommonJS

export interface EternalProfileData {
  currentEternity: number;
  flamesOwned: number;
  lastUnsealTT: number;
  pathChoice?: {
    chosenPath: string;
    targetEternity: number;
  };
  unsealHistory?: any[];
  dungeonWins?: any[];
}

export async function loadEternalProfile(userId: string, guildId: string): Promise<EternalProfileData | null> {
  const profile = await functions.getEternityProfile(userId, guildId);
  if (!profile) return null;

  return {
    currentEternity: profile.current_eternality ?? 0,
    flamesOwned: profile.flames_owned ?? 0,
    lastUnsealTT: profile.last_unseal_tt ?? 0,
    pathChoice: profile.path_choice ? JSON.parse(profile.path_choice) : undefined,
    unsealHistory: [],
    dungeonWins: [],
  };
}

export async function ensureEternityProfile(userId: string, guildId: string): Promise<void> {
  await functions.saveOrUpdateEternityProfile(userId, guildId, 0, 0);
}

