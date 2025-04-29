import {
  getEternityProfile,
  saveOrUpdateEternityProfile,
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternalPathChoice,
} from '/home/ubuntu/ep_bot/extras/functions'; // <-- adjust the path to where you export your DB functions

export interface EternalProfileData {
  userId: string;
  guildId: string;
  currentEternity: number;
  flamesOwned?: number;
  lastUnsealTT?: number;
  unsealHistory?: any[];
  dungeonWins?: any[];
  pathChoice?: {
    chosenPath: string;
    ttGoal: number;
    targetEternity: number;
    displayTitle?: string;
  } | null;
}

/**
 * Loads a full Eternal Profile from the database
 */
export async function loadEternalProfile(userId: string, guildId: string): Promise<EternalProfileData | null> {
  const profile = await getEternityProfile(userId, guildId);
  if (!profile) return null;

  const unsealHistory = await getEternalUnsealHistory(userId);
  const dungeonWins = await getEternalDungeonWins(userId, guildId);
  const pathChoice = await getEternalPathChoice(userId, guildId);

  return {
    userId,
    guildId,
    currentEternity: profile.current_eternality || 0,
    flamesOwned: profile.flames_owned || 0, // if you track flames separately later
    lastUnsealTT: profile.last_unseal_tt || 0,
    unsealHistory,
    dungeonWins,
    pathChoice: pathChoice ? {
      chosenPath: pathChoice.chosen_path,
      ttGoal: pathChoice.tt_goal,
      targetEternity: pathChoice.target_eternity,
      displayTitle: pathChoice.display_title || undefined
    } : null
  };
}


export async function updateEternity(userId: string, guildId: string, newEternity: number): Promise<string> {
  return await saveOrUpdateEternityProfile(userId, guildId, newEternity);
}
export async function ensureEternityProfile(userId: string, guildId: string): Promise<void> {
  const profile = await getEternityProfile(userId, guildId);

  if (!profile) {
    console.log(`🆕 Creating new Eternity Profile for user ${userId}`);
    await saveOrUpdateEternityProfile(userId, guildId, 0, 0); // 0 eternality, 0 flames
  }
}