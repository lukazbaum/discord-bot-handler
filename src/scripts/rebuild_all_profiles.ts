// src/scripts/rebuild_all_profiles.ts

import { config } from 'dotenv';
import { forceProfileSync } from './forceProfileSync';
import { getAllUserIdsFromProfiles } from './functions-wrapper'; // adjust path if needed

config(); // Load .env if needed

async function rebuildAllProfiles(): Promise<void> {
  try {
    console.log('🛠️ Rebuilding all Eternity Profiles from database...');

    const users: { user_id: string; guild_id: string }[] = await getAllUserIdsFromProfiles();

    if (!users.length) {
      console.warn('⚠️ No users found in eternity_profiles table.');
      return;
    }

    console.log(`🔎 Found ${users.length} profiles to rebuild.`);

    let successCount = 0;
    let failCount = 0;

    for (const { user_id, guild_id } of users) {
      try {
        await forceProfileSync(user_id, guild_id);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed syncing user ${user_id} (${guild_id}):`, err);
        failCount++;
      }
    }

    console.log(`🏁 Rebuild complete!`);
    console.log(`✅ Successful profiles: ${successCount}`);
    console.log(`❌ Failed profiles: ${failCount}`);

  } catch (err) {
    console.error('❌ Fatal error during profile rebuild:', err);
  }
}

// Run immediately
rebuildAllProfiles();