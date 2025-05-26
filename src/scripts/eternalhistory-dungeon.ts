import { Client, GatewayIntentBits, TextChannel, Collection, Message, Guild } from 'discord.js';
import { config } from "dotenv";
import fs from "fs/promises";
import cliProgress from "cli-progress";
import { extractPlayerNameFromEmbed, parseDungeonEmbed  } from './services/eUtils.js';



import {
  addEternalDungeonWin,
  getAllUserIdsFromProfiles,
  getAllDungeonWinKeys,
} from "./functions-wrapper.js";

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TARGET_GUILD_ID = "1135995107842195550";
const LAST_IDS_FILE = "last_scanned_ids_dungeon.json";
const MAX_MESSAGES_BEFORE_SAVE = 5000;
const PARALLEL_CHANNELS = 5;
const EPIC_RPG_ID = "555955826880413696";
const OLDEST_BEFORE_ID = "1359737811007438849"; // message ID just after your cutoff

let totalMessages = 0;
let totalDungeons = 0;
let lastIds: Record<string, string> = {};
let existingWinKeys: Set<string>;

async function loadLastIds() {
  try {
    const data = await fs.readFile(LAST_IDS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveLastIds() {
  await fs.writeFile(LAST_IDS_FILE, JSON.stringify(lastIds, null, 2));
}

async function tryFindUserIdByName(guild: Guild, username: string): Promise<string | null> {
  try {
    const fetched = await guild.members.fetch({ query: username, limit: 1 });
    const match = fetched.find(member =>
      member.user.username.toLowerCase() === username.toLowerCase() ||
      member.displayName.toLowerCase() === username.toLowerCase()
    );

    if (match) return match.user.id;
    return null;
  } catch (err: any) {
    if (err.code === 'GuildMembersTimeout') {
      console.warn(`⏱️ Timeout fetching members in ${guild.name} when looking for ${username}`);
      return null;
    }
    console.error("❌ Unexpected error fetching member:", err);
    return null;
  }
}


async function scanChannel(
  channel: TextChannel,
  guild: Guild,
  knownUserIds: Set<string>
) {
  // initialize lastId from file or default
  let lastId = lastIds[channel.id] || OLDEST_BEFORE_ID;

  console.log(`📡 Scanning channel ${channel.name} (ID: ${channel.id}) before ${lastId}`);
  const progressBar = new cliProgress.SingleBar({
      format: `[{bar}] {percentage}% | {value} msgs | ETA: {eta_formatted}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    },
    cliProgress.Presets.shades_classic
  );
  progressBar.start(100000, 0);

  while (true) {
    const options: { limit: number; before?: string } = { limit: 100 };
    if (lastId) options.before = lastId;

    const messages = await channel.messages.fetch(options) as Collection<string, Message<true>>;
    if (messages.size === 0) break;

    for (const message of messages.values()) {
      totalMessages++;
      progressBar.increment();

      // only EpicRPG bot’s embeds
      if (message.author.id !== EPIC_RPG_ID || message.embeds.length === 0) continue;
      const embed = message.embeds[0];

      // 1️⃣ parse the embed as a dungeon win
      const { flamesEarned, _error } = parseDungeonEmbed(embed);
      if (_error || flamesEarned <= 0) continue;

      // 2️⃣ we know it’s a dungeon win—now extract the player
      const playerName = extractPlayerNameFromEmbed(embed);
      if (!playerName) {
        console.warn(`⚠️ Could not extract player name from dungeon embed in #${channel.name}`);
        continue;
      }

      // 3️⃣ resolve to your real userId
      const userId = await tryFindUserIdByName(message.guild!, playerName);
      if (!userId || !knownUserIds.has(userId)) continue;

      // 4️⃣ dedupe + persist
      const winDate = new Date(message.createdTimestamp);
      const key = `${userId}|${guild.id}|${winDate.toISOString()}`;
      if (existingWinKeys.has(key)) continue;

      await addEternalDungeonWin(userId, guild.id, flamesEarned, winDate);
      existingWinKeys.add(key);
      totalDungeons++;
      console.log(`🐉 +${flamesEarned} flames for ${playerName} (${userId}) on ${winDate.toISOString()}`);
    }

    // pagination
    const lastMessage = messages.last();
    if (lastMessage) {
      lastId = lastMessage.id;
      lastIds[channel.id] = lastId;
    }

    if (totalMessages % MAX_MESSAGES_BEFORE_SAVE === 0) {
      await saveLastIds();
      console.log(`💾 Saved progress after ${totalMessages} messages`);
    }
  }

  await saveLastIds();
  progressBar.stop();
  console.log(`✅ Done scanning ${channel.name}`);
}

async function main() {
  client.once("ready", async () => {
    console.log(`🤖 Logged in as ${client.user!.tag}`);
    const guild = await client.guilds.fetch(TARGET_GUILD_ID).then(g => g.fetch());
    const channels = await guild.channels.fetch();

    const ALLOWED_CATEGORY_NAMES = ["eternal logs", "epic-rpg-activity"];
    const ALLOWED_CATEGORY_IDS = new Set<string>([
      "1140190313915371530",
      "1152913513598173214",
      "1137026511921229905",
      "1147909067172483162",
      "1147909156196593787",
      "1147909539413368883",
      "1147909373180530708",
      "1147909282201870406",
      "1147909200924643349",
      "1219009472593399909",
    ]);

    const textChannels = Array.from(channels.values()).filter((c): c is TextChannel =>
      c?.isTextBased?.() &&
      c?.type === 0 &&
      c.parent &&
      (
        ALLOWED_CATEGORY_NAMES.includes(c.parent.name.toLowerCase()) ||
        ALLOWED_CATEGORY_IDS.has(c.parent.id)
      )
    );

    console.log(`📂 Scanning ${textChannels.length} channels`);

    lastIds = await loadLastIds();
    existingWinKeys = await getAllDungeonWinKeys();
    const knownUserIds = new Set<string>(
      (await getAllUserIdsFromProfiles()).map(u => u.user_id)
    );

    for (let i = 0; i < textChannels.length; i += PARALLEL_CHANNELS) {
      const batch = textChannels.slice(i, i + PARALLEL_CHANNELS);
      await Promise.all(batch.map(channel => scanChannel(channel, guild, knownUserIds)));
    }

    console.log("\n🏁 Scan complete!");
    console.log(`🔎 Messages scanned: ${totalMessages}`);
    console.log(`🐉 Dungeon wins recorded: ${totalDungeons}`);
    process.exit(0);
  });

  client.login(process.env.CLIENT_TOKEN).catch(error => {
    console.error('Login Error:', error);
  });
}

main();