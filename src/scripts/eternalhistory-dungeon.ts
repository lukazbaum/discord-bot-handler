// eternalhistory_dungeon.ts - Full History Dungeon Win Scanner

import { Client, GatewayIntentBits, TextChannel, Collection, Message } from "discord.js";
import { config } from "dotenv";
import fs from "fs/promises";
import cliProgress from "cli-progress";

import {
  parseDungeonEmbed,
  extractPlayerNameFromEmbed
} from "./services/eUtils.js";

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

function isDungeonWinEmbed(embed: any): boolean {
  return embed.author?.name?.toLowerCase().includes("quest") &&
    embed.fields?.some((f: any) => /eternity flame/i.test(f.value));
}

function parseFlamesFromDungeonEmbed(embed: any): number {
  const parsed = parseDungeonEmbed(embed);
  return parsed.flamesEarned ?? 0;
}

function extractUserIdFromIconUrl(url: string): string | null {
  const match = url.match(/\/avatars\/(\d+)\//);
  return match ? match[1] : null;
}

async function scanChannel(channel: TextChannel, guild: any, knownUserIds: Set<string>) {
  let lastId = lastIds[channel.id];

  const progressBar = new cliProgress.SingleBar({
    format: `[{bar}] {percentage}% | {value} msgs | ETA: {eta_formatted}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  }, cliProgress.Presets.shades_classic);
  progressBar.start(100000, 0);

  while (true) {
    try {
      const options: { limit: number; before?: string } = { limit: 100 };
      if (lastId) options.before = lastId;

      const messages = await channel.messages.fetch(options) as Collection<string, Message<true>>;
      if (messages.size === 0) break;

      for (const message of messages.values()) {
        totalMessages++;
        progressBar.increment();

        if (message.author?.id !== EPIC_RPG_ID || !message.embeds.length) continue;

        const embed = message.embeds[0];
        if (!isDungeonWinEmbed(embed)) continue;

        const userId = extractUserIdFromIconUrl(embed.author?.iconURL || '');
        const username = embed.author?.name?.split(' — ')[0];
        const flames = parseFlamesFromDungeonEmbed(embed);
        const winDate = new Date(message.createdTimestamp);

        if (!userId || !knownUserIds.has(userId) || flames <= 0) continue;

        const key = `${userId}|${guild.id}|${winDate.toISOString()}`;
        if (existingWinKeys.has(key)) continue;

        await addEternalDungeonWin(userId, guild.id, flames, winDate);
        existingWinKeys.add(key);
        totalDungeons++;
        console.log(`🐉 +${flames} flames for ${username} (${userId}) on ${winDate.toISOString()}`);
      }

      const lastMessage = messages.last();
      if (lastMessage) {
        lastId = lastMessage.id;
        lastIds[channel.id] = lastId;
      }

      if (totalMessages % MAX_MESSAGES_BEFORE_SAVE === 0) {
        await saveLastIds();
        console.log(`💾 Saved progress after ${totalMessages} messages`);
      }

    } catch (err) {
      console.error(`⚠️ Error scanning ${channel.name}:`, err);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  await saveLastIds();
  progressBar.stop();
  console.log(`✅ Done with ${channel.name}`);
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
      c?.parent &&
      (
        ALLOWED_CATEGORY_NAMES.includes(c.parent.name?.toLowerCase() || '') ||
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

    await saveLastIds();
    console.log("\n🏁 Scan complete!");
    console.log(`🔎 Messages scanned: ${totalMessages}`);
    console.log(`🐉 Dungeon wins recorded: ${totalDungeons}`);
    process.exit(0);
  });

  client.login(process.env.DISCORD_TOKEN);
}

main();