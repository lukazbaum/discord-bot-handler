// src/services/syncEternityProfiles.ts

import {
  getAllUserIdsFromProfiles,
  getEternalUnsealHistory,
  getEternalDungeonWins,
  getEternityProfile,
  saveOrUpdateEternityProfile
} from './functions-wrapper';

export async function syncAllProfiles(): Promise<void> {
  try {
    const users: { user_id: string; guild_id: string }[] = await getAllUserIdsFromProfiles();

    if (!users.length) {
      console.log('⚠️ No eternity profiles found to sync.');
      return;
    }

    console.log(`🔎 Found ${users.length} users to sync...`);

    for (const { user_id, guild_id } of users) {
      try {
        const [profile, unseals, dungeons] = await Promise.all([
          getEternityProfile(user_id, guild_id),
          getEternalUnsealHistory(user_id),
          getEternalDungeonWins(user_id, guild_id)
        ]);

        if (!profile) {
          console.warn(`⚠️ No profile found for ${user_id}`);
          continue;
        }

        const totalUnseals = Array.isArray(unseals) ? unseals.length : 0;
        const totalDungeonWins = Array.isArray(dungeons) ? dungeons.length : 0;

        const totalFlamesFromUnseals = unseals?.reduce((sum, u) => sum + (u.flamesCost || 0), 0) || 0;
        const totalFlamesFromDungeons = dungeons?.reduce((sum, d) => sum + (d.flamesEarned || 0), 0) || 0;
        const totalFlamesEarned = totalFlamesFromUnseals + totalFlamesFromDungeons;

        // 🚫 Do not override lastUnsealTT or flamesOwned unless explicitly needed
        const existingLastUnsealTT = profile.last_unseal_tt ?? 0;

        await saveOrUpdateEternityProfile(
            user_id,
            guild_id,
            profile.current_eternality ?? 0,
            null, // don't touch flamesOwned
            totalDungeonWins,
            totalFlamesEarned,
            existingLastUnsealTT
        );

        console.log(`✅ Synced profile for user ${user_id} (Guild ${guild_id})`);

      } catch (err) {
        console.error(`❌ Error syncing profile for user ${user_id}:`, err);
      }
    }

    console.log('🏁 All profiles synchronized successfully!');

  } catch (err) {
    console.error('❌ Global error during eternity profile sync:', err);
  }
}