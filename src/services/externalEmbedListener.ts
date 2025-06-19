import { Message } from 'discord.js';
import {
  parseEternalEmbed,
  parseDungeonEmbed,
  parseProfileEmbed,
  parseInventoryEmbed,
  EternalEmbedData
} from './eUtils';

import {
  saveOrUpdateEternityProfile,
  addEternalUnseal,
  addEternalDungeonWin,
  getEternityPlan,
  getEternityProfile,
  updateEternityPlan,
  persistTTCache,
  getCachedTT,
} from '/home/ubuntu/ep_bot/extras/functions.js';

import { getCachedTimeTravels, cacheTimeTravels } from '../utils/ttCache';
import { tryFindUserIdByName } from './eternityUtils';
import { forceProfileSync } from './forceProfileSync';

export async function handleFlameDetection(message: Message): Promise<void> {
  const embed = message.embeds[0];
  const playerName = embed.author?.name.split('—')[0].trim();
  const guildId = message.guild?.id;
  if (!playerName || !guildId) return;

  const userId = await tryFindUserIdByName(message.guild, playerName);
  if (!userId) return;

  const { eternityFlames: flames } = parseInventoryEmbed(embed);
  if (!flames) return;

  // 🔥 Fetch current profile so we can update ONLY the flames field
  const profile = await getEternityProfile(userId);
  const currentEternity = profile?.current_eternality ?? 0;
  const lastUnsealTT = profile?.last_unseal_tt ?? null;
  const username = profile?.username ?? null;
  const swordTier = profile?.sword_tier ?? null;
  const swordLevel = profile?.sword_level ?? null;
  const armorTier = profile?.armor_tier ?? null;
  const armorLevel = profile?.armor_level ?? null;

  await saveOrUpdateEternityProfile(
    userId, guildId,
    currentEternity,
    flames,
    null, null,
    lastUnsealTT,
    username,
    swordTier,
    swordLevel,
    armorTier,
    armorLevel,
    null, null
  );
}

  export async function handleProfileEmbed(message: Message): Promise<void> {
    const embed = message.embeds[0];
    if (!embed?.fields?.length) return;

    const progressField = embed.fields.find(f => f.name.toLowerCase().includes("progress"))?.value || "";
    const match = progressField.match(/time travels\*\*: (\d+)/i);
    const tt = match ? parseInt(match[1]) : null;
    if (!tt) return;

    const playerName = embed.author?.name?.split("—")[0]?.trim();
    const guildId = message.guild?.id;
    if (!playerName || !guildId) return;

    const userId = await tryFindUserIdByName(message.guild, playerName);
    if (!userId) return;

    await cacheTimeTravels(userId, tt); // in-memory
    await persistTTCache(userId, guildId, tt); // persist to DB
  }

export async function handleEternalProfileEmbed(message: Message): Promise<void> {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const embed = message.embeds[0];
  const playerName = embed.author?.name?.split("—")[0]?.trim();
  if (!playerName) return;

  const userId = await tryFindUserIdByName(message.guild, playerName);
  if (!userId) return;

  const parsed: EternalEmbedData = parseEternalEmbed(embed);
  if (parsed._error) {
    console.warn(`[WARN] parseEternalEmbed failed: ${parsed._error}`);
    return;
  }

  await saveOrUpdateEternityProfile(
    userId, guildId, parsed.eternalProgress, null, null, null,
    parsed.lastUnsealTT, playerName, parsed.swordTier,
    parsed.swordLevel, parsed.armorTier, parsed.armorLevel,
    null, null
  );

  await forceProfileSync(userId, guildId);

  // Always pass both userId and guildId to plan/profile fetch!
  const [plan, updatedProfile] = await Promise.all([
    getEternityPlan(userId, guildId),
    getEternityProfile(userId, guildId)
  ]);

  if (plan && updatedProfile) {
    const unsealCost = (et: number) => 25 * Math.max(et, 200) + 25;
    const discount = (updatedProfile.sword_tier >= 6 && updatedProfile.armor_tier >= 6) ? 0.8 : 1;
    const flamesNeeded = Math.floor(unsealCost(updatedProfile.current_eternality) * discount);

    const ttGained = plan.ttGoal - (updatedProfile.last_unseal_tt || 0);
    const bonusMultiplier = 1 + (plan.daysSealed * 0.01);
    const bonusTTEst = Math.floor(
      updatedProfile.current_eternality *
      (ttGained + plan.daysSealed / 15) *
      3 / 2500 *
      bonusMultiplier
    );

    await updateEternityPlan(userId, guildId, {
      bonus_tt_estimate: bonusTTEst,
      flames_needed: flamesNeeded
    });
  }
}


