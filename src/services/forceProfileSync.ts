// src/services/forceProfileSync.ts

import {
  getEternityProfile,
  getEternalUnsealHistory,
  getEternalDungeonWins,
  upsertEternityCareer,
  saveOrUpdateEternityProfile,
  updateEternityPlan,
  getEternityPlan
} from '../scripts/functions-wrapper'; // Adjust path if needed

export async function forceProfileSync(userId: string, guildId: string): Promise<void> {
  try {
    const [profile, unseals, dungeons, savedPlan] = await Promise.all([
      getEternityProfile(userId, guildId),
      getEternalUnsealHistory(userId),
      getEternalDungeonWins(userId, guildId),
      getEternityPlan(userId, guildId)
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

    // 🔁 Always attempt to update eternity_plans if plan and gear info exists
    if (savedPlan && profile.sword_tier && profile.armor_tier) {
      const latestTT = profile.last_unseal_tt || 0;
      const daysSealed = savedPlan.daysSealed || 0;
      const ttGoal = savedPlan.ttGoal || 0;

      const hasDiscount = profile.sword_tier >= 6 && profile.armor_tier >= 6;
      const flamesNeeded = Math.floor((25 * Math.max(profile.current_eternality, 200) + 25) * (hasDiscount ? 0.8 : 1));
      const bonusTT = Math.floor(
        profile.current_eternality *
        (ttGoal - latestTT + (daysSealed / 15)) *
        3 / 2500 *
        (1 + daysSealed * 0.01)
      );

      await updateEternityPlan(userId, guildId, {
        bonus_tt_estimate: bonusTT,
        flames_needed: flamesNeeded
      });

      console.log(`📘 Eternity Plan updated for ${userId}: ${bonusTT} bonus TT, ${flamesNeeded} flames`);
    }

    // 🎯 Build career data with historical bonus TT
    const totalBonusTT = unseals.reduce((sum, u) => sum + (u.bonusTT || 0), 0);

    const careerData = {
      highestEternity: profile.current_eternality || 0,
      totalFlamesBurned: totalFlamesEarned,
      totalBonusTT,
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
