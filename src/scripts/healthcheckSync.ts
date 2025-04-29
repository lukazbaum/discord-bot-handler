// src/scripts/healthcheckSync.ts

import { config } from 'dotenv';
import { con } from '/home/ubuntu/ep_bot/extras/db-connection.js'; // adjust to wherever you import your MySQL connection
config();

const CHECK_INTERVAL_MINUTES = 10;  // How often to check
const MAX_ALLOWED_INACTIVITY_MINUTES = 20; // If no sync in last 20 minutes = alert

async function checkSyncHealth(): Promise<void> {
  console.log(`🔎 [${new Date().toLocaleTimeString()}] Running Sync Health Check...`);

  try {
    const [rows]: any = await new Promise((resolve, reject) => {
      con.query(
        `SELECT MAX(last_updated) AS lastSync FROM eternity_profiles`,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    if (!rows || !rows[0] || !rows[0].lastSync) {
      console.warn(`⚠️ No sync records found!`);
      return;
    }

    const lastSyncTime = new Date(rows[0].lastSync);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSyncTime.getTime()) / 60000;

    console.log(`🕒 Last profile sync was ${diffMinutes.toFixed(1)} minutes ago.`);

    if (diffMinutes > MAX_ALLOWED_INACTIVITY_MINUTES) {
      console.error(`🚨 ALERT: No Eternity Profile updates for over ${MAX_ALLOWED_INACTIVITY_MINUTES} minutes!`);
      // Optional: send a Discord webhook / email / etc.
    } else {
      console.log(`✅ Sync activity healthy.`);
    }
  } catch (err) {
    console.error(`❌ Healthcheck failed:`, err);
  }
}

async function main() {
  console.log('🩺 Eternity Profile Sync Health Monitor started!');

  await checkSyncHealth();

  setInterval(async () => {
    await checkSyncHealth();
  }, CHECK_INTERVAL_MINUTES * 60 * 1000);
}

main();