export async function handleEternalDungeonVictory(message: Message): Promise<void> {
  const guildId = message.guild?.id;
  const embed   = message.embeds[0];
  const author  = embed.author?.name?.split('—')[0]?.trim();
  if (!guildId || !author) return;

  const userId = await tryFindUserIdByName(message.guild, author);
  if (!userId) return;

  const { flamesEarned, _error } = parseDungeonEmbed(embed);
  if (_error) {
    console.warn(`⚠️ Failed to parse dungeon win: ${_error}`);
    return;
  }
  if (!flamesEarned) return;

  // Use the time of the detected embed as winDate
  const rawDate = new Date(message.createdTimestamp);
  const winDateStr = rawDate.toISOString().slice(0, 19).replace('T', ' ');

  await addEternalDungeonWin(userId, guildId, flamesEarned, winDateStr);
  await forceProfileSync(userId, guildId);
}

const pendingUnseals = new Map<string, {
  userId: string,
  guildId: string,
  flamesCost: number,
  unsealDate: Date,
  currentEternity: number,
  username: string
}>();

export async function handleEternalUnsealMessage(message: Message): Promise<void> {
  if (message.author.bot || !message.guild) return;
  const guildId = message.guild.id;
  const text = message.content.trim();

  // 1️⃣ Look for the "unsealed the eternity" line
  const unsealLine = text.match(
    /^(\S+)\s+unsealed the eternity for\s*([\d,]+)\s*<:eternityflame:.*?>/i
  );
  if (unsealLine) {
    const playerName = unsealLine[1];
    const flamesCost = parseInt(unsealLine[2].replace(/,/g, ''), 10);
    const userId = await tryFindUserIdByName(message.guild, playerName);
    if (!userId) return;

    const profile = await getEternityProfile(userId, guildId);
    const currentEternity = profile?.current_eternality ?? 0;
    const username = profile?.username || playerName;

    pendingUnseals.set(message.channel.id, {
      userId,
      guildId,
      flamesCost,
      unsealDate: new Date(message.createdTimestamp),
      currentEternity,
      username
    });
    return;
  }

  // 2️⃣ Look for the "got X time travels" line
  const ttLine = text.match(
    /^(\S+)\s+got\s*([\d,]+)\s*<:timetravel:.*?>/i
  );
  if (ttLine) {
    const pending = pendingUnseals.get(message.channel.id);
    if (!pending) return;

    const bonusTT = parseInt(ttLine[2].replace(/,/g, ''), 10);


    // 3️⃣ Write to DB
    await addEternalUnseal(
      pending.userId,
      pending.guildId,
      pending.flamesCost,
      pending.currentEternity,
      bonusTT,
      pending.username,
      pending.unsealDate
    );
    // 4️⃣ Refresh and react
    await forceProfileSync(pending.userId, pending.guildId);
    await message.react('🔓');

    // 5️⃣ Update plan with new metrics
    const [plan, updatedProfile] = await Promise.all([
      getEternityPlan(pending.userId, pending.guildId),
      getEternityProfile(pending.userId, pending.guildId)
    ]);
    if (plan && updatedProfile) {
      const costFn = (et: number) => 25 * Math.max(et, 200) + 25;
      const hasT6 = updatedProfile.sword_tier >= 6 && updatedProfile.armor_tier >= 6;
      const flamesNeeded = Math.floor(costFn(updatedProfile.current_eternality) * (hasT6 ? 0.8 : 1));
      const ttGained = plan.ttGoal - (updatedProfile.last_unseal_tt || 0);
      const bonusMult = 1 + (plan.daysSealed * 0.01);
      const bonusEstimate = Math.floor(
        updatedProfile.current_eternality * (ttGained + (plan.daysSealed/15)) * 3/2500 * bonusMult
      );
      await updateEternityPlan(pending.userId, pending.guildId, {
        bonus_tt_estimate: bonusEstimate,
        flames_needed: flamesNeeded
      });
    }

    pendingUnseals.delete(message.channel.id);
  }
}