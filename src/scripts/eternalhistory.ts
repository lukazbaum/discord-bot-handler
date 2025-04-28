// full_backfill_v4.ts

import { Client, GatewayIntentBits, TextChannel, Snowflake, Collection, Message } from "discord.js";
import { config } from "dotenv";
import fs from "fs/promises";
import cliProgress from "cli-progress";
import {
  parseEternalEmbed,
  parseDungeonEmbed,
  extractPlayerNameFromEmbed
} from "./services/eUtils.js";
import {
  saveOrUpdateEternityProfile,
  getEternityProfile,
  addEternalDungeonWin,
  addEternalUnseal
} from "/home/ubuntu/ep_bot/extras/functions.js";

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
const LAST_IDS_FILE = "last_scanned_ids.json";
const MAX_MESSAGES_BEFORE_SAVE = 5000;
const PARALLEL_CHANNELS = 5;

let totalMessages = 0;
let totalEternities = 0;
let totalDungeons = 0;
let totalUnseals = 0;

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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveUserId(username: string, guild: any): Promise<string | null> {
  try {
    const members = await guild.members.fetch();
    const user = members.find((m: any) => m.user.username.toLowerCase() === username.toLowerCase());
    return user ? user.user.id : null;
  } catch (error) {
    console.error("❌ Error resolving user:", error);
    return null;
  }
}

// --- Local helpers --- //

function isEternityProfileEmbed(embed: any): boolean {
  return embed.fields?.some((f: any) => f.name.toLowerCase().includes("eternal progress"));
}

function isDungeonWinEmbed(embed: any): boolean {
  return embed.author?.name?.toLowerCase().includes("quest") &&
    embed.fields?.some((f: any) => /eternity flame/i.test(f.value));
}

function isEternalUnsealMessage(message: Message<true>): boolean {
  return message.content?.toLowerCase().includes("unsealed the eternity");
}

function parseFlamesFromDungeonEmbed(embed: any): number {
  const parsed = parseDungeonEmbed(embed);
  return parsed.flamesEarned ?? 0;
}

function parseUnsealFlamesAndTTFromMessage(message: Message<true>) {
  const flamesMatch = message.content.match(/-\s*([\d,]+)\s*<:eternityflame/i);
  const ttMatch = message.content.match(/got\s*([\d,]+)\s*<:timetravel/i);
  const flames = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, "")) : 0;
  const bonusTT = ttMatch ? parseInt(ttMatch[1].replace(/,/g, "")) : 0;
  return { flames, bonusTT };
}

// --- Scanning Functions --- //

