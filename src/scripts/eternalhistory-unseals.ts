// src/scripts/eternalhistory-unseals.ts
import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Collection,
  Message,
  Guild
} from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs/promises';
import cliProgress from 'cli-progress';
import {
  addEternalUnseal,
  getAllUserIdsFromProfiles,
  getAllUnsealKeys,
  getEternityProfile
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

// ── CONFIGURATION ────────────────────────────────────────────────────────────────
// Your target guild ID:
const TARGET_GUILD_ID         = '1135995107842195550';

// Where to persist per‐channel “last seen” message IDs:
const LAST_IDS_FILE           = 'last_scanned_ids_unseals.json';

// How many messages to process before persisting `lastIds` to disk:
const MAX_MESSAGES_BEFORE_SAVE = 5000;

// How many channels to scan in parallel:
const PARALLEL_CHANNELS       = 5;

// EpicRPG’s bot ID (used to filter only EpicRPG messages):
const EPIC_RPG_ID             = '555955826880413696';

// When doing your very first backfill, start *after* this message ID.
// On subsequent runs, the script will load per‐channel cursors from LAST_IDS_FILE.
const START_AFTER_ID          = '1375984017446535200';

// Categories (by ID or lowercase name) in which “unseal” messages appear:
const ALLOWED_CATEGORY_IDS    = new Set<string>([
  // '1140190313915371530',
  '1152913513598173214',
  '1137026511921229905',
  '1147909067172483162',
  '1147909156196593787',
  '1147909539413368883',
  '1147909373180530708',
  '1147909282201870406',
  '1147909200924643349',
  '1219009472593399909'
]);
const ALLOWED_CATEGORY_NAMES  = new Set<string>([
  'eternal logs',
  'epic-rpg-activity'
]);
// ────────────────────────────────────────────────────────────────────────────────


let totalMessages = 0;
let totalUnseals  = 0;

// Maintains “messageID cursor” per channel:
let lastIds: Record<string, string> = {};

// Already‐recorded keys in your database, to avoid duplicates:
let existingUnsealKeys: Set<string> = new Set();

// In‐memory “pending” map: channelId → pending unseal data
// We store flamesCost + userId + currentEternity … when we see “unsealed … (-X flames)”.
const pendingUnseals = new Map<
  string,
  {
    userId: string;
    guildId: string;
    flamesCost: number;
    unsealDate: Date;
    currentEternity: number;
    username: string;
  }
>();

// ── HELPERS ─────────────────────────────────────────────────────────────────────
// Load per‐channel “last seen” IDs from disk
async function loadLastIds(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(LAST_IDS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save per‐channel “last seen” IDs back to disk
async function saveLastIds(): Promise<void> {
  await fs.writeFile(LAST_IDS_FILE, JSON.stringify(lastIds, null, 2));
}

// Parse out “flames cost” and (optionally) “bonus TT” from one content string.
// - The “-X flames” message looks like:
//     “jennyb unsealed the eternity for 7d (-12,775 <:eternityflame:…>)”
// - The “+TT” message looks like: “jennyb got 29 <:timetravel:…> time travels”.
// This function just extracts numbers if present.
function parseUnsealFlamesAndTT(content: string): {
  flames: number;
  bonusTT: number;
} {
  // match “-12,775 <…eternityflame…>”
  const flamesMatch  = content.match(/-\s*([\d,]+)\s*(?:<:eternityflame:|🔥|eternity flames?)/i);
  // match “got 29 <:timetravel:…>”
  const bonusTTMatch = content.match(/got\s+([\d,]+)\s*(?::timetravel:|<:timetravel:[^>]*>|🌀|time travels?)/i);

  const flames  = flamesMatch  ? parseInt(flamesMatch[1].replace(/,/g, ''), 10) : 0;
  const bonusTT = bonusTTMatch ? parseInt(bonusTTMatch[1].replace(/,/g, ''), 10) : 0;

  console.debug(`[DEBUG] parseUnsealFlamesAndTT → flames=${flames}, bonusTT=${bonusTT}`);
  return { flames, bonusTT };
}

// The “resolveUserIdFromUnsealContext” looks at up to 10 messages immediately
// preceding the “unsealed the eternity” message, searching for a confirmation
// embed that mentions exactly one user, e.g. “Are you sure you want to unseal …? @jennyb”.
// Once found, we extract that mentioned user’s ID.
async function resolveUserIdFromUnsealContext(
  message: Message,
  epicBotId: string
): Promise<string | null> {
  const recent = await message.channel.messages.fetch({
    before: message.id,
    limit: 10
  });
  for (const msg of recent.values()) {
    if (
      msg.author.id === epicBotId &&
      /are you sure you want to unseal/i.test(msg.content) &&
      msg.mentions.users.size === 1
    ) {
      return msg.mentions.users.first()?.id || null;
    }
  }
  return null;
}

// Attempt to find a GuildMember by exact username or nickname:
async function tryFindUserIdByName(
  guild: Guild,
  username: string
): Promise<string | null> {
  try {
    const fetched = await guild.members.fetch({ query: username, limit: 1 });
    const match = fetched.find(member =>
      member.user.username.toLowerCase() === username.toLowerCase() ||
      member.displayName.toLowerCase() === username.toLowerCase()
    );
    return match ? match.user.id : null;
  } catch {
    return null;
  }
}
// ────────────────────────────────────────────────────────────────────────────────

// This function scans one text channel, in chronological order (oldest→newest),
// fetching messages “after lastId” each time.  Whenever it sees an “unsealed … (-X flames)” line,
// it queues a “pending” entry; whenever it sees a “got … time travels” line, it completes the entry,
// writes it to the database, and removes it from pending.
async function scanChannel(
  channel: TextChannel,
  guild: Guild,
  knownUserIds: Set<string>
) {
  // Load the cursor for this channel (or START_AFTER_ID if none saved)
  let lastId = lastIds[channel.id] || START_AFTER_ID;
  console.log(`📡 Scanning #${channel.name} after message ID ${lastId}`);

  // Create a progress bar that we manually update
  const progressBar = new cliProgress.SingleBar(
    { format: `[{bar}] {value} msgs processed`, hideCursor: true },
    cliProgress.Presets.shades_classic
  );
  progressBar.start(0, 0);

  while (true) {
    let fetched: Collection<string, Message<true>>;
    try {
      fetched = await channel.messages.fetch({
        limit: 100,
        after: lastId
      });
    } catch (err: any) {
      if (err.status === 429) {
        console.warn(`⏳ Rate limited on #${channel.name}, sleeping 5s…`);
        await new Promise(r => setTimeout(r, 5_000));
        continue;
      }
      console.error(`⚠️ Error fetching #${channel.name}:`, err);
      break;
    }

    if (fetched.size === 0) {
      // No more newer messages left
      break;
    }

    // Sort by timestamp ascending so we process oldest→newest
    const sorted = fetched.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    for (const msg of sorted.values()) {
      totalMessages++;
      progressBar.setTotal(totalMessages);
      progressBar.update(totalMessages);

      if (msg.author.id !== EPIC_RPG_ID) continue;
      const lines = msg.content.split('\n');
      for (const line of lines) {
        // 1️⃣ Unseal line (Discord markdown)
        const unsealLine = line.match(
          /^\*\*(.+?)\*\* unsealed \*\*the eternity\*\* for \*\*(\d+d)\*\* \((-?[\d,]+)[^)]*\)/i
        );
        if (unsealLine) {
          const playerName = unsealLine[1];
          const duration = unsealLine[2];
          const flamesCost = parseInt(unsealLine[3].replace(/,/g, ''), 10);
          console.log('DEBUG: Matched unseal:', { playerName, duration, flamesCost });

          const userId = await tryFindUserIdByName(msg.guild!, playerName);
          if (!userId || !knownUserIds.has(userId)) continue;

          const profile = await getEternityProfile(userId, guild.id);
          const currentEternity = profile?.current_eternality ?? 0;
          const username = profile?.username || playerName;

          pendingUnseals.set(msg.channel.id, {
            userId,
            guildId: guild.id,
            flamesCost,
            unsealDate: new Date(msg.createdTimestamp),
            currentEternity,
            username
          });
          continue;
        }

        // 2️⃣ TT line (Discord markdown)
        const ttLine = line.match(
          /^\*\*(.+?)\*\* got (\d+) [^*]+?\*\*time travels\*\*/i
        );
        if (ttLine) {
          const pending = pendingUnseals.get(msg.channel.id);
          if (!pending) continue;
          const bonusTT = parseInt(ttLine[2].replace(/,/g, ''), 10);

          console.log(
            `📤 Recording historical unseal for ${pending.username} (${pending.userId}):` +
            ` -${pending.flamesCost} 🔥, +${bonusTT} TT @ Eternity ${pending.currentEternity}`
          );

          await addEternalUnseal(
            pending.userId,
            pending.guildId,
            pending.flamesCost,
            pending.currentEternity,
            bonusTT,
            pending.username,
            pending.unsealDate
          );
          await getEternityProfile(pending.userId, pending.guildId);

          try { await msg.react('🔓'); } catch {}
          pendingUnseals.delete(msg.channel.id);
          totalUnseals++;
          continue;
        }
      }
    }
    // Advance cursor to the latest message we just processed
    const lastMessage = sorted.last();
    if (!lastMessage) break;
    lastId = lastMessage.id;
    lastIds[channel.id] = lastId;

    // Persist every so often
    if (totalMessages % MAX_MESSAGES_BEFORE_SAVE === 0) {
      await saveLastIds();
      console.log(`💾 Saved progress after ${totalMessages} messages`);
    }

    // Throttle slightly to avoid hammering
    await new Promise(r => setTimeout(r, 500));
  }

  // Final save for this channel
  await saveLastIds();
  progressBar.stop();
  console.log(`✅ Finished scanning #${channel.name}`);
}

// ── ENTRY POINT ─────────────────────────────────────────────────────────────────
async function main() {
  client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user!.tag}`);

    // Fetch the target guild and all its channels
    const guild    = await client.guilds.fetch(TARGET_GUILD_ID).then(g => g.fetch());
    const channels = await guild.channels.fetch();

    // Filter only those text channels under allowed categories
    const textChannels: TextChannel[] = [];
    for (const ch of channels.values()) {
      if (
        ch?.isTextBased() &&
        ch.type === 0 && // GUILD_TEXT
        ch.parent
      ) {
        const parentNameLower = ch.parent.name.toLowerCase();
        if (
          ALLOWED_CATEGORY_IDS.has(ch.parent.id) ||
          ALLOWED_CATEGORY_NAMES.has(parentNameLower)
        ) {
          textChannels.push(ch as TextChannel);
        }
      }
    }

    console.log(`📂 Will scan ${textChannels.length} channels for historical Unseals…`);

    // Load cursors and dedupe‐keys
    lastIds            = await loadLastIds();
    existingUnsealKeys = new Set<string>(await getAllUnsealKeys());

    // Pre‐load every userId we care about from eternity_profiles
    const profiles      = await getAllUserIdsFromProfiles();
    const knownUserIds  = new Set<string>(profiles.map(u => u.user_id));

    // Scan channels in batches
    for (let i = 0; i < textChannels.length; i += PARALLEL_CHANNELS) {
      const batch = textChannels.slice(i, i + PARALLEL_CHANNELS);
      await Promise.all(batch.map(ch => scanChannel(ch, guild, knownUserIds)));
      // Stagger between batches
      await new Promise(r => setTimeout(r, 1_000));
    }

    console.log(
      `\n🏁 All done!  Messages scanned: ${totalMessages},  Historical Unseals recorded: ${totalUnseals}`
    );
    process.exit(0);
  });

  await client.login(process.env.DUNGEON_TOKEN).catch(console.error);
}

main();
