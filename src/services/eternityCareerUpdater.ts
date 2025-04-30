import { getEternalUnsealHistory, getEternalDungeonWins, saveOrUpdateEternityProfile } from '/home/ubuntu/ep_bot/extras/functions';

/**
 * 🏆 Aggregates Eternity career stats from history tables and updates the profile
 */
export async function updateCareer(userId: string, guildId: string): Promise<void> {
  try {
    const unsealHistory = await getEternalUnsealHistory(userId);
    const dungeonWins = await getEternalDungeonWins(userId);

    const totalUnseals = unsealHistory.length;
    const totalBonusTT = unsealHistory.reduce((sum, u) => sum + (u.bonusTT || 0), 0);

    const totalDungeonWins = dungeonWins.length;
    const totalFlamesEarned = dungeonWins.reduce((sum, win) => sum + (win.flamesEarned || 0), 0);

    // Last unseal TT
    const lastUnsealTT = unsealHistory[0]?.bonusTT ?? 0;

    // 🧠 Save into eternity_profiles
    await saveOrUpdateEternityProfile(
      userId,
      guildId,
      null,             // currentEternity not updated here
      null,             // flamesOwned not updated here
      totalDungeonWins,
      totalFlamesEarned,
      null,             // don't override last_unseal_tt here
      null,             // username
      null, null,       // sword
      null, null,       // armor
      null,             // ttGainedDuringSeal
      null              // daysSealed
    );

    console.log(`✅ Eternity Profile updated for user ${userId}`);
  } catch (err) {
    console.error("❌ Failed to update Eternity Career:", err);
  }
}