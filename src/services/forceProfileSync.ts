// src/services/forceProfileSync.ts

import {
  getEternityProfile,
  getEternalUnsealHistory,
  getEternalDungeonWins,
  upsertEternityCareer,
  saveOrUpdateEternityProfile
} from '../scripts/functions-wrapper'; // Adjust path if needed

export async function forceProfileSync(userId: string, guildId: string): Promise<void> {
  try {
    const [profile, unseals, dungeons] = await Promise.all([
      getEternityProfile(userId, guildId),
      getEternalUnsealHistory(userId),
      getEternalDungeonWins(userId, guildId)
    ]);

    if (!profile) {
      console.warn(`⚠️ No eternity profile found for user ${userId} (${guildId})`);
      return;
    }

    const totalUnseals = unseals?.length || 0;
    const totalDungeonWins = dungeons?.length || 0;

    const totalFlamesFromUnseals = unseals.reduce((sum, u) => sum + (u.flamesCost || 0), 0);
    const totalFlamesFromDungeons = dungeons.reduce((sum, d) => sum + (d.flamesEarned || 0), 0);
    const totalFlamesEarned = totalFlamesFromUnseals + totalFlamesFromDungeons;

    // 🚫 DO NOT overwrite lastUnsealTT using bonusTT
    const existingLastUnsealTT = profile.last_unseal_tt ?? 0;

    const needsProfileUpdate =
      profile.total_edungeon_wins !== totalDungeonWins ||
      profile.total_flames_earned !== totalFlamesEarned;

    if (needsProfileUpdate) {
      await saveOrUpdateEternityProfile(
        userId,
        guildId,
        profile.current_eternality || 0,
        null,
        totalDungeonWins,
        totalFlamesEarned,
        existingLastUnsealTT // ✅ preserve correct lastUnsealTT
      );

      console.log(`✅ Eternity Profile updated for user ${userId}`);
    } else {
      console.log(`ℹ️ Eternity Profile already up-to-date for user ${userId}`);
    }

    // 🎯 Build career data
    const careerData = {
      highestEternity: profile.current_eternality || 0,
      totalFlamesBurned: totalFlamesEarned,
      totalBonusTT: unseals.reduce((sum, u) => sum + (u.bonusTT || 0), 0),
      totalUnseals,
      firstUnsealDate: unseals.length ? unseals[unseals.length - 1].unsealDate : null,
      achievements: []
    };

    if (totalUnseals >= 10) careerData.achievements.push('🔹 10+ Unseals');
    if (careerData.highestEternity >= 500) careerData.achievements.push('🔹 500+ Eternity Achiever');
    if (careerData.totalFlamesBurned >= 500_000) careerData.achievements.push('🔹 500k+ Flames Burned');

    await upsertEternityCareer(userId, guildId, careerData);

    console.log(`🏆 Eternity Career successfully updated for user ${userId}`);
  } catch (err) {
    console.error(`❌ Failed to force sync for ${userId} (${guildId}):`, err);
  }
}