async function scanChannel(channel: TextChannel, guild: any) {
  let lastId = lastIds[channel.id];
  if (lastId) {
    console.log(`📍 Resuming ${channel.name} from message ID ${lastId}`);
  } else {
    console.log(`📍 Starting fresh scan in ${channel.name}`);
  }

  console.log(`🔎 Scanning: ${channel.name}`);
  let messagesScanned = 0;
  let startTime = Date.now();

  const initialGuess = 50000;
  const progressBar = new cliProgress.SingleBar({
    format: `[{bar}] {percentage}% | {value}/{total} msgs | ETA: {eta_formatted}`,
    autopadding: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  }, cliProgress.Presets.shades_classic);

  progressBar.start(initialGuess, 0);
  let dynamicTotal = initialGuess;

  while (true) {
    try {
      const options: { limit: number; before?: Snowflake } = { limit: 100 };
      if (lastId) options.before = lastId;

      const messages = await fetchMessagesWithRetry(channel, options);
      if (messages.size === 0) break;

      const messageArray = Array.from(messages.values());

      for (const message of messageArray) {
        messagesScanned++;
        totalMessages++;
        progressBar.increment();

        if (messagesScanned > dynamicTotal - 5000) {
          dynamicTotal += 50000;
          progressBar.setTotal(dynamicTotal);
        }

        if (progressBar.getProgress() >= 1) {
          progressBar.update(progressBar.getTotal(), {
            barCompleteChar: '\u001b[32m█\u001b[0m',
            barIncompleteChar: ' '
          });
        }

        if (message.author?.bot && message.embeds.length) {
          const embed = message.embeds[0];

          if (isEternityProfileEmbed(embed)) {
            const username = extractPlayerNameFromEmbed(embed);
            const userId = await resolveUserId(username, guild);
            if (userId) {
              const parsed = parseEternalEmbed(embed.data);
              if (!parsed._error) {
                const currentProfile = await getEternityProfile(userId, guild.id);
                if (!currentProfile || parsed.eternalProgress >= currentProfile.current_eternality) {
                  await saveOrUpdateEternityProfile(userId, guild.id, parsed.eternalProgress);
                  totalEternities++;
                }
              }
            }
          }

          if (isDungeonWinEmbed(embed)) {
            const username = extractPlayerNameFromEmbed(embed);
            const userId = await resolveUserId(username, guild);
            if (userId) {
              const flames = parseFlamesFromDungeonEmbed(embed);
              if (flames > 0) {
                await addEternalDungeonWin(userId, guild.id, flames);
                totalDungeons++;
              }
            }
          }
        }

        if (isEternalUnsealMessage(message)) {
          const usernameMatch = message.content.match(/@?(\S+)/);
          const username = usernameMatch ? usernameMatch[1] : "";
          const userId = await resolveUserId(username, guild);
          if (userId) {
            const { flames, bonusTT } = parseUnsealFlamesAndTTFromMessage(message);
            await addEternalUnseal(userId, guild.id, flames, bonusTT);
            totalUnseals++;
          }
        }
      }

      // Move lastId back safely
      const lastMessage = messageArray[messageArray.length - 1];
      if (lastMessage) {
        lastId = (BigInt(lastMessage.id) - BigInt(1)).toString();
        lastIds[channel.id] = lastId;
      }

      if (messagesScanned >= MAX_MESSAGES_BEFORE_SAVE) {
        await saveLastIds();
        console.log(`💾 Progress saved after ${messagesScanned} messages in ${channel.name}`);
        messagesScanned = 0;
        startTime = Date.now();
      }

    } catch (err) {
      console.error(`⚠️ Error in channel ${channel.name}:`, err);
      await sleep(60000);
    }
  }

  await saveLastIds();
  progressBar.stop();
  console.log(`✅ Finished ${channel.name}`);
}

async function fetchMessagesWithRetry(channel: TextChannel, options: any): Promise<Collection<string, Message<true>>> {
  let retries = 0;
  while (true) {
    try {
      const messages = await channel.messages.fetch(options) as unknown as Collection<string, Message<true>>;
      return messages;
    } catch (err: any) {
      if (err.code === 429 && retries < 3) {
        const retryAfter = err.retry_after || 1000;
        console.warn(`⏳ Rate limit hit, sleeping ${retryAfter}ms (retry ${retries + 1})`);
        await sleep(retryAfter);
        retries++;
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user!.tag}`);
    const guild = await client.guilds.fetch(TARGET_GUILD_ID).then(g => g.fetch());
    if (!guild) {
      console.error("❌ Guild not found.");
      process.exit(1);
    }

    const channels = await guild.channels.fetch();
    const textChannels = channels.filter((c: any): c is TextChannel => c.isTextBased());
    console.log(`🛠️ Found ${textChannels.size} text channels.`);

    lastIds = await loadLastIds();

    const channelList = Array.from(textChannels.values());

    for (let i = 0; i < channelList.length; i += PARALLEL_CHANNELS) {
      const batch = channelList.slice(i, i + PARALLEL_CHANNELS);
      await Promise.all(batch.map(channel => scanChannel(channel, guild)));
    }

    await saveLastIds();

    console.log("\n🏁 Full scan completed!");
    console.log(`🔎 Messages scanned: ${totalMessages}`);
    console.log(`⚡ Eternities found: ${totalEternities}`);
    console.log(`🐉 Dungeons found: ${totalDungeons}`);
    console.log(`🔓 Unseals found: ${totalUnseals}`);
    process.exit(0);
  });

  client.login(process.env.DISCORD_TOKEN);
}

main();