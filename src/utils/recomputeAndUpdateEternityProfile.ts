import {
  getEternityProfile,
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternalPathChoice,
  saveOrUpdateEternityProfile
} from '/home/ubuntu/ep_bot/extras/functions';

export async function recomputeAndUpdateEternityProfile(userId: string, guildId: string): Promise<void> {
  try {
    // Fetch existing data
    const [profile, unseals, dungeonWins, pathChoice] = await Promise.all([
      getEternityProfile(userId, guildId),
      getEternalUnsealHistory(userId),
      getEternalDungeonWins(userId, guildId),
      getEternalPathChoice(userId, guildId)
    ]);

    if (!profile) {
      console.warn(`⚠️ No eternity profile found for ${userId} to recompute.`);
      return;
    }

    // --- 🧮 Compute New Totals --- //

    const totalUnseals = unseals.length;
    const totalDungeonWins = dungeonWins.length;

    const totalFlamesEarned = dungeonWins.reduce((sum, win) => sum + (win.flamesEarned || 0), 0);
    const totalFlamesBurned = unseals.reduce((sum, unseal) => sum + (unseal.flamesCost || 0), 0);
    const totalBonusTT = unseals.reduce((sum, unseal) => sum + (unseal.bonusTT || 0), 0);

    const firstUnsealDate = unseals.length ? unseals[unseals.length - 1].createdAt : null;

    const ttsGainedDuringSeal = profile.tts_gained_during_seal || 0;
    const daysSealed = profile.days_sealed || 0;

    const preferredPlaystyle = profile.preferred_playstyle || null;
    const flamesOwned = profile.flames_owned || 0;
    const swordTier = profile.sword_tier || 1;
    const swordLevel = profile.sword_level || 0;
    const armorTier = profile.armor_tier || 1;
    const armorLevel = profile.armor_level || 0;
    const lastUnsealTT = profile.last_unseal_tt || 0;

    const chosenPath = pathChoice?.chosen_path || null;
    const targetEternity = pathChoice?.target_eternity || null;

    // --- 📝 Save to DB --- //

    await saveOrUpdateEternityProfile(
      userId,
      guildId,
      profile.current_eternality || 0,
      flamesOwned,
      totalDungeonWins,
      totalFlamesEarned + totalFlamesBurned,
      lastUnsealTT,
      ttsGainedDuringSeal,
      daysSealed,
      preferredPlaystyle,
      chosenPath,
      targetEternity,
      swordTier,
      swordLevel,
      armorTier,
      armorLevel
    );

    console.log(`✅ Eternity Profile recalculated and saved for user ${userId}`);
  } catch (err) {
    console.error(`❌ Error recomputing Eternity Profile for user ${userId}:`, err);
  }
}