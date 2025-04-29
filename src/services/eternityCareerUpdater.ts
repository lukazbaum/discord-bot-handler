import {
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternityProfile,
  upsertEternityCareer
} from '/home/ubuntu/ep_bot/extras/functions'; // Adjust if needed

/**
 * Updates a player's Eternity Career profile.
 */
export async function updateCareer(userId: string, guildId: string): Promise<void> {
  try {
    // 📦 Pull all player data in parallel
    const [unseals, dungeons, profile] = await Promise.all([
      getEternalUnsealHistory(userId),
      getEternalDungeonWins(userId, guildId),
      getEternityProfile(userId, guildId)
    ]);

    if (!profile) {
      console.warn(`⚠️ No Eternity Profile found for userId=${userId}`);
      return;
    }

    // 📈 Calculate career totals
    const highestEternity = profile.current_eternality || 0;
    const totalUnseals = Array.isArray(unseals) ? unseals.length : 0;
    const totalFlamesBurned =
      (unseals?.reduce((sum, u) => sum + (u.flamesCost || 0), 0) || 0) +
      (dungeons?.reduce((sum, d) => sum + (d.flamesEarned || 0), 0) || 0);
    const totalBonusTT = unseals?.reduce((sum, u) => sum + (u.bonusTT || 0), 0) || 0;
    const firstUnsealDate = unseals?.length ? unseals[unseals.length - 1].createdAt : null;

    // 🏆 Dynamic achievement badges
    const achievements: string[] = [];
    if (totalUnseals >= 10) achievements.push("🔹 10+ Unseals");
    if (highestEternity >= 500) achievements.push("🔹 500+ Eternity Achiever");
    if (totalFlamesBurned >= 500_000) achievements.push("🔹 500k+ Flames Burned");
    if (totalFlamesBurned >= 1_000_000) achievements.push("🔹 1 Million+ Flames Burned");

    // 📤 Save updated career
    const careerData = {
      highestEternity,
      totalFlamesBurned,
      totalBonusTT,
      totalUnseals,
      firstUnsealDate,
      achievements
    };

    await upsertEternityCareer(userId, guildId, careerData);
    console.log(`🏆 Eternity Career successfully updated for userId=${userId}`);

  } catch (err) {
    console.error('❌ Error while updating Eternity Career:', err);
  }
}