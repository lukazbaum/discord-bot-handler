import { calculateFullInfo, calcBonusTT } from './services/eUtils.js';
import {
  getAllUserIdsFromProfiles,
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternityProfile,
  getEternityPlan,
  updateEternityPlan
} from './functions-wrapper.js';

export async function syncAllProfiles(): Promise<void> {
  const users = await getAllUserIdsFromProfiles();

  for (const { user_id, guild_id } of users) {
    const [profile, plan, unseals, dungeons] = await Promise.all([
      getEternityProfile(user_id),
      getEternityPlan(user_id),
      getEternalUnsealHistory(user_id),
      getEternalDungeonWins(user_id, guild_id)
    ]);

    if (!profile) continue;

    // 🎯 Strategy values
    const targetEternity = plan?.targetEternity ?? profile.target_eternality ?? profile.current_eternality + 200;
    const currentEternity = plan?.currentEternity ?? profile.current_eternality;
    const ttGoal = plan?.ttGoal ?? profile.tts_gained_during_seal ?? 50;
    const daysSealed = plan?.daysSealed ?? profile.days_sealed ?? 60;
    const lastUnsealTT = profile.last_unseal_tt ?? 0;
    const ttGained = Math.max(1, ttGoal - lastUnsealTT);

    // 🧠 Prepare calculation inputs
    const eternal = {
      eternalProgress: currentEternity,
      lastUnsealTT,
      swordTier: profile.sword_tier,
      armorTier: profile.armor_tier
    };

    const inventory = {
      eternityFlames: profile.flames_owned ?? 0
    };

    // 🔢 Primary result for display (uses target Eternity)
    const displayResult = calculateFullInfo(
      eternal,
      profile,
      inventory,
      targetEternity,
      36,
      ttGained,
      daysSealed
    );

    // 🔢 Bonus TT and flame calc (uses current Eternity)
    const currentResult = calculateFullInfo(
      eternal,
      profile,
      inventory,
      currentEternity,
      36,
      ttGained,
      daysSealed
    );

    if (displayResult._error || currentResult._error) {
      console.warn(`⚠️ Skipping ${user_id}: ${displayResult._error || currentResult._error}`);
      continue;
    }

    // 🎯 Compute corrected bonus + flame values
    const correctedBonusTT = calcBonusTT(currentEternity, ttGained, daysSealed);
    const correctedFlamesNeeded = Math.max(currentResult.currentUnsealFlames - inventory.eternityFlames, 0);

    const powerReady = displayResult.currentGear.attack >= displayResult.atkPowerNeeded;
    const biteReady = displayResult.currentGear.attack >= displayResult.atkBitePowerNeeded;
    const potencyReady = Math.floor((displayResult.currentGear.attack / displayResult.atkPowerNeeded) * 40) >= 20;

    // 🧾 Debug logs
    console.log(`[PlanCalc] User ${user_id}`);
    console.log(`→ Eternity: ${currentEternity}, Target: ${targetEternity}, TT Goal: ${ttGoal}, Days: ${daysSealed}`);
    console.log(`→ TT Gained: ${ttGained}, Bonus TT: ${correctedBonusTT}, Flames Needed: ${correctedFlamesNeeded}`);

    if (plan) {
      await updateEternityPlan(user_id, guild_id, {
        bonus_tt_estimate: correctedBonusTT,
        flames_needed: correctedFlamesNeeded,
        dungeons_needed: displayResult.dungeonsNeeded ?? 0,
        est_time_cookies: displayResult.estTC ?? 0,
        power_ready: powerReady,
        bite_ready: biteReady,
        potency_ready: potencyReady
      });

      console.log(`📘 Updated eternity plan readiness for ${user_id}`);
    } else {
      console.log(`⚠️ No eternity plan found for ${user_id} — skipping plan update.`);
    }

    // 🔒 Profile sync is handled via embed listeners
    console.log(`✅ Skipped profile update for ${user_id} (already managed by embed listener)`);
  }
}