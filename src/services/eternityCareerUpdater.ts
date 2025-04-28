import {
  upsertEternityCareer,
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternityProfile
} from "/home/ubuntu/ep_bot/extras/functions.js";

export async function updateCareer(userId: string, guildId: string) {
  try {
    const [unseals, dungeons, profile] = await Promise.all([
      getEternalUnsealHistory(userId),
      getEternalDungeonWins(userId, guildId),
      getEternityProfile(userId, guildId)
    ]);

    if (!profile) {
      console.log(`⚠️ No eternity profile found for ${userId}`);
      return;
    }

    const highestEternity = profile.current_eternality || 0;
    const totalFlamesBurned =
      unseals.reduce((sum, u) => sum + (u.flamesCost || 0), 0) +
      dungeons.reduce((sum, d) => sum + (d.flamesEarned || 0), 0);
    const totalBonusTT =
      unseals.reduce((sum, u) => sum + (u.bonusTT || 0), 0);
    const totalUnseals = unseals.length;
    const firstUnsealDate = unseals.length
      ? unseals[unseals.length - 1].createdAt
      : null;

    const achievements: string[] = [];
    if (totalUnseals >= 10) achievements.push("🔹 10+ Unseals");
    if (highestEternity >= 500) achievements.push("🔹 500+ Eternity Achiever");
    if (totalFlamesBurned >= 500_000) achievements.push("🔹 500k+ Flames Burned");

    const careerData = {
      highestEternity,
      totalFlamesBurned,
      totalBonusTT,
      totalUnseals,
      firstUnsealDate,
      achievements
    };

    await upsertEternityCareer(userId, guildId, careerData);
    console.log(`🏆 Career successfully updated for ${userId}`);

  } catch (err) {
    console.error("❌ Error while updating Eternity Career:", err);
  }
}