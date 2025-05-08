// eternalhistory-unseals.ts – backfill unseal messages with correct date and values
import { Client, GatewayIntentBits, TextChannel, Collection, Message } from "discord.js";
import { config } from "dotenv";
import fs from "fs/promises";
import cliProgress from "cli-progress";
import { addEternalUnseal, getAllUserIdsFromProfiles } from "./functions-wrapper.js";

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
const LAST_IDS_FILE = "last_scanned_ids_unseals.json";
const MAX_MESSAGES_BEFORE_SAVE = 5000;
const PARALLEL_CHANNELS = 5;
const EPIC_RPG_ID = "555955826880413696";

let totalMessages = 0;
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

async function resolveUserIdFromUnsealContext(message: Message, EPIC_RPG_ID: string): Promise<string | null> {
  const recentMessages = await message.channel.messages.fetch({ before: message.id, limit: 10 });

  for (const msg of recentMessages.values()) {
    if (
      msg.author.id === EPIC_RPG_ID &&
      /are you sure you want to unseal/i.test(msg.content) &&
      msg.mentions.users.size === 1
    ) {
      return msg.mentions.users.first()?.id || null;
    }
  }

  return null;
}

async function saveLastIds() {
  await fs.writeFile(LAST_IDS_FILE, JSON.stringify(lastIds, null, 2));
}

function parseUnsealFlamesAndTT(content: string): { flames: number, bonusTT: number } {
  const flamesMatch = content.match(/-\s*([\d,]+)\s*<:eternityflame/i);
  const ttMatch = content.match(/got\s*([\d,]+)\s*<:timetravel/i);
  const flames = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, '')) : 0;
  const bonusTT = ttMatch ? parseInt(ttMatch[1].replace(/,/g, '')) : 0;
  return { flames, bonusTT };
}

function extractUsername(content: string): string | null {
  const userMatch = content.match(/\*\*(\w+)\*\* unsealed/i);
  return userMatch ? userMatch[1] : null;
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

        if (message.author?.id !== EPIC_RPG_ID) continue;
        if (!/unsealed \*\*the eternity\*\*/i.test(message.content)) continue;

        const userId = await resolveUserIdFromUnsealContext(message, EPIC_RPG_ID);

        if (!userId || !knownUserIds.has(userId)) {
          console.warn(`⚠️ Could not resolve userId from nearby confirmation message.`);
          continue;
        }

        const { flames, bonusTT } = parseUnsealFlamesAndTT(message.content);
        const date = new Date(message.createdTimestamp);

        await addEternalUnseal(userId, guild.id, flames, 0, bonusTT); // eternalityAtUnseal set to 0 for now
        console.log(`🔓 Unseal recorded: ${userId} -${flames} 🔥, +${bonusTT} TT on ${date.toISOString()}`);
        totalUnseals++;
      }

      const lastMessage = messages.last();
      if (lastMessage) {
        lastId = (BigInt(lastMessage.id) - BigInt(1)).toString();
        lastIds[channel.id] = lastId;
      }

      if (totalMessages % MAX_MESSAGES_BEFORE_SAVE === 0) {
        await saveLastIds();
        console.log(`💾 Progress saved after ${totalMessages} messages`);
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
    console.log("\n🏁 Unseal scan complete!");
    console.log(`🔎 Messages scanned: ${totalMessages}`);
    console.log(`🔓 Unseals recorded: ${totalUnseals}`);
    process.exit(0);
  });

  client.login(process.env.DISCORD_TOKEN);
}

main();