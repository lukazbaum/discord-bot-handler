// src/scripts/sync_eternity_profiles.ts
import { syncAllProfiles } from './syncEternityProfiles.js';
import { config } from 'dotenv';
config();

const SYNC_INTERVAL_MINUTES = 10;

async function runSync() {
  console.log(`🛠️ [${new Date().toLocaleTimeString()}] Starting Eternity Profile Sync...`);

  try {
    await syncAllProfiles();
    console.log(`✅ [${new Date().toLocaleTimeString()}] Sync completed successfully.`);
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString()}] Sync failed:`, error);
  }
}

async function main() {
  console.log('🚀 Eternity Profile Auto-Sync Service started!');

  await runSync();

  setInterval(runSync, SYNC_INTERVAL_MINUTES * 60 * 1000);
}

main();