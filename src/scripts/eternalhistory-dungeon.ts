// src/scripts/eternalhistory-dungeon.ts

import { Client, GatewayIntentBits, TextChannel, Collection, Message, Guild } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs/promises';
import cliProgress from 'cli-progress';
import { extractPlayerNameFromEmbed, parseDungeonEmbed } from './services/eUtils.js';
import {
  addEternalDungeonWin,
  getAllUserIdsFromProfiles,
  getAllDungeonWinKeys
} from './functions-wrapper.js';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// ── Configuration ────────────────────────────────────────────────────────────────
const TARGET_GUILD_ID        = '1135995107842195550';
const LAST_IDS_FILE          = 'last_scanned_ids_dungeon.json';
const MAX_MESSAGES_BEFORE_SAVE = 5000;
const PARALLEL_CHANNELS      = 5;
const EPIC_RPG_ID            = '555955826880413696';

// When you run for the very first time, only fetch messages _after_ this ID.
// Change it to some message ID just after your cutoff; subsequent runs will use the saved cursors.
const START_AFTER_ID         = '1367369155430580337';

// Categories (by name lowercase or by ID) where dungeon‐win messages may appear:
const ALLOWED_CATEGORY_IDS   = new Set<string>([
  '1140190313915371530',
  '1152913513598173214',
  '1137026511921229905',
  '1147909067172483162',
  '1147909156196593787',
  '1147909539413368883',
  '1147909373180530708',
  '1147909282201870406',
  '1147909200924643349',
  '1219009472593399909',
]);
const ALLOWED_CATEGORY_NAMES = new Set<string>([
  'eternal logs',
  'epic-rpg-activity'
]);
// ────────────────────────────────────────────────────────────────────────────────

let totalMessages = 0;
let totalDungeons = 0;
let lastIds: Record<string, string> = {};
let existingWinKeys: Set<string>;

