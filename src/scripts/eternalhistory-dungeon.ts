
// optimized_eternalhistory.ts - Faster dungeon scanner
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
  getEternalDungeonWins,
} from "./functions-wrapper.js"; // Adjust if needed

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
const PARALLEL_CHANNELS = 6;
const EPIC_RPG_ID = "555955826880413696";

let totalMessages = 0;
let totalDungeons = 0;
let lastIds: Record<string, string> = {};

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
    format: `[{bar}] {percentage}% | {value}/{total} msgs | ETA: {eta_formatted}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  }, cliProgress.Presets.shades_classic);
  progressBar.start(50000, 0);

  while (true) {
    try {
      const options: { limit: number; before?: string } = { limit: 100 };
      if (lastId) options.before = lastId;

      const messages = await channel.messages.fetch(options) as Collection<string, Message<true>>;
      if (messages.size === 0) break;

      for (const message of messages.values()) {
        totalMessages++;
        progressBar.increment();

        if (message.author?.id === EPIC_RPG_ID && message.embeds.length) {
          const embed = message.embeds[0];
          if (isDungeonWinEmbed(embed) && message.author.id === EPIC_RPG_ID) {
            const userId = extractUserIdFromIconUrl(embed.author?.iconURL || '');
            const username = embed.author?.name?.split(' — ')[0];

            if (!userId || !knownUserIds.has(userId)) {
              console.warn(`⚠️ Skipping dungeon win. User ID not resolved for ${username}`);
              continue;
            }

            const flames = parseFlamesFromDungeonEmbed(embed);
            const date = new Date(message.createdTimestamp);

            if (flames > 0) {
              await addEternalDungeonWin(userId, guild.id, flames, date);
              console.log(`🐉 Dungeon win: +${flames} flames for ${username} (${userId}) on ${date.toISOString()}`);
              totalDungeons++;
            }
          }
        }
      }

      const lastMessage = messages.last();
      if (lastMessage) {
        lastId = (BigInt(lastMessage.id) - BigInt(1)).toString();
        lastIds[channel.id] = lastId;
      }

      if (totalMessages % MAX_MESSAGES_BEFORE_SAVE === 0) {
        await saveLastIds();
        console.log(`💾 Progress saved after ${totalMessages} total messages`);
      }

    } catch (err) {
      console.error(`⚠️ Error scanning ${channel.name}:`, err);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  await saveLastIds();
  progressBar.stop();
  console.log(`✅ Finished scanning ${channel.name}`);
}

async function main() {
  client.once("ready", async () => {
    console.log(`🤖 Logged in as ${client.user!.tag}`);
    const guild = await client.guilds.fetch(TARGET_GUILD_ID).then(g => g.fetch());
    const channels = await guild.channels.fetch();
    const textChannels = channels.filter((c: any): c is TextChannel => c.isTextBased());
    console.log(`🛠️ Found ${textChannels.size} text channels.`);

    const knownUserIds = new Set<string>(
      (await getAllUserIdsFromProfiles()).map((u: { user_id: string }) => u.user_id)
    );
    lastIds = await loadLastIds();
    const channelList = Array.from(textChannels.values());

    for (let i = 0; i < channelList.length; i += PARALLEL_CHANNELS) {
      const batch = channelList.slice(i, i + PARALLEL_CHANNELS);
      await Promise.all(batch.map(channel => scanChannel(channel, guild, knownUserIds)));
    }

    await saveLastIds();
    console.log("\n🏁 Dungeon flame scan complete!");
    console.log(`🔎 Messages scanned: ${totalMessages}`);
    console.log(`🐉 Dungeon wins recorded: ${totalDungeons}`);
    process.exit(0);
  });

  client.login(process.env.DISCORD_TOKEN);
}

main();
