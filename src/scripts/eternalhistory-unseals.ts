// eternalhistory-unseals.ts – Full History Unseal Backfill
import { Client, GatewayIntentBits, TextChannel, Collection, Message } from "discord.js";
import { config } from "dotenv";
import fs from "fs/promises";
import cliProgress from "cli-progress";
import {
  addEternalUnseal,
  getAllUserIdsFromProfiles,
  getAllUnsealKeys,
  getEternityProfile
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
const LAST_IDS_FILE = "last_scanned_ids_unseals.json";
const MAX_MESSAGES_BEFORE_SAVE = 5000;
const PARALLEL_CHANNELS = 5;
const EPIC_RPG_ID = "555955826880413696";

let totalMessages = 0;
let totalUnseals = 0;
let lastIds: Record<string, string> = {};
let existingUnsealKeys: Set<string> = new Set();

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

function parseUnsealFlamesAndTT(content: string): { flames: number, bonusTT: number } {
  const flamesMatch = content.match(/-\s*([\d,]+)\s*(<:eternityflame|🔥|eternity flames?)/i);
  const bonusTTMatch = content.match(/got\s+([\d,]+)\s*(?::timetravel:|<:timetravel:[^>]*>|🌀|time travels?)/i);
  const flames = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, '')) : 0;
  const bonusTT = bonusTTMatch ? parseInt(bonusTTMatch[1].replace(/,/g, '')) : 0;
  console.debug(`[DEBUG] Unseal message:`, content);
  console.debug(`[DEBUG] Parsed bonusTT:`, bonusTT);
  return { flames, bonusTT };
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

async function scanChannel(channel: TextChannel, guild: any, knownUserIds: Set<string>) {
  let lastId = lastIds[channel.id];
  const progressBar = new cliProgress.SingleBar({
    format: `[{bar}] {percentage}% | {value}/{total} msgs | ETA: {eta_formatted}`,
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

        if (message.author?.id !== EPIC_RPG_ID) continue;
        if (!/unsealed \*\*the eternity\*\*/i.test(message.content)) continue;

        const userId = await resolveUserIdFromUnsealContext(message, EPIC_RPG_ID);
        if (!userId || !knownUserIds.has(userId)) {
          console.warn(`⚠️ Could not resolve userId for message in ${channel.name}`);
          continue;
        }

        const date = new Date(message.createdTimestamp);
        let username = "";
        const recentMessages = await message.channel.messages.fetch({ before: message.id, limit: 10 });
        for (const msg of recentMessages.values()) {
          if (
            msg.author.id === EPIC_RPG_ID &&
            /are you sure you want to unseal/i.test(msg.content) &&
            msg.mentions.users.size === 1
          ) {
            username = msg.mentions.users.first()?.username || "";
            break;
          }
        }
        const key = `${userId}|${guild.id}|${date.toISOString()}`;
        if (existingUnsealKeys.has(key)) continue;

        const { flames, bonusTT } = parseUnsealFlamesAndTT(message.content);
        const prof = await getEternityProfile(userId, guild.id);
        const currentEternity = prof?.current_eternality ?? 0;
        await addEternalUnseal(
          userId,
          guild.id,
          flames,
          currentEternity,
          bonusTT,
          username,
          date
        );
        existingUnsealKeys.add(key);

        console.log(`🔓 Unseal: -${flames} 🔥, +${bonusTT} TT for ${userId} on ${date.toISOString()}`);
        totalUnseals++;
      }

      const lastMessage = messages.last();
      if (lastMessage) {
        lastId = (BigInt(lastMessage.id) - BigInt(1)).toString();
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
  console.log(`✅ Finished scanning ${channel.name}`);
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
    existingUnsealKeys = await getAllUnsealKeys();

    const knownUserIds = new Set<string>(
      (await getAllUserIdsFromProfiles()).map(u => u.user_id)
    );

    for (let i = 0; i < textChannels.length; i += PARALLEL_CHANNELS) {
      const batch = textChannels.slice(i, i + PARALLEL_CHANNELS);
      await Promise.all(batch.map(channel => scanChannel(channel, guild, knownUserIds)));
    }

    await saveLastIds();
    console.log("\n🏁 Unseal scan complete!");
    console.log(`🔎 Messages scanned: ${totalMessages}`);
    console.log(`🔓 Unseals recorded: ${totalUnseals}`);
    process.exit(0);
  });

  client.login(process.env.DUNGEON_TOKEN);
}

main();