// Load “last seen message IDs” per channel from disk (or return empty if missing)
async function loadLastIds(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(LAST_IDS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Persist “last seen message IDs” back to disk
async function saveLastIds(): Promise<void> {
  await fs.writeFile(LAST_IDS_FILE, JSON.stringify(lastIds, null, 2));
}

// For a single guild member, find their Discord user ID by exact username or nickname.
// Returns null on timeout or if not found.
async function tryFindUserIdByName(guild: Guild, username: string): Promise<string | null> {
  try {
    const fetched = await guild.members.fetch({ query: username, limit: 1 });
    const match   = fetched.find(m =>
      m.user.username.toLowerCase() === username.toLowerCase() ||
      m.displayName.toLowerCase() === username.toLowerCase()
    );
    return match ? match.user.id : null;
  } catch (err: any) {
    // If Discord times us out, just return null
    if (err.code === 'GuildMembersTimeout') {
      console.warn(`⏱️ Timeout fetching members in ${guild.name} looking for "${username}"`);
      return null;
    }
    console.error('❌ Unexpected error fetching member:', err);
    return null;
  }
}

// Scan exactly one TextChannel for new “dungeon-win” embeds.
// Only fetches messages whose ID is strictly > `lastId`, so we only grab “newer” messages.
// Upholds a small 500 ms throttle between each batch of 100 to avoid hammering Discord.
async function scanChannel(
  channel: TextChannel,
  guild: Guild,
  knownUserIds: Set<string>
) {
  // Start after the last‐saved ID, or the initial cutoff if none is stored.
  let lastId = lastIds[channel.id] || START_AFTER_ID;
  console.log(`📡 Scanning #${channel.name} (ID: ${channel.id}) after ${lastId}`);

  // Progress bar just tracks how many messages we’ve processed so far:
  const progressBar = new cliProgress.SingleBar({
    format: `[{bar}] {value} msgs processed`,
    hideCursor: true
  }, cliProgress.Presets.shades_classic);
  progressBar.start(0, 0);

  while (true) {
    let fetched: Collection<string, Message<true>>;
    try {
      fetched = await channel.messages.fetch({ limit: 100, after: lastId });
    } catch (err: any) {
      // If we get HTTP 429, back off for 5 seconds then retry
      if (err.status === 429) {
        console.warn(`⏳ Rate limited when fetching #${channel.name}. Waiting 5 s…`);
        await new Promise(r => setTimeout(r, 5_000));
        continue;
      }
      console.error(`⚠️ Error fetching #${channel.name}:`, err);
      break;
    }

    if (fetched.size === 0) {
      // No new messages → done scanning this channel
      break;
    }

    // Sort from oldest to newest, so we advance lastId in chronological order:
    const sorted = fetched.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    for (const msg of sorted.values()) {
      totalMessages++;
      progressBar.setTotal(totalMessages);
      progressBar.update(totalMessages);

      // Only care about EpicRPG bot’s embeds, and need at least one embed
      if (msg.author.id !== EPIC_RPG_ID || msg.embeds.length === 0) {
        continue;
      }

      const embedData = msg.embeds[0];
      const { flamesEarned, _error } = parseDungeonEmbed(embedData);
      if (_error || flamesEarned <= 0) {
        // Not a dungeon‐win embed (or no flames earned), skip
        continue;
      }

      // Extract the player’s “human” name from the embed author line
      const playerName = extractPlayerNameFromEmbed(embedData);
      if (!playerName) {
        console.warn(`⚠️ Could not extract player name in #${channel.name}`);
        continue;
      }

      // Look up that player in your guild’s members cache
      const userId = await tryFindUserIdByName(msg.guild!, playerName);
      if (!userId || !knownUserIds.has(userId)) {
        continue;
      }

      // Build a unique key based on {userId}|{guildId}|{winDateISO}. That
      // prevents re‐inserting the same win more than once.
      const winDate = new Date(msg.createdTimestamp);
      const key = `${userId}|${guild.id}|${winDate.toISOString()}`;
      if (existingWinKeys.has(key)) {
        continue;
      }

      // Persist to your MySQL table:
      await addEternalDungeonWin(userId, guild.id, flamesEarned, winDate);
      existingWinKeys.add(key);
      totalDungeons++;
      console.log(`🐉 +${flamesEarned} flames for ${playerName} (${userId}) @ ${winDate.toISOString()}`);
    }

    // Advance the cursor (lastId) to the newest message we saw:
    const lastMessage = sorted.last();
    if (!lastMessage) {
      break;
    }
    lastId = lastMessage.id;
    lastIds[channel.id] = lastId;

    // Every MAX_MESSAGES_BEFORE_SAVE messages, persist our cursors to disk
    if (totalMessages % MAX_MESSAGES_BEFORE_SAVE === 0) {
      await saveLastIds();
      console.log(`💾 Saved progress after ${totalMessages} messages`);
    }

    // Tiny throttle to avoid blasting Discord too quickly
    await new Promise(r => setTimeout(r, 500));
  }

  // Final save for this channel
  await saveLastIds();
  progressBar.stop();
  console.log(`✅ Finished scanning #${channel.name}`);
}

// Entry‐point
async function main() {
  client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user!.tag}`);

    // Fetch the guild object, then fetch its channels
    const guild = await client.guilds.fetch(TARGET_GUILD_ID).then(g => g.fetch());
    const allChannels = await guild.channels.fetch();

    // Filter to only TextChannels whose parent category matches our whitelist
    const textChannels: TextChannel[] = [];
    for (const ch of allChannels.values()) {
      if (
        ch?.isTextBased() &&
        ch.type === 0 &&                    // “GUILD_TEXT”
        ch.parent                           // ensure there _is_ a parent
      ) {
        const parent = ch.parent;
        // Compare parent.id or parent.name (lowercased)
        if (
          ALLOWED_CATEGORY_IDS.has(parent.id) ||
          ALLOWED_CATEGORY_NAMES.has(parent.name.toLowerCase())
        ) {
          textChannels.push(ch as TextChannel);
        }
      }
    }

    console.log(`📂 Will scan ${textChannels.length} channels…`);

    // Load that JSON file of “where we left off”
    lastIds        = await loadLastIds();
    existingWinKeys = new Set<string>(await getAllDungeonWinKeys());

    // Fetch your set of valid userIds from your `eternity_profiles` table
    const profileRows = await getAllUserIdsFromProfiles();
    const knownUserIds = new Set<string>(profileRows.map(u => u.user_id));

    for (let i = 0; i < textChannels.length; i += PARALLEL_CHANNELS) {
      const batch = textChannels.slice(i, i + PARALLEL_CHANNELS);
      await Promise.all(batch.map(ch => scanChannel(ch, guild, knownUserIds)));
      // Stagger each batch a bit to reduce burstiness
      await new Promise(r => setTimeout(r, 1_000));
    }

    console.log(
      `\n🏁 Scan complete! Messages scanned: ${totalMessages}, ` +
      `Dungeon wins recorded: ${totalDungeons}`
    );
    process.exit(0);
  });

  client.login(process.env.CLIENT_TOKEN).catch(console.error);
}

main();

// ──── eUtils.ts (for reference) ────────────────────────────────────────────────
//   export function extractPlayerNameFromEmbed(embed: any): string {
//     return embed.author?.name?.split("—")[0]?.trim() || '';
//   }
//
//   export interface DungeonEmbedData { flamesEarned: number; _error?: string; }
//   export function parseDungeonEmbed(embed: any): DungeonEmbedData {
//     // Finds a field whose “name” includes “won ... eternity flame”
//     const winField = embed.fields.find((f: any) =>
//       /won\s*[\d,]+\s*<:eternityflame/i.test(f.name)
//     );
//     if (!winField) {
//       return { flamesEarned: 0, _error: 'No “eternity flame” in embed.name' };
//     }
//     const m = winField.name.match(/won\s*([\d,]+)\s*<:eternityflame/i);
//     if (!m) {
//       return { flamesEarned: 0, _error: 'Couldn’t extract number from embed.name' };
//     }
//     return { flamesEarned: parseInt(m[1].replace(/,/g, ''), 10) };
//   }
// ────────────────────────────────────────────────────────────────────────────────